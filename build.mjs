#!/usr/bin/env node
// burke.md build
// Compiles content/*.md to dist/*.html with the markdown syntax left visible:
// headings keep their "# ", emphasis keeps its * and **, links keep [text](url),
// lists keep their "- ", quotes keep their "> ", code keeps its backticks.
// The raw .md source is copied next to each page and linked from the footer.

import {
  readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, watch, existsSync,
} from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const esc = (s) => String(s)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

// A dimmed syntax marker (the "#" of "# Heading", the "**" of **bold**, ...)
const DIM = (s) => `<span class="md-dim">${s}</span>`;

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return `<h${depth}><span class="md-dim">${'#'.repeat(depth) + ' '}</span>${text}</h${depth}>\n`;
    },
    strong({ tokens }) {
      return `<strong>${DIM('**')}${this.parser.parseInline(tokens)}${DIM('**')}</strong>`;
    },
    em({ tokens }) {
      return `<em>${DIM('*')}${this.parser.parseInline(tokens)}${DIM('*')}</em>`;
    },
    del({ tokens }) {
      return `<del>${DIM('~~')}${this.parser.parseInline(tokens)}${DIM('~~')}</del>`;
    },
    codespan({ text }) {
      return `${DIM('`')}<code>${esc(text)}</code>${DIM('`')}`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const h = href || '';
      const t = title ? ` title="${esc(title)}"` : '';
      return `${DIM('[')}<a href="${esc(h)}"${t}>${text}</a>${DIM('](' + esc(h) + ')')}`;
    },
    blockquote({ tokens }) {
      let body = this.parser.parse(tokens);
      if (body.includes('<p>')) {
        // prefix every line of every quoted paragraph with "> "
        body = body.replace(/<p>([\s\S]*?)<\/p>/g, (_, inner) =>
          '<p>' + inner.split('\n').map((l) => DIM('&gt; ') + l).join('<br>') + '</p>');
      } else {
        body = DIM('&gt; ') + body;
      }
      return `<blockquote>\n${body}\n</blockquote>\n`;
    },
    list({ ordered, start, items }) {
      const base = Number(start) || 1;
      const lis = items.map((it, i) => {
        const marker = ordered ? `${base + i}.` : '-';
        const task = it.task ? DIM(it.checked ? '[x] ' : '[ ] ') : '';
        const body = this.parser.parse(it.tokens);
        return `<li><span class="md-dim md-marker">${esc(marker)}</span>${task}${body}</li>\n`;
      }).join('');
      const tag = ordered ? 'ol' : 'ul';
      const attr = ordered && base !== 1 ? ` start="${base}"` : '';
      return `<${tag}${attr}>\n${lis}</${tag}>\n`;
    },
    hr() {
      return '<hr class="md-hr">\n';
    },
    code({ text, lang }) {
      const fence = '```' + (lang || '');
      const body = text.replace(/\n$/, '');
      return `<pre><code><span class="md-dim">${esc(fence)}</span>\n${esc(body)}\n<span class="md-dim">${esc('```')}</span></code></pre>\n`;
    },
  },
});

// ---------- pages ----------

const CONTENT = 'content';
const DIST = 'dist';

