import { icon } from '../../core/icons';

interface LangDef {
  keywords: string[];
  commentSingle: string[];
  commentMulti: [string, string][];
  strings: string[];
}

const LANGUAGES: Record<string, LangDef> = {
  javascript: {
    keywords: ['abstract', 'arguments', 'async', 'await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'from', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'of', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'volatile', 'while', 'with', 'yield'],
    commentSingle: ['//'],
    commentMulti: [['/*', '*/']],
    strings: ['"', "'", '`'],
  },
  typescript: {
    keywords: ['abstract', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue', 'declare', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'keyof', 'let', 'module', 'namespace', 'new', 'null', 'number', 'of', 'package', 'private', 'protected', 'public', 'readonly', 'return', 'set', 'static', 'string', 'super', 'switch', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'unique', 'var', 'void', 'while', 'with', 'yield'],
    commentSingle: ['//'],
    commentMulti: [['/*', '*/']],
    strings: ['"', "'", '`'],
  },
  python: {
    keywords: ['and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'],
    commentSingle: ['#'],
    commentMulti: [['"""', '"""'], ["'''", "'''"]],
    strings: ['"', "'"],
  },
  html: {
    keywords: ['DOCTYPE', 'html', 'head', 'body', 'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'img', 'video', 'audio', 'canvas', 'svg', 'script', 'style', 'link', 'meta', 'title', 'section', 'article', 'nav', 'header', 'footer', 'main', 'aside'],
    commentSingle: [],
    commentMulti: [['<!--', '-->']],
    strings: ['"', "'"],
  },
  css: {
    keywords: ['!important', 'inherit', 'initial', 'unset', 'none', 'auto', 'normal', 'bold', 'italic', 'solid', 'dashed', 'dotted', 'relative', 'absolute', 'fixed', 'static', 'flex', 'grid', 'block', 'inline', 'inline-block', 'hidden', 'visible', 'scroll', 'center', 'left', 'right', 'top', 'bottom'],
    commentSingle: [],
    commentMulti: [['/*', '*/']],
    strings: ['"', "'"],
  },
  json: {
    keywords: ['true', 'false', 'null'],
    commentSingle: [],
    commentMulti: [],
    strings: ['"'],
  },
  java: {
    keywords: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'],
    commentSingle: ['//'],
    commentMulti: [['/*', '*/']],
    strings: ['"', "'"],
  },
  c: {
    keywords: ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', 'NULL', 'true', 'false', 'bool', 'include', 'define', 'ifdef', 'ifndef', 'endif', 'pragma'],
    commentSingle: ['//'],
    commentMulti: [['/*', '*/']],
    strings: ['"', "'"],
  },
  go: {
    keywords: ['break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var', 'true', 'false', 'iota', 'nil', 'append', 'cap', 'close', 'complex', 'copy', 'delete', 'imag', 'len', 'make', 'new', 'panic', 'print', 'println', 'real', 'recover', 'string', 'int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float32', 'float64', 'complex64', 'complex128', 'bool', 'byte', 'rune', 'error', 'any'],
    commentSingle: ['//'],
    commentMulti: [['/*', '*/']],
    strings: ['"', '`'],
  },
  rust: {
    keywords: ['as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while', 'yield', 'Box', 'Option', 'Result', 'String', 'Vec', 'bool', 'char', 'f32', 'f64', 'i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'str', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize'],
    commentSingle: ['//'],
    commentMulti: [['/*', '*/']],
    strings: ['"', "'"],
  },
  sql: {
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'AUTO_INCREMENT', 'VARCHAR', 'INT', 'INTEGER', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'FLOAT', 'DOUBLE', 'DECIMAL', 'EXISTS', 'ANY', 'SOME'],
    commentSingle: ['--'],
    commentMulti: [['/*', '*/']],
    strings: ['"', "'"],
  },
  bash: {
    keywords: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'in', 'function', 'return', 'exit', 'echo', 'export', 'source', 'alias', 'unalias', 'set', 'unset', 'local', 'readonly', 'declare', 'eval', 'exec', 'test', 'shift', 'trap', 'wait', 'jobs', 'fg', 'bg', 'kill', 'cd', 'pwd', 'ls', 'cat', 'grep', 'sed', 'awk', 'find', 'sort', 'uniq', 'wc', 'head', 'tail', 'chmod', 'chown', 'mkdir', 'rm', 'cp', 'mv', 'touch', 'sudo', 'apt', 'yum', 'dnf', 'pacman', 'true', 'false', 'null', 'stdin', 'stdout', 'stderr'],
    commentSingle: ['#'],
    commentMulti: [],
    strings: ['"', "'"],
  },
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string, lang: string): string {
  const def = LANGUAGES[lang];
  if (!def) return escapeHtml(code);

  let escaped = escapeHtml(code);
  const tokens: { start: number; end: number; html: string; priority: number }[] = [];

  // Collect comment spans
  for (const single of def.commentSingle) {
    const escapedSingle = escapeHtml(single);
    const re = new RegExp(escapedSingle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*', 'g');
    let m;
    while ((m = re.exec(escaped)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-comment);font-style:italic">${m[0]}</span>`, priority: 1 });
    }
  }
  for (const [open, close] of def.commentMulti) {
    const escapedOpen = escapeHtml(open);
    const escapedClose = escapeHtml(close);
    const re = new RegExp(escapedOpen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + escapedClose.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    let m;
    while ((m = re.exec(escaped)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-comment);font-style:italic">${m[0]}</span>`, priority: 1 });
    }
  }

  // Collect string spans
  for (const q of def.strings) {
    const escapedQ = escapeHtml(q);
    const re = new RegExp(escapedQ + '[^' + escapedQ + '\\\\]*(?:\\\\.[^' + escapedQ + '\\\\]*)*' + escapedQ, 'g');
    let m;
    while ((m = re.exec(escaped)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-string)">${m[0]}</span>`, priority: 2 });
    }
  }

  // Collect keyword spans
  const kwPattern = new RegExp('\\b(' + def.keywords.join('|') + ')\\b', 'g');
  let m;
  while ((m = kwPattern.exec(escaped)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-keyword);font-weight:600">${m[0]}</span>`, priority: 3 });
  }

  // Collect number spans
  const numRe = /\b(\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g;
  while ((m = numRe.exec(escaped)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, html: `<span style="color:var(--color-syntax-number)">${m[0]}</span>`, priority: 4 });
  }

  // Sort by start, then by priority (lower = higher priority)
  tokens.sort((a, b) => a.start - b.start || a.priority - b.priority);

  // Merge non-overlapping tokens
  const result: string[] = [];
  let pos = 0;
  for (const tok of tokens) {
    if (tok.start >= pos) {
      result.push(escaped.slice(pos, tok.start));
      result.push(tok.html);
      pos = tok.end;
    }
  }
  result.push(escaped.slice(pos));

  return result.join('');
}

function highlightWithLineNumbers(html: string): string {
  const lines = html.split('\n');
  return lines.map((line, i) =>
    `<div style="display:flex;line-height:1.6"><span style="min-width:40px;text-align:right;color:var(--color-outline);user-select:none;border-right:1px solid var(--color-outline-variant);padding-right:8px;margin-right:12px;flex-shrink:0">${i + 1}</span><span>${line}</span></div>`
  ).join('');
}

const LANG_OPTIONS = [
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['python', 'Python'],
  ['html', 'HTML'],
  ['css', 'CSS'],
  ['json', 'JSON'],
  ['java', 'Java'],
  ['c', 'C / C++'],
  ['go', 'Go'],
  ['rust', 'Rust'],
  ['sql', 'SQL'],
  ['bash', 'Bash / Shell'],
];

let hlDebounceTimer: ReturnType<typeof setTimeout>;

export default {
  id: 'code-highlight',
  name: '代码高亮工具',
  icon: 'palette',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/code" class="tool-page-back">${icon('code')} 代码工具</a>
          <h1 style="font: var(--text-headline-md);">代码高亮工具</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">代码语法高亮，支持多种语言，可导出 HTML</p>
        </div>
        <div class="tool-page-body">
          <div class="tool-field">
            <label class="tool-label">选择语言</label>
            <select id="hl-lang" class="tool-select">
              ${LANG_OPTIONS.map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
            </select>
          </div>
          <div class="tool-field">
            <label class="tool-label">输入代码</label>
            <textarea id="hl-input" class="tool-textarea" rows="14" placeholder="在此粘贴代码..." style="font-family: var(--font-mono); font-size: 13px;"></textarea>
          </div>
          <div class="tool-actions" style="flex-wrap: wrap; gap: 8px; align-items: center;">
            <button class="btn btn-primary" id="hl-highlight">${icon('palette')} 高亮</button>
            <button class="btn btn-secondary" id="hl-clear">清空</button>
            <label class="tool-checkbox" style="margin-left: 12px;"><input type="checkbox" id="hl-line-nums" /> 显示行号</label>
          </div>
          <div class="tool-field">
            <label class="tool-label">高亮预览</label>
            <div id="hl-output" class="tool-output" style="min-height: 120px; font-family: var(--font-mono); font-size: 13px; line-height: 1.5; padding: 16px; background: var(--color-surface); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); overflow-x: auto; white-space: pre;">
              <span style="color: var(--color-on-surface-variant); opacity: 0.5;">点击"高亮"查看效果</span>
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="hl-copy-html">${icon('clipboard')} 复制 HTML</button>
            <button class="btn btn-ghost" id="hl-copy-text">${icon('clipboard')} 复制纯文本</button>
          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#hl-input') as HTMLTextAreaElement;
    const langSelect = container.querySelector('#hl-lang') as HTMLSelectElement;
    const output = container.querySelector('#hl-output') as HTMLElement;
    const lineNumsCheck = container.querySelector('#hl-line-nums') as HTMLInputElement;

    let lastHtml = '';

    function doHighlight() {
      const code = input.value;
      if (!code.trim()) { output.innerHTML = '<span style="color: var(--color-on-surface-variant); opacity: 0.5;">点击"高亮"查看效果</span>'; lastHtml = ''; return; }
      const highlighted = highlightCode(code, langSelect.value);
      if (lineNumsCheck.checked) {
        output.innerHTML = highlightWithLineNumbers(highlighted);
      } else {
        output.innerHTML = highlighted;
      }
      lastHtml = output.innerHTML;
    }

    container.querySelector('#hl-highlight')!.addEventListener('click', doHighlight);

    input.addEventListener('input', () => {
      clearTimeout(hlDebounceTimer);
      hlDebounceTimer = setTimeout(doHighlight, 300);
    });
    langSelect.addEventListener('change', doHighlight);
    lineNumsCheck.addEventListener('change', doHighlight);

    container.querySelector('#hl-copy-html')!.addEventListener('click', () => {
      if (lastHtml) navigator.clipboard.writeText(lastHtml);
    });
    container.querySelector('#hl-copy-text')!.addEventListener('click', () => {
      if (input.value) navigator.clipboard.writeText(input.value);
    });
    container.querySelector('#hl-clear')!.addEventListener('click', () => {
      input.value = '';
      output.innerHTML = '<span style="color: var(--color-on-surface-variant); opacity: 0.5;">点击"高亮"查看效果</span>';
      lastHtml = '';
    });
  },
  destroy() { clearTimeout(hlDebounceTimer); },
};
