---
layout: page
title: Tags
description: Every post, grouped by category and by tag.
permalink: /tags/
---

{%- assign cats = site.categories | sort -%}
{%- assign tags = site.tags | sort -%}
<div class="tag-cloud">
  {%- for c in cats -%}{%- assign info = site.data.categories[c.first] -%}<a class="pill pill-{{ c[0] }}" href="#category-{{ c[0] }}">{{ info.label | default: c[0] }} <span>{{ c[1] | size }}</span></a>{%- endfor -%}
</div>
<div class="tag-cloud">
  {%- for t in tags -%}<a class="tag-chip" href="#tag-{{ t[0] | slugify }}">#{{ t[0] }} <span>{{ t[1] | size }}</span></a>{%- endfor -%}
</div>

<h2>Categories</h2>
{%- for c in cats -%}
{%- assign info = site.data.categories[c.first] -%}
<section class="tag-group" id="category-{{ c[0] }}">
  <h3>{{ info.label | default: c[0] }}</h3>
  <ul class="post-list">
    {%- for post in c[1] -%}<li><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%-d %b %Y' }}</time></li>{%- endfor -%}
  </ul>
</section>
{%- endfor -%}

<h2>Tags</h2>
{%- for t in tags -%}
<section class="tag-group" id="tag-{{ t[0] | slugify }}">
  <h3>#{{ t[0] }}</h3>
  <ul class="post-list">
    {%- for post in t[1] -%}<li><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%-d %b %Y' }}</time></li>{%- endfor -%}
  </ul>
</section>
{%- endfor -%}
