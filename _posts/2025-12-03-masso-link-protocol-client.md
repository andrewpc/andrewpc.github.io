---
title: "Reverse engineering MASSO Link: a command line client for the MASSO controller"
date: 2025-12-03 23:30:00 +1100
description: >-
  I wanted to send G-code to my MASSO-controlled lathe from scripts and a watched
  folder, so I captured MASSO Link's UDP traffic, worked out the packet format,
  and wrote a dependency-free Python client that uploads files, reads the tool
  table and monitors machine status.
categories: [project-notes]
tags: [cnc, lathe, masso, python, networking, reverse-engineering]
source_project: andrewpc/masso-link-protocol-client
---

The MASSO controller on my lathe can take files over the network, but only
through MASSO Link, the official desktop app: you pick a file, click send, and
do it again for the next one. I wanted to save a file from CAM and have it turn
up on the controller by itself. So I captured the traffic between MASSO Link
and the controller with [Wireshark](https://www.wireshark.org/), worked out the protocol, and wrote
[masso-link-protocol-client](https://github.com/andrewpc/masso-link-protocol-client),
a single Python file with no dependencies that can upload files, watch a folder
and upload whatever changes, read the tool table and show live machine status.

It's unofficial and experimental. I've only tested it on my own controller in
Lathe mode, so treat everything below as "works on my machine" until someone
tries it on a mill, router or plasma table.

## What MASSO Link was missing

The things I actually wanted were all about not clicking:

- **A watched folder.** Point it at the directory my CAM post-processor writes
  to, and any new or changed `.nc` file gets uploaded.
- **Several files at once**, from the command line, including shell globs.
- **Scripting.** Something I can call from other tools, or eventually from a
  post-processor step.
- **Understanding the protocol**, so other people can build on it too.

## The protocol

Everything goes over UDP. In Wireshark, a display filter of
`udp.port == 65535` shows just the MASSO conversation. The controller sends from port 65535, and there's a
quirk that took a while to notice: it sends its replies to port **11000**,
regardless of which port the request came from (sometimes it also replies to
the sender's port). MASSO Link sends from an ephemeral port and still hears
back on 11000. My client binds the first free port from 11000 to 11050 and
runs a background thread to listen.

That quirk also means you shouldn't run two clients at once, or this client
alongside MASSO Link: both end up seeing the same replies and get confused
about which ACK belongs to whom.

Every packet has the same shape:

```text
[CRC16 2 bytes][magic 0x03 0x00][type 1 byte][payload ...]
```

The checksum is CRC16-CCITT (polynomial `0x1021`, initial value `0x0000`)
over everything after the CRC, stored little-endian. Once I had that right,
I could build every packet from scratch instead of replaying captured bytes:

```python
def crc16_ccitt(data: bytes) -> bytes:
    crc = 0x0000
    for byte in data:
        crc ^= byte << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if crc & 0x8000 else (crc << 1)
            crc &= 0xFFFF
    return crc.to_bytes(2, "little")

def packet(ptype: int, payload: bytes) -> bytes:
    body = bytes([0x03, 0x00, ptype]) + payload
    return crc16_ccitt(body) + body
```

The packet types I've identified so far:

| Type | What it does | Reply |
|---|---|---|
| `0x02` | Discovery. The reply carries a version string such as `@Lathe v5.09`. | 46 bytes |
| `0x03` | Configuration. The reply carries the controller's serial number (the numeric part, as a little-endian 16-bit value). | 10 bytes |
| `0x01` | Keepalive, sent about once a second. The reply is a 270-byte status packet. | 270 bytes |
| `0x08` | Tool request for one tool index. The reply has the tool's name. | 38 bytes |
| `0x0A` | Start upload: file size and remote file name. | 10-byte ACK |
| `0x0B` | Upload data chunk: chunk index, length, data. | 10-byte ACK |

### Uploading a file

An upload is a start packet followed by numbered chunks, each one ACKed by the
controller before the next is sent:

1. Send `0x0A` with the file size (4 bytes, little-endian) and the remote name.
2. Wait for the `0x0A` ACK.
3. Send the file in 1422-byte chunks as `0x0B` packets, each with the chunk
   index (not a byte offset) and the chunk's length.
4. Wait for a `0x0B` ACK after each chunk, and retry if it doesn't arrive
   within two seconds (up to three retries).

You can try it with:

```bash
git clone https://github.com/andrewpc/masso-link-protocol-client.git
cd masso-link-protocol-client

# one file, or several
python masso_udp_client.py --host 192.168.1.x --upload part.nc
python masso_udp_client.py --host 192.168.1.x --upload *.nc --date-prefix

# upload anything that changes in a folder
python masso_udp_client.py --host 192.168.1.x --watch /path/to/cam/output
```

`--date-prefix` puts an `MMDD-` prefix on the remote name (`1203-part.nc`), so
files sort by date on the controller and I can tell today's version from last
week's at a glance.

Watch mode keeps a `.masso_watch_state.json` in the watched folder with each
file's size and modification time, so restarting the client doesn't upload
everything again, and a file that failed or has an invalid name isn't retried
in a tight loop.

### Reading machine status

The 270-byte status packet that comes back from each keepalive is where most
of the unknowns are. So far I'm confident about the loaded file's name (bytes
17 to 80, null-terminated) and a line counter, and I've mapped a few other
bytes that change with the machine's state. `--monitor` prints the fields
whenever they change, and there's an experimental feed hold detector: if the
machine says it's running but the line counter hasn't moved for 1.5 seconds,
it's probably in feed hold.

```bash
python masso_udp_client.py --host 192.168.1.x --monitor --duration 30
```

### Tools for poking at the protocol

Most of the client exists to help work out the rest of the protocol:

- `--debug` prints every raw packet, but filters out the repetitive keepalive
  replies and identical status packets, so you only see what changed.
- `--test-packet "<hex>"` sends one raw packet and captures the reply, and
  `--test-sequence file.txt` sends a list of them.
- `--log` writes a timestamped log of the session.

I've written up everything I know in
[PROTOCOL_SPEC.md](https://github.com/andrewpc/masso-link-protocol-client/blob/main/PROTOCOL_SPEC.md),
including which parts are still guesses.

## Things that bit me

- **The reply port.** Replies go to port 11000, not necessarily back to the
  port you sent from, so the client has to listen there.
- **File names.** At first I limited remote names to 15 characters, because
  that's what fitted the fixed-size start packet I'd seen in the captures. It
  turned out the packet just grows (see the update below).
- **Empty files.** A 0-byte file has no chunks to send, so the client now
  refuses it up front with a clear message.

## Update: what changed in 2026

I've kept working on the client since this post, and other MASSO owners have
helped. A few things I got wrong or didn't know in December:

- **Status bytes.** Testing on a MASSO plasma controller running v5.10 by
  [FabLabRacing](https://github.com/andrewpc/masso-link-protocol-client/issues/2)
  showed that byte 5 is job progress as a percentage and byte 6 is a simple
  "running" flag (`0x02` running, `0x00` not), not the state values I'd
  guessed. Byte 12 drops to `0x00` while the machine waits for the operator,
  for example at a manual tool change or an `M0`.
- **The clock.** The configuration packet sets the controller's clock. My
  early versions sent zeros there, which reset the controller to 12:00 AM
  every time I connected. It now sends the PC's time as
  `[hour, minute, second, day, month, year - 2000]`.
- **Longer file names.** The start packet is padded to a multiple of 4 bytes
  after the CRC (minimum 28), so names can be much longer than 15 characters.
  On my v5.13 lathe, names up to 254 characters were stored intact; 255 were
  kept only as an 8.3 short name; and 256 got no reply and froze the
  controller until I power cycled it. The client now refuses anything over 254.
- **Folders use backslashes.** `MASSO\part.nc` uploads into an existing
  `MASSO` folder; `MASSO/part.nc` gets no reply at all, so the client converts
  `/` to `\`. The folder has to exist already.
- **The last chunk.** A short final chunk is sent at its real length, padded
  with a 1 to 4 byte trailer so the packet after the CRC is a multiple of 4
  bytes. If the trailer is wrong, the controller silently ignores the chunk.
- **Checking ACKs properly.** Each data ACK carries the next chunk index it
  expects, little-endian from byte 6, and the client now checks it.

Someone has also
[ported the client to C](https://github.com/andrewpc/masso-link-protocol-client/issues/1)
so it can be used as a library on things like Arduino.

## Takeaways

- A proprietary protocol is often simpler than it looks. Once the CRC matched,
  this one was a handful of small packet types.
- Generate packets from a model of the protocol, not from replayed captures.
  Several of my "constants" turned out to be timestamps from the capture.
- Build the debugging tools into the client. Raw packet sends, filtered debug
  output and logs found most of the bugs above.
- If you have a MASSO, especially one that isn't a lathe, please try it and
  [open an issue](https://github.com/andrewpc/masso-link-protocol-client/issues)
  with what you find.
