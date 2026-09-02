# burke.md — the site

A site that is literally markdown. Content lives in `content/` as plain `.md`
files. At build time each file is compiled to HTML with the markdown syntax
**left visible**: `# ` stays in headings (and the text scales by level),
`**bold**` keeps its asterisks, links render as `[text](url)`, lists keep
their `- `, quotes keep their `> `, code keeps its backticks — all syntax
markers dimmed, all semantics styled.

## layout

```
content/*.md      the pages (source of truth)
build.mjs         marked + a renderer that re-emits the syntax as dimmed spans
style.css         the look (light + dark, pure CSS, no JS on pages)
dist/             generated: one .html + one raw .md per page + style.css
.githooks/        post-commit hook that rebuilds dist/
```

## usage

```sh
npm install            # once
npm run build          # or let the post-commit hook do it
npm run watch          # rebuild on save
git config core.hooksPath .githooks   # one-time, enables the hook
```

- add a page: `content/foo.md` → commit → `/foo.html` (and raw `/foo.md`)
- the footer of every page links its raw source

## deploy

`dist/` is fully static — point any static host (or an rsync target) at it
and aim `burke.md` at it. The only runtime requirement is that `.md` files
serve as `text/markdown` (most static servers fall back to `text/plain`,
which is fine).
