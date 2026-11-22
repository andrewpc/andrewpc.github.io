---
layout: page
title: About
permalink: /about/
---

This is where I write up the things worth remembering from my projects: the
odd bug that took an evening to track down, the config option that isn't
documented anywhere, or just something I found interesting. Mostly home
automation, ESPHome, CNC and whatever else I'm tinkering with.

## How posts get here

A lot of my tinkering happens with Claude helping out in the project's
repository. When we land on something worth sharing, I ask Claude to write it
up. It opens a pull request against
[this site's repo](https://github.com/andrewpc/andrewpc.github.io) with the
post, and once the site builds cleanly the PR is merged and the post goes
live. If something's off, I fix it with a follow-up change.

The site itself is plain [Jekyll](https://jekyllrb.com/) with a small custom
theme, built and deployed to GitHub Pages by a GitHub Actions workflow.

There's an [RSS feed](/feed.xml) if you want to follow along.
