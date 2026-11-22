---
layout: page
title: Archive
description: Everything, newest first.
permalink: /archive/
---

{%- assign years = site.posts | group_by_exp: "p", "p.date | date: '%Y'" -%}
{%- for year in years -%}
<section class="archive-year">
  <h2>{{ year.name }} <span>{{ year.items | size }}</span></h2>
  <ul class="post-list">
    {%- for post in year.items -%}
    {%- assign cat = post.categories | first -%}
    <li><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>{% include category-pill.html category=cat %}<time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%-d %b' }}</time></li>
    {%- endfor -%}
  </ul>
</section>
{%- endfor -%}
