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
content/posts/    the blog: YYYY-MM-DD-slug.md (date in name, title in the H1)
build.mjs         marked + a renderer that re-emits the syntax as dimmed spans
style.css         the look (light + dark, pure CSS, no JS on pages)
dist/             generated: one .html + one raw .md per page, plus the
                  /posts index (titles + ledes), feed.xml (atom) and
                  feed.md (agent digest)
.githooks/        post-commit hook that rebuilds dist/
```

## usage

```sh
npm install            # once
npm run build          # or let the post-commit hook do it
npm run watch          # rebuild on save
git config core.hooksPath .githooks   # one-time, enables the hook
```

- add a page: `content/foo.md` → commit → `/foo` (and raw `/foo.md`)
- add a post: `content/posts/YYYY-MM-DD-slug.md` → commit → the page
  `/posts/YYYY-MM-DD-slug`, listed at `/posts` under a short lede (first
  two sentences, `…` if cut), and in `feed.xml` (atom — the lede is the
  entry's `<summary>`) and `feed.md` (plain-markdown digest for agents)
- the footer of every page links its raw source; every feed entry links
  the rendered page AND its raw markdown

## deploy

`dist/` is fully static — point any static host (or an rsync target) at it
and aim `burke.md` at it. The build emits a `_headers` file so Cloudflare
serves `.md` as `text/markdown` (RFC 7763) and `feed.xml` as
`application/atom+xml`; other hosts fall back to `text/plain` for markdown,
which is fine.

Currently hosted on Cloudflare (workers with static assets, `wrangler.json`),
deployed automatically on every push to the GitHub repo.
