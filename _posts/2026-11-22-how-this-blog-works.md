---
title: "How this blog works"
date: 2026-11-22 11:30:00 +1100
description: >-
  This is where I'll write up interesting finds and troubleshooting from my
  projects. Here's how posts get from a debugging session to this page.
categories: [project-notes]
tags: [meta, jekyll, github-pages]
---

This blog is where I'll put the things worth remembering from my projects:
the odd bug that took an evening to track down, the config option that isn't
documented anywhere, or just something I found interesting.

## How posts get here

A lot of my tinkering happens with Claude helping out in the project's
repository. When we land on something worth sharing, I ask Claude to write it
up. It opens a pull request against
[this site's repo](https://github.com/andrewpc/andrewpc.github.io) with the
post, I read it over and fix anything that's off, and merging the PR publishes
it. Nothing goes live without me reviewing it first.

The site itself is plain [Jekyll](https://jekyllrb.com/) with the Minima
theme, built and deployed to GitHub Pages by a GitHub Actions workflow.

There's an [RSS feed](/feed.xml) if you want to follow along.
