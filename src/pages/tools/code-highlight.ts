import { icon } from '../../core/icons';

type TokenType = 'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'punctuation';

interface Token {
  type: TokenType;
  value: string;
}

interface LanguageDef {
  id: string;
  label: string;
  aliases: string[];
  keywords: string[];
  singleComments: string[];
  blockComments: [string, string][];
  stringDelimiters: string[];
  caseInsensitive?: boolean;
  sample: string;
}

interface ThemeDef {
  id: string;
  label: string;
  bg: string;
  fg: string;
  muted: string;
  border: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  operator: string;
  punctuation: string;
}

const LANGUAGES: LanguageDef[] = [
  {
    id: 'typescript',
    label: 'TypeScript',
    aliases: ['ts', 'tsx'],
    keywords: ['abstract', 'any', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue', 'declare', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'infer', 'instanceof', 'interface', 'keyof', 'let', 'module', 'namespace', 'never', 'new', 'null', 'number', 'of', 'private', 'protected', 'public', 'readonly', 'return', 'satisfies', 'set', 'static', 'string', 'super', 'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'unknown', 'var', 'void', 'while', 'with', 'yield'],
    singleComments: ['//'],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', "'", '`'],
    sample: `type Tool = { id: string; enabled: boolean };

export async function loadTool(id: string): Promise<Tool> {
  const response = await fetch('/api/tools/' + id);
  return response.json();
}`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    aliases: ['js', 'jsx', 'mjs'],
    keywords: ['async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield'],
    singleComments: ['//'],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', "'", '`'],
    sample: `const tools = ['json', 'hash', 'base64'];

function filterTools(query) {
  return tools.filter(name => name.includes(query));
}`,
  },
  {
    id: 'python',
    label: 'Python',
    aliases: ['py'],
    keywords: ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'],
    singleComments: ['#'],
    blockComments: [['"""', '"""'], ["'''", "'''"]],
    stringDelimiters: ['"', "'"],
    sample: `def normalize_items(items):
    # Keep unique values in original order.
    seen = set()
    return [item for item in items if not (item in seen or seen.add(item))]`,
  },
  {
    id: 'html',
    label: 'HTML',
    aliases: ['htm', 'xml'],
    keywords: ['DOCTYPE', 'a', 'article', 'aside', 'body', 'button', 'canvas', 'div', 'footer', 'form', 'h1', 'h2', 'h3', 'head', 'header', 'html', 'img', 'input', 'label', 'li', 'link', 'main', 'meta', 'nav', 'option', 'p', 'script', 'section', 'select', 'span', 'style', 'table', 'tbody', 'td', 'textarea', 'th', 'thead', 'title', 'tr', 'ul'],
    singleComments: [],
    blockComments: [['<!--', '-->']],
    stringDelimiters: ['"', "'"],
    sample: `<section class="tool-card">
  <h2>月光宝盒</h2>
  <button type="button">运行</button>
</section>`,
  },
  {
    id: 'css',
    label: 'CSS',
    aliases: ['scss', 'less'],
    keywords: ['absolute', 'auto', 'block', 'bold', 'border-box', 'center', 'flex', 'fixed', 'grid', 'hidden', 'inherit', 'inline', 'inline-block', 'none', 'normal', 'relative', 'rem', 'solid', 'sticky', 'transparent', 'var', 'visible'],
    singleComments: [],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', "'"],
    sample: `.tool-card {
  display: grid;
  gap: 12px;
  color: var(--color-on-surface);
}`,
  },
  {
    id: 'json',
    label: 'JSON',
    aliases: [],
    keywords: ['false', 'null', 'true'],
    singleComments: [],
    blockComments: [],
    stringDelimiters: ['"'],
    sample: `{
  "name": "Mooncase",
  "tools": 63,
  "clientOnly": true
}`,
  },
  {
    id: 'sql',
    label: 'SQL',
    aliases: [],
    caseInsensitive: true,
    keywords: ['ADD', 'ALTER', 'AND', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CONSTRAINT', 'CREATE', 'DELETE', 'DESC', 'DISTINCT', 'DROP', 'ELSE', 'END', 'EXISTS', 'FOREIGN', 'FROM', 'GROUP', 'HAVING', 'IN', 'INDEX', 'INNER', 'INSERT', 'INTO', 'IS', 'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT', 'NOT', 'NULL', 'ON', 'OR', 'ORDER', 'OUTER', 'PRIMARY', 'REFERENCES', 'RIGHT', 'SELECT', 'SET', 'TABLE', 'THEN', 'UPDATE', 'VALUES', 'WHEN', 'WHERE'],
    singleComments: ['--'],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', "'"],
    sample: `SELECT id, name, created_at
FROM tools
WHERE category = 'code'
ORDER BY created_at DESC;`,
  },
  {
    id: 'bash',
    label: 'Bash',
    aliases: ['shell', 'sh'],
    keywords: ['alias', 'case', 'cat', 'cd', 'chmod', 'cp', 'declare', 'do', 'done', 'echo', 'elif', 'else', 'esac', 'eval', 'exec', 'exit', 'export', 'fi', 'find', 'for', 'function', 'grep', 'if', 'in', 'local', 'mkdir', 'mv', 'readonly', 'return', 'rm', 'sed', 'set', 'shift', 'source', 'then', 'trap', 'unset', 'while'],
    singleComments: ['#'],
    blockComments: [],
    stringDelimiters: ['"', "'"],
    sample: `#!/usr/bin/env bash
set -e

for file in src/*.ts; do
  echo "checking $file"
done`,
  },
  {
    id: 'java',
    label: 'Java',
    aliases: [],
    keywords: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'this', 'throw', 'throws', 'true', 'try', 'void', 'while'],
    singleComments: ['//'],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', "'"],
    sample: `public class Tool {
  private final String name;

  public Tool(String name) {
    this.name = name;
  }
}`,
  },
  {
    id: 'go',
    label: 'Go',
    aliases: ['golang'],
    keywords: ['any', 'append', 'bool', 'break', 'case', 'chan', 'const', 'continue', 'defer', 'else', 'error', 'fallthrough', 'false', 'for', 'func', 'go', 'if', 'import', 'interface', 'iota', 'make', 'map', 'nil', 'package', 'range', 'return', 'select', 'string', 'struct', 'switch', 'true', 'type', 'var'],
    singleComments: ['//'],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', '`'],
    sample: `package main

func main() {
  tools := []string{"json", "hash", "base64"}
  _ = tools
}`,
  },
  {
    id: 'rust',
    label: 'Rust',
    aliases: ['rs'],
    keywords: ['Self', 'as', 'async', 'await', 'bool', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'static', 'str', 'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while'],
    singleComments: ['//'],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', "'"],
    sample: `fn main() {
  let tools = vec!["json", "hash", "base64"];
  println!("{:?}", tools);
}`,
  },
  {
    id: 'cpp',
    label: 'C / C++',
    aliases: ['c', 'cc', 'cxx', 'h', 'hpp'],
    keywords: ['auto', 'bool', 'break', 'case', 'char', 'class', 'const', 'continue', 'default', 'delete', 'do', 'double', 'else', 'enum', 'false', 'float', 'for', 'if', 'include', 'inline', 'int', 'long', 'namespace', 'new', 'nullptr', 'private', 'protected', 'public', 'return', 'short', 'sizeof', 'static', 'struct', 'switch', 'template', 'this', 'true', 'typedef', 'typename', 'using', 'void', 'while'],
    singleComments: ['//'],
    blockComments: [['/*', '*/']],
    stringDelimiters: ['"', "'"],
    sample: `#include <iostream>

int main() {
  std::cout << "Mooncase" << std::endl;
  return 0;
}`,
  },
];

const THEMES: ThemeDef[] = [
  {
    id: 'moonlight',
    label: 'Moonlight',
    bg: '#10151f',
    fg: '#e6edf7',
    muted: '#8491a7',
    border: '#2a3344',
    keyword: '#8ab4ff',
    string: '#7fd88f',
    comment: '#7d8797',
    number: '#f6c177',
    operator: '#ff9db5',
    punctuation: '#c5d0e6',
  },
  {
    id: 'paper',
    label: 'Paper',
    bg: '#fbfcfe',
    fg: '#18202f',
    muted: '#697386',
    border: '#d7dce7',
    keyword: '#1b57bd',
    string: '#137333',
    comment: '#667085',
    number: '#a15c00',
    operator: '#b42318',
    punctuation: '#344054',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    bg: '#07120d',
    fg: '#d7ffe2',
    muted: '#6da878',
    border: '#1d3b28',
    keyword: '#9cffb3',
    string: '#f0d66b',
    comment: '#6da878',
    number: '#7bd7ff',
    operator: '#ff8f70',
    punctuation: '#b9e7c3',
  },
];

const OPERATORS = new Set(['+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '~', '?', ':']);
const PUNCTUATION = new Set(['(', ')', '[', ']', '{', '}', '.', ',', ';']);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isWordStart(char: string): boolean {
  return /[A-Za-z_$]/.test(char);
}

function isWordPart(char: string): boolean {
  return /[\w$-]/.test(char);
}

function startsWithAny(code: string, index: number, markers: string[]): string | null {
  return markers.find(marker => code.startsWith(marker, index)) ?? null;
}

function readString(code: string, start: number, delimiter: string): number {
  let index = start + delimiter.length;
  while (index < code.length) {
    if (code[index] === '\\') {
      index += 2;
      continue;
    }
    if (code.startsWith(delimiter, index)) return index + delimiter.length;
    index += 1;
  }
  return code.length;
}

function readLine(code: string, start: number): number {
  const next = code.indexOf('\n', start);
  return next === -1 ? code.length : next;
}

function readBlock(code: string, start: number, open: string, close: string): number {
  const next = code.indexOf(close, start + open.length);
  return next === -1 ? code.length : next + close.length;
}

function readNumber(code: string, start: number): number {
  const match = code.slice(start).match(/^(0x[\da-fA-F]+|0b[01]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)/);
  return match ? start + match[0].length : start + 1;
}

function tokenize(code: string, language: LanguageDef): Token[] {
  const keywordSet = new Set(language.keywords.map(word => language.caseInsensitive ? word.toLowerCase() : word));
  const tokens: Token[] = [];
  let index = 0;

  while (index < code.length) {
    const blockComment = language.blockComments.find(([open]) => code.startsWith(open, index));
    if (blockComment) {
      const end = readBlock(code, index, blockComment[0], blockComment[1]);
      tokens.push({ type: 'comment', value: code.slice(index, end) });
      index = end;
      continue;
    }

    const singleComment = startsWithAny(code, index, language.singleComments);
    if (singleComment) {
      const end = readLine(code, index);
      tokens.push({ type: 'comment', value: code.slice(index, end) });
      index = end;
      continue;
    }

    const stringDelimiter = startsWithAny(code, index, language.stringDelimiters);
    if (stringDelimiter) {
      const end = readString(code, index, stringDelimiter);
      tokens.push({ type: 'string', value: code.slice(index, end) });
      index = end;
      continue;
    }

    if (/\d/.test(code[index])) {
      const end = readNumber(code, index);
      tokens.push({ type: 'number', value: code.slice(index, end) });
      index = end;
      continue;
    }

    if (isWordStart(code[index])) {
      let end = index + 1;
      while (end < code.length && isWordPart(code[end])) end += 1;
      const word = code.slice(index, end);
      const lookup = language.caseInsensitive ? word.toLowerCase() : word;
      tokens.push({ type: keywordSet.has(lookup) ? 'keyword' : 'plain', value: word });
      index = end;
      continue;
    }

    if (OPERATORS.has(code[index])) {
      tokens.push({ type: 'operator', value: code[index] });
      index += 1;
      continue;
    }

    if (PUNCTUATION.has(code[index])) {
      tokens.push({ type: 'punctuation', value: code[index] });
      index += 1;
      continue;
    }

    tokens.push({ type: 'plain', value: code[index] });
    index += 1;
  }

  return tokens;
}

function renderTokens(tokens: Token[]): string {
  return tokens.map(token => {
    const value = escapeHtml(token.value);
    return token.type === 'plain' ? value : `<span class="hl-token-${token.type}">${value}</span>`;
  }).join('');
}

function renderLineNumbers(lineCount: number): string {
  return Array.from({ length: lineCount }, (_, index) => `<span>${index + 1}</span>`).join('');
}

function getLanguage(id: string): LanguageDef {
  return LANGUAGES.find(language => language.id === id) ?? LANGUAGES[0];
}

function getTheme(id: string): ThemeDef {
  return THEMES.find(theme => theme.id === id) ?? THEMES[0];
}

function detectLanguage(code: string): LanguageDef {
  const trimmed = code.trim();
  if (/^\s*[{[][\s\S]*[}\]]\s*$/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return getLanguage('json');
    } catch {
      // Keep checking other languages.
    }
  }
  if (/<!doctype|<\/?[a-z][\s\S]*>/i.test(code)) return getLanguage('html');
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/i.test(code)) return getLanguage('sql');
  if (/^\s*#include\b|std::|->/.test(code)) return getLanguage('cpp');
  if (/\bpackage\s+main\b|\bfunc\s+\w+\s*\(/.test(code)) return getLanguage('go');
  if (/\bfn\s+\w+\s*\(|\blet\s+mut\b|println!\s*\(/.test(code)) return getLanguage('rust');
  if (/\b(public|private|protected)\s+class\b|\bSystem\.out\.println\b/.test(code)) return getLanguage('java');
  if (/^\s*(def|class)\s+\w+|\bimport\s+\w+|^\s*from\s+\w+\s+import\b/m.test(code)) return getLanguage('python');
  if (/\b(interface|type)\s+\w+\s*[={]|\bimplements\b|:\s*(string|number|boolean)\b/.test(code)) return getLanguage('typescript');
  if (/^\s*(\.|#|:root|@media)|\{[\s\S]*:\s*[^;]+;[\s\S]*\}/.test(code)) return getLanguage('css');
  if (/^#!\/.*\b(sh|bash)\b|\b(echo|fi|done|chmod|grep)\b/.test(code)) return getLanguage('bash');
  return getLanguage('javascript');
}

function buildPreviewHtml(code: string, language: LanguageDef, showLineNumbers: boolean): string {
  const highlighted = renderTokens(tokenize(code, language));
  const lineCount = Math.max(1, code.split('\n').length);
  return `
    <div class="hl-code-shell ${showLineNumbers ? 'hl-code-shell--lines' : ''}">
      ${showLineNumbers ? `<div class="hl-line-numbers" aria-hidden="true">${renderLineNumbers(lineCount)}</div>` : ''}
      <pre class="hl-code"><code>${highlighted || '<span class="hl-placeholder">预览将在这里显示</span>'}</code></pre>
    </div>
  `;
}

function buildPortableHtml(code: string, language: LanguageDef, theme: ThemeDef, showLineNumbers: boolean): string {
  const highlighted = renderTokens(tokenize(code, language));
  const lineCount = Math.max(1, code.split('\n').length);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(language.label)} 代码高亮</title>
<style>
body{margin:0;padding:24px;background:${theme.bg};color:${theme.fg};font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace}
.hl-code-shell{display:grid;grid-template-columns:${showLineNumbers ? 'auto minmax(0,1fr)' : 'minmax(0,1fr)'};border:1px solid ${theme.border};border-radius:8px;overflow:auto;background:${theme.bg}}
.hl-line-numbers{display:flex;flex-direction:column;gap:0;padding:16px 12px;color:${theme.muted};border-right:1px solid ${theme.border};text-align:right;user-select:none}
.hl-code{margin:0;padding:16px;min-width:0;white-space:pre;line-height:1.65;font-size:14px}
.hl-token-keyword{color:${theme.keyword};font-weight:650}.hl-token-string{color:${theme.string}}.hl-token-comment{color:${theme.comment};font-style:italic}.hl-token-number{color:${theme.number}}.hl-token-operator{color:${theme.operator}}.hl-token-punctuation{color:${theme.punctuation}}
</style>
</head>
<body>
<div class="hl-code-shell">
${showLineNumbers ? `<div class="hl-line-numbers" aria-hidden="true">${renderLineNumbers(lineCount)}</div>` : ''}
<pre class="hl-code"><code>${highlighted}</code></pre>
</div>
</body>
</html>`;
}

function downloadText(content: string, filename: string, type = 'text/html;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderStyles(theme: ThemeDef): string {
  return `
    <style>
      .hl-workspace {
        display: grid;
        grid-template-columns: minmax(320px, 0.95fr) minmax(360px, 1.05fr);
        gap: 16px;
        align-items: stretch;
      }

      .hl-panel {
        min-width: 0;
        border: 1px solid var(--color-outline-variant);
        border-radius: var(--radius-md);
        background: var(--color-surface-container-lowest);
        overflow: hidden;
      }

      .hl-panel-head {
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--color-outline-variant);
        background: var(--color-surface-container-low);
      }

      .hl-panel-head h2 {
        margin: 0;
        color: var(--color-on-surface);
        font: var(--text-headline-sm);
      }

      .hl-panel-head span {
        color: var(--color-on-surface-variant);
        font: var(--text-body-sm);
      }

      .hl-editor {
        width: 100%;
        min-height: 520px;
        padding: 16px;
        border: 0;
        border-radius: 0;
        background: var(--color-surface-container-lowest);
        color: var(--color-on-surface);
        font: 13px/1.65 var(--font-mono);
        resize: vertical;
      }

      .hl-editor:focus {
        outline: 3px solid var(--color-primary-fixed-dim);
        outline-offset: -3px;
      }

      .hl-preview {
        height: 100%;
        min-height: 520px;
        overflow: auto;
        background: ${theme.bg};
        color: ${theme.fg};
      }

      .hl-code-shell {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        min-width: 100%;
        background: ${theme.bg};
        color: ${theme.fg};
      }

      .hl-code-shell--lines {
        grid-template-columns: auto minmax(0, 1fr);
      }

      .hl-line-numbers {
        display: flex;
        flex-direction: column;
        padding: 16px 12px;
        border-right: 1px solid ${theme.border};
        color: ${theme.muted};
        font: 13px/1.65 var(--font-mono);
        text-align: right;
        user-select: none;
      }

      .hl-code {
        margin: 0;
        min-width: max-content;
        padding: 16px;
        color: ${theme.fg};
        font: 13px/1.65 var(--font-mono);
        white-space: pre;
      }

      .hl-preview--wrap .hl-code {
        min-width: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .hl-placeholder {
        color: ${theme.muted};
      }

      .hl-token-keyword { color: ${theme.keyword}; font-weight: 650; }
      .hl-token-string { color: ${theme.string}; }
      .hl-token-comment { color: ${theme.comment}; font-style: italic; }
      .hl-token-number { color: ${theme.number}; }
      .hl-token-operator { color: ${theme.operator}; }
      .hl-token-punctuation { color: ${theme.punctuation}; }

      .hl-toolbar {
        display: grid;
        grid-template-columns: repeat(3, minmax(150px, 1fr)) auto;
        gap: 12px;
        align-items: end;
      }

      .hl-toggle-row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .hl-stat-row {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--color-on-surface-variant);
        font: var(--text-body-sm);
      }

      @media (max-width: 1100px) {
        .hl-workspace,
        .hl-toolbar {
          grid-template-columns: 1fr;
        }

        .hl-editor,
        .hl-preview {
          min-height: 420px;
        }
      }
    </style>
  `;
}

export default {
  id: 'code-highlight',
  name: '代码高亮工具',
  icon: 'palette',
  render(container: HTMLElement) {
    let currentTheme = getTheme('moonlight');
    let currentPortableHtml = '';

    container.innerHTML = `
      <div class="content">
        ${renderStyles(currentTheme)}
        <div class="tool-page-header">
          <a href="#/dev" class="tool-page-back">${icon('code')} 开发调试</a>
          <h1 style="font: var(--text-headline-md);">代码高亮工具</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">生成可复制、可导出的语法高亮代码块</p>
        </div>

        <div class="tool-page-body">
          <div class="hl-toolbar">
            <div class="tool-field">
              <label class="tool-label" for="hl-lang">语言</label>
              <select id="hl-lang" class="tool-select">
                ${LANGUAGES.map(language => `<option value="${language.id}">${language.label}</option>`).join('')}
              </select>
            </div>
            <div class="tool-field">
              <label class="tool-label" for="hl-theme">主题</label>
              <select id="hl-theme" class="tool-select">
                ${THEMES.map(theme => `<option value="${theme.id}">${theme.label}</option>`).join('')}
              </select>
            </div>
            <div class="tool-field">
              <label class="tool-label" for="hl-filename">文件名</label>
              <input id="hl-filename" class="tool-input" placeholder="snippet.html" value="snippet.html" />
            </div>
            <div class="tool-actions">
              <button class="btn btn-secondary" id="hl-detect" type="button">${icon('search')} 识别</button>
              <button class="btn btn-secondary" id="hl-sample" type="button">${icon('refresh')} 示例</button>
            </div>
          </div>

          <div class="hl-toggle-row">
            <label class="tool-checkbox"><input type="checkbox" id="hl-lines" checked /> 显示行号</label>
            <label class="tool-checkbox"><input type="checkbox" id="hl-wrap" /> 自动换行</label>
            <div class="hl-stat-row">
              <span id="hl-stat-lines">0 行</span>
              <span id="hl-stat-chars">0 字符</span>
              <span id="hl-stat-lang">TypeScript</span>
            </div>
          </div>

          <div class="hl-workspace">
            <section class="hl-panel">
              <div class="hl-panel-head">
                <h2>输入</h2>
                <button class="btn btn-ghost" id="hl-clear" type="button">${icon('close')} 清空</button>
              </div>
              <textarea id="hl-input" class="hl-editor" spellcheck="false" placeholder="在此粘贴代码"></textarea>
            </section>

            <section class="hl-panel">
              <div class="hl-panel-head">
                <div>
                  <h2>预览</h2>
                  <span id="hl-preview-meta">Moonlight</span>
                </div>
                <div class="tool-actions">
                  <button class="btn btn-ghost" id="hl-copy-html" type="button">${icon('clipboard')} HTML</button>
                  <button class="btn btn-ghost" id="hl-copy-text" type="button">${icon('clipboard')} 文本</button>
                  <button class="btn btn-primary" id="hl-download" type="button">${icon('download')} 下载</button>
                </div>
              </div>
              <div id="hl-preview" class="hl-preview"></div>
            </section>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#hl-input') as HTMLTextAreaElement;
    const languageSelect = container.querySelector('#hl-lang') as HTMLSelectElement;
    const themeSelect = container.querySelector('#hl-theme') as HTMLSelectElement;
    const filenameInput = container.querySelector('#hl-filename') as HTMLInputElement;
    const lineNumbers = container.querySelector('#hl-lines') as HTMLInputElement;
    const wrapLines = container.querySelector('#hl-wrap') as HTMLInputElement;
    const preview = container.querySelector('#hl-preview') as HTMLElement;
    const previewMeta = container.querySelector('#hl-preview-meta') as HTMLElement;
    const statLines = container.querySelector('#hl-stat-lines') as HTMLElement;
    const statChars = container.querySelector('#hl-stat-chars') as HTMLElement;
    const statLang = container.querySelector('#hl-stat-lang') as HTMLElement;

    function update() {
      const language = getLanguage(languageSelect.value);
      currentTheme = getTheme(themeSelect.value);
      const code = input.value;
      const lineCount = code ? code.split('\n').length : 0;

      const oldStyle = container.querySelector('style');
      if (oldStyle) oldStyle.outerHTML = renderStyles(currentTheme);

      preview.classList.toggle('hl-preview--wrap', wrapLines.checked);
      preview.innerHTML = buildPreviewHtml(code, language, lineNumbers.checked);
      previewMeta.textContent = currentTheme.label;
      statLines.textContent = `${lineCount} 行`;
      statChars.textContent = `${code.length} 字符`;
      statLang.textContent = language.label;
      currentPortableHtml = buildPortableHtml(code, language, currentTheme, lineNumbers.checked);
    }

    function scheduleUpdate() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(update, 120);
    }

    container.querySelector('#hl-detect')!.addEventListener('click', () => {
      const language = detectLanguage(input.value);
      languageSelect.value = language.id;
      update();
    });

    container.querySelector('#hl-sample')!.addEventListener('click', () => {
      const language = getLanguage(languageSelect.value);
      input.value = language.sample;
      filenameInput.value = `snippet-${language.id}.html`;
      update();
    });

    container.querySelector('#hl-clear')!.addEventListener('click', () => {
      input.value = '';
      update();
      input.focus();
    });

    container.querySelector('#hl-copy-html')!.addEventListener('click', () => {
      navigator.clipboard.writeText(currentPortableHtml);
    });

    container.querySelector('#hl-copy-text')!.addEventListener('click', () => {
      navigator.clipboard.writeText(input.value);
    });

    container.querySelector('#hl-download')!.addEventListener('click', () => {
      const filename = filenameInput.value.trim() || 'snippet.html';
      downloadText(currentPortableHtml, filename.endsWith('.html') ? filename : `${filename}.html`);
    });

    input.addEventListener('input', scheduleUpdate);
    languageSelect.addEventListener('change', update);
    themeSelect.addEventListener('change', update);
    lineNumbers.addEventListener('change', update);
    wrapLines.addEventListener('change', update);

    input.value = getLanguage(languageSelect.value).sample;
    update();
  },
  destroy() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = null;
  },
};
