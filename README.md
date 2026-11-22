# andrewpc.github.io

Source for [andrewpc.github.io](https://andrewpc.github.io): a Jekyll blog of
interesting finds and troubleshooting write-ups, deployed with GitHub Actions.

- New posts arrive as pull requests and are merged (published) once the build
  passes, unless Andrew asks to review first.
- How to write and submit a post (for people and for Claude): see [CLAUDE.md](CLAUDE.md).
- The theme is custom and lives in `_layouts/`, `_includes/`, `_data/categories.yml`
  and `assets/` (dark/light mode, search, tag pages, code-block copy buttons).
- Post template: [`_templates/post.md`](_templates/post.md).

```bash
bundle install
bundle exec jekyll serve
```
