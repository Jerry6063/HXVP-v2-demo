/**
 * Build script: docs/PRD.md  →  docs/PRD.html (brand-styled, print-ready)
 *
 * Usage:
 *   cd docs/build
 *   node build-prd.mjs
 *
 * Output:
 *   docs/PRD.html  (self-contained, no external deps except Google Fonts)
 *
 * Then to make a PDF:
 *   chrome --headless --print-to-pdf=docs/PRD.pdf file://.../docs/PRD.html
 */

import { marked } from 'marked';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = resolve(__dirname, '..');
const ROOT_DIR = resolve(DOCS_DIR, '..');

// ── Read source ────────────────────────────────────────────────────────────
const md = readFileSync(resolve(DOCS_DIR, 'PRD.md'), 'utf8');

// Custom renderer for emojis-as-status (✅ 🟡 🆕 etc.) — leave as-is, browser handles
marked.setOptions({
  gfm: true,
  breaks: false,
});

const bodyHtml = marked.parse(md);

// ── Brand-styled HTML template ─────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>HXVP Studio v2 — Product Requirements Document</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=League+Gothic:wght@400&family=Inter:wght@300;400;500;600;700&display=swap"
  />
  <style>
    /* ════════════════════════════════════════════════════════════════════
       HXVP v2 PRD — Brand-aligned editorial style
       Screen reads dark, print outputs white-paper-friendly.
       ════════════════════════════════════════════════════════════════════ */
    :root {
      --brand:        #d8ff00;
      --brand-hover:  #c2e600;
      --accent-2:     #f0523d;
      --ink:          #0a0a0a;
      --ink-soft:     #272727;
      --ink-muted:    #6e6e6e;
      --ink-subtle:   #a0a0a0;
      --paper:        #ffffff;
      --paper-soft:   #fafafa;
      --paper-tint:   #f4f4f1;     /* warm subtle for table stripes */
      --rule:         #e6e6e6;
      --rule-strong:  #1a1a1a;

      --font-display: "League Gothic", "Bebas Neue", "Arial Narrow", sans-serif;
      --font-sans:    "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
      --font-mono:    "SF Mono", "Menlo", Consolas, monospace;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-sans);
      font-size: 11pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ── Document container ─────────────────────────────────────────────── */
    .prd {
      max-width: 880px;
      margin: 0 auto;
      padding: 56px 64px 80px;
    }

    /* ── Title block ────────────────────────────────────────────────────── */
    .prd > h1:first-of-type {
      font-family: var(--font-display);
      font-size: 56pt;
      letter-spacing: -0.01em;
      line-height: 0.9;
      margin: 0 0 8px;
      padding-bottom: 24px;
      border-bottom: 3px solid var(--ink);
      text-transform: uppercase;
    }

    /* ── Headings ───────────────────────────────────────────────────────── */
    h1, h2, h3, h4, h5 {
      font-family: var(--font-display);
      font-weight: 400;
      letter-spacing: 0.005em;
      color: var(--ink);
      page-break-after: avoid;
    }
    h2 {
      font-size: 28pt;
      line-height: 1;
      margin: 44px 0 14px;
      padding-top: 28px;
      border-top: 1px solid var(--rule);
      text-transform: uppercase;
    }
    h3 {
      font-size: 18pt;
      line-height: 1.1;
      margin: 28px 0 10px;
      text-transform: uppercase;
    }
    h4 {
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 11pt;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-soft);
      margin: 22px 0 8px;
    }

    /* Highlight the H1 heading immediately before §1 TL;DR */
    h1 + p { font-size: 12pt; }

    /* ── Paragraphs / text ──────────────────────────────────────────────── */
    p {
      margin: 0 0 12px;
      max-width: 72ch;
    }
    p > em { color: var(--ink-soft); }
    strong { font-weight: 600; color: var(--ink); }
    em { font-style: italic; }

    /* Inline emphasised words in 'one-liner' / TL;DR */
    p em strong, p strong em { color: var(--ink); }

    /* ── Links ──────────────────────────────────────────────────────────── */
    a {
      color: var(--ink);
      text-decoration: underline;
      text-decoration-color: var(--brand);
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
      transition: color 120ms;
    }
    a:hover { color: var(--accent-2); }

    /* ── Lists ──────────────────────────────────────────────────────────── */
    ul, ol {
      padding-left: 22px;
      margin: 0 0 14px;
    }
    li { margin: 4px 0; max-width: 70ch; }
    ul li::marker { color: var(--brand-hover); }
    ol li::marker { color: var(--ink-muted); font-weight: 600; }

    /* ── Blockquote (used for callouts) ─────────────────────────────────── */
    blockquote {
      margin: 18px 0;
      padding: 14px 18px;
      background: var(--paper-tint);
      border-left: 3px solid var(--brand);
      color: var(--ink-soft);
      font-size: 10.5pt;
    }
    blockquote p:last-child { margin-bottom: 0; }
    blockquote strong { color: var(--ink); }

    /* ── Code (inline + block) ──────────────────────────────────────────── */
    code {
      font-family: var(--font-mono);
      font-size: 9.5pt;
      background: var(--paper-tint);
      border: 1px solid var(--rule);
      padding: 1px 5px;
      border-radius: 0;
    }
    pre {
      background: var(--ink);
      color: #f8f8f2;
      padding: 16px 20px;
      overflow-x: auto;
      font-size: 9pt;
      line-height: 1.55;
      margin: 12px 0 18px;
      page-break-inside: avoid;
    }
    pre code {
      background: transparent;
      border: none;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }

    /* ── Tables ─────────────────────────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin: 12px 0 22px;
      page-break-inside: avoid;
    }
    th, td {
      text-align: left;
      vertical-align: top;
      padding: 9px 12px;
      border-bottom: 1px solid var(--rule);
    }
    th {
      background: var(--ink);
      color: var(--paper);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 8.5pt;
      border-bottom: 2px solid var(--brand);
    }
    tbody tr:nth-child(odd) td {
      background: var(--paper-tint);
    }
    td code { font-size: 9pt; }

    /* ── Horizontal rule ────────────────────────────────────────────────── */
    hr {
      border: none;
      border-top: 1px solid var(--rule);
      margin: 36px 0;
    }

    /* ── Cover block (top metadata table) ───────────────────────────────── */
    .prd > p:first-of-type + table {
      font-size: 10pt;
    }
    .prd > p:first-of-type + table th {
      display: none;
    }
    .prd > p:first-of-type + table td:first-child {
      width: 30%;
      font-weight: 600;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 8.5pt;
      background: var(--paper);
    }
    .prd > p:first-of-type + table tr td { background: var(--paper); }

    /* ── Status emoji visual nudge ──────────────────────────────────────── */
    h1 + table td, h2 + table td, p code:first-child { white-space: nowrap; }

    /* ── First "Reading guide" blockquote special framing ───────────────── */
    h2:first-of-type + blockquote {
      background: var(--ink);
      color: var(--paper);
      border-left-color: var(--brand);
    }
    h2:first-of-type + blockquote strong { color: var(--brand); }

    /* ── PRINT styles (PDF rendering) ───────────────────────────────────── */
    @page {
      size: A4;
      margin: 18mm 16mm 22mm;
    }
    @media print {
      html, body { background: var(--paper); }
      .prd {
        max-width: none;
        margin: 0;
        padding: 0;
      }
      h2 { page-break-before: auto; }
      pre, table, blockquote { page-break-inside: avoid; }
      a { color: var(--ink); text-decoration-color: var(--brand-hover); }
      /* Footer with page numbers via CSS (some renderers honor this) */
    }

    /* ── Footer on cover page ───────────────────────────────────────────── */
    .footer-meta {
      margin-top: 64px;
      padding-top: 18px;
      border-top: 1px solid var(--rule);
      font-size: 9pt;
      color: var(--ink-subtle);
      text-align: center;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="prd">
${bodyHtml}
    <div class="footer-meta">
      HXVP Studio v2 · Product Requirements Document · v0.2 · Confidential
    </div>
  </div>
</body>
</html>
`;

writeFileSync(resolve(DOCS_DIR, 'PRD.html'), html, 'utf8');
console.log(`✓ Built docs/PRD.html (${html.length.toLocaleString()} bytes)`);
