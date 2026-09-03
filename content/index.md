# burke.md

This site is written in [markdown](https://daringfireball.net/projects/markdown/) and it shows it.
The `#`, the `**`, the `-` you are reading are not decoration — they are the source.
Every page is a plain `.md` file, compiled at commit time into HTML with the
syntax left in place: the markup is styled, but never hidden.

## links

- [about](/about) — the person behind the domain, and the principles
- [posts](/posts) — the blog, newest first
- [feed](/feed.xml) — the atom feed · [feed.md](/feed.md) — the same thing, for agents
- [this page's source](/index.md) — every page has a raw twin, linked from its footer

## how it works

- write a page in `content/`
- commit it
- a post-commit hook compiles it with [marked](https://marked.js.org) and a renderer that re-emits the syntax as dimmed spans
- the rendered page and the raw file live side by side

## the elements

### headings

#### get smaller as they go

##### all the way down

###### to h6

### emphasis

**bold** keeps its asterisks, *italic* keeps its single ones, ~~struck~~ keeps its tildes,
and `inline code` keeps its backticks.

### links

[the commonmark spec](https://spec.commonmark.org/) — the brackets and the URL are part of the page,
the text is the only part that's clickable.

### lists

1. write
2. commit
3. done

nested too:

- outer item
  - inner item
  - another inner item

### quotes

> Markdown is intended to be as easy to read and easy to write as is feasible.
>
> Readability should be emphasized above all else.
> — [John Gruber](https://daringfireball.net/)

### code

```js
// markdown in, markdown-styled HTML out
build(content, dist);
```