const plain = (s) => s
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replaceAll(/[*_`~#]/g, '')
  .trim();

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90' font-family='monospace' fill='%238a8a82'%3E%23%3C/text%3E%3C/svg%3E";

function pageTemplate({ outName, mdName, rawHref, title, nav, html, extraFooter = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · burke.md</title>
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/style.css">
<link rel="alternate" type="application/atom+xml" title="burke.md" href="/feed.xml">
</head>
<body>
<header>
  <a class="brand" href="/">burke.md</a>
  <nav>${nav}</nav>
</header>
<main>
${html}
</main>
<footer>
  <a class="raw" href="${rawHref}">[ raw ]</a>
  <span class="sep">·</span>
  ${extraFooter}
  <a href="/">[ index ]</a>
</footer>
</body>
</html>
`;
}

function build() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  const files = readdirSync(CONTENT).filter((f) => f.endsWith('.md')).sort();
  const pages = files.map((f) => ({
    file: join(CONTENT, f),
    mdName: f,
    slug: f.replace(/\.md$/, ''),
    outName: f.replace(/\.md$/, '') === 'index' ? 'index.html' : f.replace(/\.md$/, '') + '.html',
  }));

  // posts: content/posts/YYYY-MM-DD-slug.md (date in the filename, title in the H1)
  const POSTS = join(CONTENT, 'posts');
  const posts = existsSync(POSTS)
    ? readdirSync(POSTS)
      .filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
      .map((f) => {
        const src = readFileSync(join(POSTS, f), 'utf8');
        let t = null;
        marked.walkTokens(marked.lexer(src), (tok) => {
          if (!t && tok.type === 'heading') t = tok.text;
        });
        return { file: f, date: f.slice(0, 10), src, title: t ? plain(t) : f.replace(/\.md$/, '') };
      })
      .sort((a, b) => b.file.localeCompare(a.file)) // newest first
    : [];

  // Cloudflare serves about.html at /about, so links are extensionless
  const navItems = [
    { label: 'home', href: '/', slug: 'index' },
    ...pages
      .filter((p) => p.slug !== 'index' && p.slug !== '404')
      .map((p) => ({ label: p.slug, href: `/${p.slug}`, slug: p.slug })),
    { label: 'posts', href: '/posts', slug: 'posts' },
  ];
  const makeNav = (active) => navItems
    .map((i) => `<a href="${i.href}"${i.slug === active ? ' class="on"' : ''}>${i.label}</a>`)
    .join(' ');

  for (const p of pages) {
    const src = readFileSync(p.file, 'utf8');
    let title = null;
    marked.walkTokens(marked.lexer(src), (tok) => {
      if (!title && tok.type === 'heading') title = tok.text;
    });
    writeFileSync(join(DIST, p.outName), pageTemplate({
      ...p,
      rawHref: `/${p.mdName}`,
      title: title ? plain(title) : p.slug,
      nav: makeNav(p.slug),
      html: marked.parse(src),
    }));
    writeFileSync(join(DIST, p.mdName), src); // raw source, linked from footer
  }

  // post pages: /posts/<date>-<slug> (+ the raw .md next to each)
  mkdirSync(join(DIST, 'posts'), { recursive: true });
  for (const p of posts) {
    const clean = p.file.replace(/\.md$/, '');
    writeFileSync(join(DIST, 'posts', `${clean}.html`), pageTemplate({
      outName: `${clean}.html`,
      mdName: p.file,
      rawHref: `/posts/${p.file}`,
      title: p.title,
      nav: makeNav('posts'),
      extraFooter: '<a href="/posts">[ posts ]</a><span class="sep">·</span>',
      html: marked.parse(p.src),
    }));
    writeFileSync(join(DIST, 'posts', p.file), p.src);
  }

  // /posts index for humans and /feed.md — the same markdown — for agents
  const lines = posts.length
    ? posts.map((p) =>
        `- ${p.date} · [${p.title}](/posts/${p.file.replace(/\.md$/, '')}) ([raw](/posts/${p.file}))`)
    : ['_no posts yet_'];
  const digestMd = `# posts\n\n${lines.join('\n')}\n`;
  writeFileSync(join(DIST, 'feed.md'), digestMd);
  writeFileSync(join(DIST, 'posts.html'), pageTemplate({
    outName: 'posts.html',
    mdName: 'feed.md',
    rawHref: '/feed.md',
    title: 'posts',
    nav: makeNav('posts'),
    html: marked.parse(digestMd),
  }));

  // atom feed — each entry links the rendered page AND the raw markdown
  const BASE = 'https://burke.md';
  const entries = posts.map((p) => {
    const clean = p.file.replace(/\.md$/, '');
    const ts = `${p.date}T00:00:00Z`;
    return `  <entry>
    <id>${BASE}/posts/${clean}</id>
    <title>${esc(p.title)}</title>
    <updated>${ts}</updated>
    <published>${ts}</published>
    <link rel="alternate" type="text/html" href="${BASE}/posts/${clean}"/>
    <link rel="alternate" type="text/markdown" href="${BASE}/posts/${p.file}"/>
    <content type="html">${esc(marked.parse(p.src))}</content>
  </entry>`;
  }).join('\n');
  writeFileSync(join(DIST, 'feed.xml'), `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${BASE}/feed.xml</id>
  <title>burke.md</title>
  <subtitle>markdown, left visible</subtitle>
  <updated>${posts.length ? `${posts[0].date}T00:00:00Z` : new Date().toISOString()}</updated>
  <author><name>burke</name></author>
  <link rel="alternate" type="text/html" href="${BASE}/posts"/>
  <link rel="self" type="application/atom+xml" href="${BASE}/feed.xml"/>
${entries}
</feed>
`);

  // tell the host: raw sources are text/markdown (RFC 7763), the feed is atom
  const headers = [
    ...files.map((f) => `/${f}`),
    '/feed.md',
    ...posts.map((p) => `/posts/${p.file}`),
  ].map((f) => `${f}\n  Content-Type: text/markdown; charset=utf-8\n`).join('\n')
    + `\n/feed.xml\n  Content-Type: application/atom+xml; charset=utf-8\n`;
  writeFileSync(join(DIST, '_headers'), headers);

  writeFileSync(join(DIST, 'style.css'), readFileSync('style.css', 'utf8'));
  console.log(`built ${pages.length} page(s) + ${posts.length} post(s) + feed → dist/`);
}

if (process.argv.includes('--watch')) {
  build();
  let t;
  const queue = () => { clearTimeout(t); t = setTimeout(build, 200); };
  watch(CONTENT, queue);
  watch('style.css', queue);
  console.log('watching content/ — rebuilds on save');
} else {
  build();
}
