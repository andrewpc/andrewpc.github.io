---
title: "Restoring a Boxford TCL 240 CNC lathe: strip, paint and a full rewire"
date: 2025-06-24 12:00:00 +1000
description: >-
  How I took a rough, half-converted Boxford TCL 240 training lathe from
  Facebook Marketplace to a clean, safe machine in about five months:
  chemical strip, primer and green enamel, a rewired electrical tray with a
  proper e-stop contactor, a new aluminium control panel, and a gas strut for
  the guard.
categories: [project-notes]
tags: [cnc, lathe, masso, restoration]
image: /assets/images/posts/boxford-lathe-restoration/finished.jpg
---

In January 2025 I bought a Boxford TCL 240 CNC lathe off Facebook Marketplace
for $4,000. A previous owner had already started converting it: a Masso G3
controller, NEMA 34 closed-loop steppers on both axes, and a 1 hp induction
motor on a VFD for the spindle. The parts were good but the machine was not.
The paint was chipped and rusting, the wiring was loose and questionable, and
there was no e-stop that actually cut power. Over the next five months I
stripped it to bare metal, repainted it, rewired the electrical tray from
scratch, and made a new control panel. This post covers that restoration.

![The finished Boxford TCL 240 in green, with the new black control panel, e-stop and the original Boxford badge](/assets/images/posts/boxford-lathe-restoration/finished.jpg)

*I'm writing this up in late 2026, after I'd already posted about the lathe's
[spindle encoder](/2026/10/31/boxford-lathe-spindle-encoder/) and its
[servo spindle](/2026/11/22/boxford-lathe-servo-spindle-part-1/). It's dated
to when the restoration finished so it sits in the right place in the timeline.*

## What I bought

The TCL 240 is Boxford's "Training Computer Lathe": a small bench-height CNC
lathe on a sheet-steel stand, with the bed mounted on a sloping back panel,
a four-step belt drive (40 to 3,200 rpm across the ranges) and a clear guard
over the work area. Mine arrived like this:

![The lathe as bought: chipped grey paint, a scratched and dirty guard, and a keyboard sitting on the chip tray](/assets/images/posts/boxford-lathe-restoration/as-bought.jpg)

![Close-up as bought: surface rust on the slides and cross-slide covers, a hand-painted yellow tailstock, and the stepper cables hanging loose](/assets/images/posts/boxford-lathe-restoration/as-bought-slides.jpg)

The previous owner's conversion was a decent starting point:

- **Controller:** Masso G3 (lathe version).
- **Axes:** StepperOnline NEMA 34 closed-loop steppers on X and Z, each with
  its own closed-loop driver.
- **Spindle:** a 1 hp three-phase induction motor driven by a 1.5 kW Folinn
  BD600 VFD (240 V single-phase in).
- **Spindle encoder:** a timing belt from the spindle to a separate encoder
  on the back of the headstock.

The execution was the problem. Inside the electrical tray, everything was
loosely laid out with no cable duct. The mains filter hung off spade
connectors, earths ran all over the place, and the only e-stop was the one on
the handwheel pendant, which just told the Masso to stop. Nothing actually cut
power to the motors.

![The electrical tray as bought: Masso G3, two red stepper drivers, the VFD and a power supply, with wires running loose across the panel](/assets/images/posts/boxford-lathe-restoration/wiring-before.jpg)

![Under the hood as bought: a tangle of cable, the 12 V supply sitting loose and the blue spindle motor](/assets/images/posts/boxford-lathe-restoration/wiring-before-motor.jpg)

The spindle encoder setup didn't last. It wasn't balanced or suited to the
speeds, and it failed badly. I replaced it early in the restoration and later
redid it properly using the lathe's original encoder disc; that's covered in
the [spindle encoder post](/2026/10/31/boxford-lathe-spindle-encoder/).

