---
title: "pfSense Plus 26.07.2 on an SG-3100: no LAN after upgrade, caused by one line of config.xml"
date: 2026-11-22 11:50:00 +1100
description: >-
  After upgrading my Netgate SG-3100 to pfSense Plus 26.07.2, the LAN was dead:
  no DHCP, no traffic, no GUI. A leftover one-value syslog entry in config.xml
  crashed the boot script before any interfaces were configured.
categories: [troubleshooting]
tags: [pfsense, netgate, sg-3100, networking]
---

I upgraded my Netgate SG-3100 from pfSense Plus 26.03.1 to 26.07.2, and the
LAN died completely: no DHCP leases, no traffic and no web GUI. The cause was
one line in `config.xml`, `<syslog>1</syslog>`. In 26.07.2 that value makes
PHP throw a fatal `TypeError` while syslogd is starting at boot, which kills
`/etc/rc.bootup` before it configures any interfaces. Running
`/etc/rc.reload_all` from the console got me back online, and replacing that
element with a proper `<syslog>` section fixed it for good.

## Symptoms

The upgrade reported success, and the console menu still listed WAN and LAN
addresses. In practice:

- Clients got no DHCP lease, and a client with a static IP couldn't reach the
  router.
- `/var/log/system.log` stopped at the upgrade's reboot. Nothing was logged
  after that.
- `tcpdump -ni mvneta1` (the LAN parent interface) captured 0 packets.
- `etherswitchcfg` showed all five switch ports as `state=1<DISABLED>`.
- `mvneta1` and `mvneta2` were missing the `UP` flag, and no interface had
  an IPv4 address.
- Kea, Unbound, PHP-FPM and pfBlockerNG were running, but `syslogd` wasn't.

Once I got into the GUI, the Crash Reporter showed this, once for each boot:

```text
PHP Fatal error:  Uncaught TypeError: array_get_path(): Argument #1 ($arr) must be of type array, string given, called in /etc/inc/syslog.inc on line 248 and defined in /etc/inc/util.inc:4790
Stack trace:
#0 /etc/inc/syslog.inc(248): array_get_path()
#1 /etc/rc.bootup(264): system_syslogd_start()
#2 {main}
  thrown in /etc/inc/util.inc on line 4790
```

Trying to save **Status > System Logs > Settings** crashed the same way.

## Environment

- Hardware: Netgate SG-3100 (32-bit ARM; the LAN ports are on an internal
  Marvell switch connected to `mvneta1`)
- Upgrade: pfSense Plus 26.03.1 → 26.07.2 (FreeBSD 16.0-CURRENT kernel)
- DHCP backend: Kea
- Packages: pfBlockerNG-devel and a few others
- Access while broken: serial console only

## What didn't work

I spent a while chasing things that turned out to be side effects:

- **pfBlockerNG.** It's a common culprit after upgrades, but the upgrade log
  showed it reinstalled cleanly.
- **A half-finished upgrade.** I suspected this because the log stopped at the
  reboot, but `/etc/version` and `uname -a` both showed 26.07.2. The upgrade
  had completed.
- **The switch.** Setting the disabled switch ports to forwarding by hand
  changed nothing.
- **Bringing the interface up by hand.** `ifconfig mvneta1 up` got packets
  flowing (the `netstat -I mvneta1` counters started climbing), but there was
  still no IP address, so DHCP couldn't work.

That last step was the real clue. If no interface has its configured IP, the
boot never reached interface configuration.

## Root cause

My `config.xml` had this at the top level:

```xml
<syslog>1</syslog>
```

pfSense expects `<syslog>` to be a section of nested settings. Mine was a
plain string, probably left over from a much older version or an old manual
edit. 26.03.1 booted with it fine, but in 26.07.2 this line in
`/etc/inc/syslog.inc` refuses it:

```php
$log_level_default = array_get_path($syslogcfg, 'default_log_level');
```

`array_get_path()` requires an array, so a string throws an uncaught
`TypeError`. That happens inside `system_syslogd_start()`, which
`rc.bootup` calls at line 264. The fatal error ends the boot script there, so
nothing after it runs. That includes interface configuration, which is why
there were no IPs, the interfaces weren't up and the switch ports stayed
disabled.

## The fix

1. **Get the network back.** From the serial console, choose option 8
   (Shell) and re-apply the whole config by hand:

    ```bash
    /etc/rc.reload_all
    ```

    That brought up the interfaces, firewall and services, and the GUI became
    reachable at `https://192.168.1.1`.

2. **Fix the config.** In **Diagnostics > Edit File**, load `/conf/config.xml`,
   search for `<syslog`, and replace the scalar element with a real section:

    ```xml
    <syslog>
        <filterdescriptions>1</filterdescriptions>
    </syslog>
    ```

    Any child element makes it parse as an array. `filterdescriptions` is a
    normal syslog setting, so it's harmless. Save the file.

3. **Clear the cached config.** In **Diagnostics > Command Prompt**:

    ```bash
    rm /tmp/config.cache
    ```

4. **Re-save the syslog settings.** Go to **Status > System Logs > Settings**
   and click Save. It succeeded this time and filled in the rest of the
   defaults.

5. **Clear the crash report and reboot.** After a cold reboot, the LAN, DHCP
   and logging all came up on their own, with no console help.

To check whether your config has the same problem before you upgrade:

```bash
grep -n '<syslog>' /conf/config.xml | head -1
```

If that line shows a value between the tags (like `<syslog>1</syslog>`) instead
of nested elements, fix it first.

## Takeaways

- **If the boot dies partway, every later step looks broken too.** I saw no
  IPs, interfaces down, disabled switch ports and no logging, and they all came
  from one crash early in `rc.bootup`.
- **Check PHP errors first.** On pfSense, the Crash Reporter (or the PHP error
  log) would have pointed straight at the cause. I only saw it once the GUI was
  back.
- **`/etc/rc.reload_all` is a good way back in.** When the boot hasn't
  configured the network, it does from the console what the boot should have
  done.
- **Old config.xml files can carry leftovers.** Values a previous version
  tolerated can break when newer code gets stricter about types.
