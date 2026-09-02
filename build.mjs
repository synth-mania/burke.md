#!/usr/bin/env node
// burke.md build
// Compiles content/*.md to dist/*.html with the markdown syntax left visible:
// headings keep their "# ", emphasis keeps its * and **, links keep [text](url),
// lists keep their "- ", quotes keep their "> ", code keeps its backticks.
// The raw .md source is copied next to each page and linked from the footer.

import {
  readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, watch,
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

function pageTemplate({ outName, mdName, title, nav, html }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · burke.md</title>
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header>
  <a class="brand" href="/index.html">burke.md</a>
  <nav>${nav}</nav>
</header>
<main>
${html}
</main>
<footer>
  <a class="raw" href="/${mdName}">[ raw ]</a>
  <span class="sep">·</span>
  <a href="/index.html">[ index ]</a>
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

  const nav = pages
    .map((p) => {
      const active = p.slug === 'index' ? ' class="on"' : '';
      const label = p.slug === 'index' ? 'home' : p.slug;
      return `<a href="/${p.outName}"${active}>${label}</a>`;
    })
    .join(' ');

  for (const p of pages) {
    const src = readFileSync(p.file, 'utf8');
    let title = null;
    marked.walkTokens(marked.lexer(src), (tok) => {
      if (!title && tok.type === 'heading') title = tok.text;
    });
    const html = marked.parse(src);
    writeFileSync(join(DIST, p.outName), pageTemplate({
      ...p,
      title: title ? plain(title) : p.slug,
      nav,
      html,
    }));
    writeFileSync(join(DIST, p.mdName), src); // raw source, linked from footer
  }

  writeFileSync(join(DIST, 'style.css'), readFileSync('style.css', 'utf8'));
  console.log(`built ${pages.length} page(s) → dist/`);
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