![The back of the headstock with the previous owner's encoder: a timing belt from the spindle down to a separate encoder pulley](/assets/images/posts/boxford-lathe-restoration/old-encoder.jpg)

## Stripping it back

I took everything off the stand that would come off: the carriage, the
motors, the tray, the guard and all the covers. Then I stripped the paint with
Selleys chemical paint stripper. It's messy work: brush it on, wait, scrape off
the sludge, repeat. The original paint came off in layers, with rust
underneath in the usual places.

![Partway through stripping: grey and white paint residue all over the stand, with a bucket and rags on a drop sheet](/assets/images/posts/boxford-lathe-restoration/stripping.jpg)

After a few rounds of stripper, scraping and a wash-down it was back to bare
steel, with the bed and spindle still in place.

![The stand stripped to bare steel, with the chuck and bed still mounted](/assets/images/posts/boxford-lathe-restoration/bare-metal.jpg)

## Primer and paint

I masked the bed and the spindle nose, then primed everything.

![The stand in white primer, with the bed and spindle masked in blue tape and a primed cover panel on the floor](/assets/images/posts/boxford-lathe-restoration/primer.jpg)

For the top coat I used green Rust-Oleum enamel, for no better reason than
that I like it. A few coats later it had the deep gloss I was after.

![The stand in gloss green enamel, still masked](/assets/images/posts/boxford-lathe-restoration/green.jpg)

By late February it was back on its castors with the bed, headstock and badge
refitted.

![The lathe reassembled in green, with the bed and headstock back on and the Boxford 240 TCL badge refitted](/assets/images/posts/boxford-lathe-restoration/reassembled.jpg)

## Rewiring the electrical tray

The electrical tray is a hinged panel under the hood. I kept the main parts
(the Masso, the two stepper drivers, the VFD, the 48 V stepper supply and the
12 V supply) and rebuilt everything around them:

- **Cable duct** around and between everything, so no loose runs across the
  panel.
- **DIN rail** with Wago terminal blocks for mains distribution and earths.
- **A 20 A EMI filter** mounted properly on the rail, instead of hanging off
  crimps.
- **A braking resistor** on the VFD, so the spindle can stop quickly without
  the VFD tripping on over-voltage.
- **A contactor and circuit breaker** on the back wall. The e-stop drops the
  contactor, which cuts power to everything. The pendant's e-stop still
  signals the Masso, so either one stops the machine, but the panel e-stop is
  the one that actually removes power.
- **Conduit and cable glands** for the runs to the motor and up to the
  axes.

![The rebuilt electrical tray: Masso G3 and stepper drivers on the left, the stepper power supply in the middle, the EMI filter and Wago terminals on DIN rail, and the VFD on the right, all inside white slotted duct. The contactor, breaker and 12 V supply sit on the back wall next to the blue spindle motor](/assets/images/posts/boxford-lathe-restoration/wiring-after.jpg)

## A new control panel

The original front panel was a mess of old holes. I made a new one, first
3D printed to try the layout, then CNC cut from 3 mm aluminium. It has:

- Green **On** and red **Off** buttons for the contactor.
- A programmable keypad for numeric entry and macros on the Masso.
- Five stainless push buttons that can be mapped to any Masso input.
- A separate **E-STOP** plate under the panel, above the original Boxford
  badge.

![The 3D-printed test panel fitted, with the On/Off buttons, keypad, five push buttons and e-stop](/assets/images/posts/boxford-lathe-restoration/panel-printed.jpg)

![The final black aluminium panel next to the original spindle speed chart](/assets/images/posts/boxford-lathe-restoration/panel-aluminium.jpg)

A year later I gave the keypad custom keycaps with the Masso functions printed
on them (Cycle Start, Feed Hold, Home, jog keys for X and Z, Zero and so on), and the five
push buttons now have coloured LED rings.

![The panel in 2026: colour-coded keycaps labelled Cycle Start, Feed Hold, Home, X+, X-, Z+, Z-, MDI, Prog, Jog and Tools, and five illuminated push buttons in green, red, orange, blue and white](/assets/images/posts/boxford-lathe-restoration/keypad-legends.jpg)

## Finishing touches

The clear guard is heavy and used to need holding up while I loaded work. A
new 250 N gas strut (220 mm) now holds it open.

<video controls muted playsinline preload="metadata"
       poster="/assets/images/posts/boxford-lathe-restoration/guard-strut-poster.jpg"
       style="width:100%;height:auto">
  <source src="/assets/images/posts/boxford-lathe-restoration/guard-strut.mp4" type="video/mp4">
  The guard opening and closing on its new gas strut.
</video>

I also milled a riser block for the cross-slide. It sits under a solid
rear-mount toolpost, which brings the tool to centre height behind the work.

I also cut down the quick-change toolpost handle and printed a green knob for
the end of it.

![The milled riser block bolted to the cross-slide, below the X-axis stepper](/assets/images/posts/boxford-lathe-restoration/riser-block.jpg)

## Where it ended up

From buying it in mid January to the finished tray in early March took about
seven weeks of evenings and weekends, with the riser block, the strut and other
small jobs running on until about June. The result is a machine that looks the part,
has wiring I trust, and has an e-stop that actually cuts the power.

![The finished lathe in the workshop, with the guard open and the tailstock in place](/assets/images/posts/boxford-lathe-restoration/hero.jpg)

In May I checked the spindle runout with a Mitutoyo test indicator (0.01 mm
divisions) on a ground pin held in an ER collet chuck. The needle barely moves
as the spindle turns.

<video controls muted playsinline preload="metadata"
       poster="/assets/images/posts/boxford-lathe-restoration/runout-poster.jpg"
       style="display:block;max-width:100%;max-height:640px;margin:0 auto">
  <source src="/assets/images/posts/boxford-lathe-restoration/runout.mp4" type="video/mp4">
  A test indicator on a ground pin in the collet chuck, barely moving as the spindle turns.
</video>

Since then I've kept going: the
[spindle encoder](/2026/10/31/boxford-lathe-spindle-encoder/) is now done
properly on the original disc, and the induction motor and VFD are being
replaced with a [servo spindle](/2026/11/22/boxford-lathe-servo-spindle-part-1/).

## Takeaways

- **A half-finished conversion is a good buy if the parts are right.** The
  Masso, closed-loop steppers and VFD were all worth keeping. What needed
  redoing was how they were installed.
- **Put an e-stop on a contactor.** An e-stop that only signals the controller
  still leaves the motors powered. A contactor in front of everything is cheap
  and simple.
- **Chemical stripper works, but plan for the mess.** Use a big drop sheet,
  gloves, plenty of rags, and a bucket of water for the wash-down.
- **Print a panel before you cut it.** The printed version caught layout
  problems before I cut the aluminium.
