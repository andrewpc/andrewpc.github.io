# Publishing posts to andrewpc.github.io

This repo is Andrew's public blog: a Jekyll site deployed to GitHub Pages by
`.github/workflows/pages.yml`. Anything merged to `main` goes live within a
couple of minutes. **The repo and the site are public.**

Most posts are written by a Claude session working in one of Andrew's *other*
projects, when he says something like "write this up for the blog" after an
interesting find or a troubleshooting session. This file is the contract for
that.

## The workflow (always a pull request)

1. Attach/clone `andrewpc/andrewpc.github.io` (push access) alongside the
   project you're working in.
2. Branch from the latest `main`: `post/<slug>` (e.g. `post/esphome-epd-ghosting`).
3. Add **one** post file in `_posts/`, plus any images in
   `assets/images/posts/<slug>/`.
4. Build locally if you can (see below). At minimum, check the front matter
   against the template.
5. Open a PR titled `Post: <post title>`. The body should have: a one-line
   summary, the source project/repo the post came from, and a checklist of
   anything Andrew should double-check (facts you weren't sure of, things you
   redacted).
6. **Merge it yourself once the PR's build check passes**, unless Andrew
   said not to (for example "don't publish yet", "let me review it first",
   "hold it", or "draft"). Merging is what publishes it, so do the privacy
   scrub below before you open the PR. Use a merge commit, e.g.
   `gh api -X PUT repos/andrewpc/andrewpc.github.io/pulls/<number>/merge -f merge_method=merge`.
   - If the build check fails, fix it on the branch. Never merge a red PR.
   - If Andrew asked you to hold it, leave the PR open and tell him it's
     waiting for his review.
   - Tell Andrew the post's live URL once it's merged.
7. **Never push to `main` directly.** Every change goes through a PR.

To revise a post that's still open, push more commits to the same PR branch.
To fix one that's already published, open a new PR from a fresh branch.

## File name and location

```
_posts/YYYY-MM-DD-short-kebab-slug.md
```

- The date is the day the post is written (Andrew's time zone, Australia/Sydney).
- The slug is lowercase, hyphenated, 3 to 6 words, no dates or project codenames
  that mean nothing to an outsider.
- The URL becomes `/YYYY/MM/DD/short-kebab-slug/`.

Images go in `assets/images/posts/<slug>/` and are referenced as
`![alt text](/assets/images/posts/<slug>/diagram.png)`. Keep them under ~500 KB;
prefer PNG for screenshots, SVG for diagrams. Always write alt text.

Unfinished ideas can go in `_drafts/` (no date in the filename); they are not
published. Normally you'll go straight to `_posts/`; use `_drafts/` if Andrew
wants something saved but not published.

## Front matter

Copy `_templates/post.md`. Fields:

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Plain, specific, sentence case. Quote it if it contains a colon. |
| `date` | yes | `YYYY-MM-DD HH:MM:SS +1100` (or `+1000` outside daylight saving). Must match the filename date. |
| `description` | yes | One or two sentences. Used for the excerpt, SEO and the feed. |
| `categories` | yes | Exactly one of: `troubleshooting`, `til` (today I learned), `project-notes`, `guides`. |
| `tags` | yes | 2 to 6 lowercase tags, e.g. `[esphome, home-assistant, e-paper]`. Reuse existing tags (`grep -h '^tags:' _posts/*`) before inventing new ones. |
| `image` | optional | Card thumbnail and social preview, e.g. `/assets/images/posts/<slug>/hero.jpg`. If omitted, the home page card uses the post's first image, or category placeholder art if it has none. |
| `source_project` | optional | Repo or project the post came from, e.g. `andrewpc/esphome-custom-ada-epd`. Only if the repo is public; otherwise omit. |
| `comments` | optional | Set to `false` to hide the comment box on that post. Comments are on by default. |

`--strict_front_matter` is on in CI, so malformed YAML fails the build.

## Writing style

- Write in the first person as Andrew ("I"), since it's his blog. Keep a plain,
  practical voice: no hype, no "In today's fast-paced world".
- Lead with the point. The first paragraph says what the problem or finding was
  and what fixed it, so a skimmer gets the answer.
- Suggested shape for **troubleshooting** posts:
  1. Symptoms (include exact error messages, since that's what people search for)
  2. Environment (versions, hardware, OS)
  3. What I tried that didn't work, briefly
  4. The root cause
  5. The fix, with copy-pasteable code/config
  6. Takeaways
- **TIL** posts can be short: a few paragraphs and a snippet is fine.
- Use fenced code blocks with a language (` ```yaml `, ` ```bash `, ` ```cpp `).
- Link to upstream docs, issues and PRs you relied on.
- Don't invent results. If something wasn't verified in the session, say so or
  flag it in the PR body for Andrew.

## Privacy and secrets (important: this is public)

Before opening the PR, scrub the post and images for:

- API keys, tokens, passwords, Wi-Fi credentials, `secrets.yaml` contents
- Internal IP addresses, hostnames, MAC addresses, serial numbers
  (replace with `192.168.1.x`, `my-device.local`, etc.)
- Home address, location data, names of family members, email addresses
- Contents of private repos beyond what's needed to explain the point
- Screenshots: crop or blur anything above

List what you redacted in the PR body so Andrew can check it.

## Building locally

```bash
bundle install
bundle exec jekyll serve --drafts    # http://localhost:4000
bundle exec jekyll build --strict_front_matter   # what CI runs
```

The PR's GitHub Actions check runs the same build, so a red check means the
post won't render.

## Don't

- Don't change `_config.yml`, the workflow, or the theme (`_layouts/`,
  `_includes/`, `_data/`, `assets/css/`, `assets/js/`) as part of a post PR.
  Site changes go in their own PR.
- Don't add plugins that aren't in the `Gemfile`.
- Don't put more than one post in a PR unless Andrew asked for a series.
