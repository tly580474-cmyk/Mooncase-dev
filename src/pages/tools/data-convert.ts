import { icon } from '../../core/icons';

type DataFormat = 'csv' | 'json' | 'xml';

function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return '[]';
  const headers = parseCSVLine(lines[0]);
  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });
    result.push(obj);
  }
  return JSON.stringify(result, null, 2);
}

function csvToXml(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return '<root/>';
  const headers = parseCSVLine(lines[0]);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    xml += '  <row>\n';
    headers.forEach((h, idx) => {
      xml += `    <${h}>${escapeXml(values[idx] ?? '')}</${h}>\n`;
    });
    xml += '  </row>\n';
  }
  xml += '</root>';
  return xml;
}

function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return '';
  const headers = [...new Set(arr.flatMap((o: Record<string, unknown>) => Object.keys(o)))];
  const lines = [headers.join(',')];
  for (const obj of arr) {
    lines.push(headers.map(h => csvEscape(String(obj[h] ?? ''))).join(','));
  }
  return lines.join('\n');
}

function jsonToXml(json: string): string {
  const data = JSON.parse(json);
  const arr = Array.isArray(data) ? data : [data];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  for (const obj of arr) {
    xml += '  <item>\n';
    for (const [k, v] of Object.entries(obj)) {
      xml += `    <${k}>${escapeXml(String(v ?? ''))}</${k}>\n`;
    }
    xml += '  </item>\n';
  }
  xml += '</root>';
  return xml;
}

function xmlToJson(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const errNode = doc.querySelector('parsererror');
  if (errNode) throw new Error('XML 格式错误: ' + errNode.textContent?.slice(0, 100));

  const root = doc.documentElement;
  const items = Array.from(root.children);
  if (items.length === 0) return '[]';

  const result: Record<string, string>[] = [];
  for (const item of items) {
    const obj: Record<string, string> = {};
    for (const child of Array.from(item.children)) {
      obj[child.tagName] = child.textContent ?? '';
    }
    result.push(obj);
  }
  return JSON.stringify(result, null, 2);
}

function xmlToCsv(xml: string): string {
  const json = xmlToJson(xml);
  return jsonToCsv(json);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { result.push(current); current = ''; }
      else current += ch;
    }
  }
  result.push(current);
  return result;
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function convert(input: string, from: DataFormat, to: DataFormat): string {
  if (from === to) return input;
  if (from === 'csv' && to === 'json') return csvToJson(input);
  if (from === 'csv' && to === 'xml') return csvToXml(input);
  if (from === 'json' && to === 'csv') return jsonToCsv(input);
  if (from === 'json' && to === 'xml') return jsonToXml(input);
  if (from === 'xml' && to === 'json') return xmlToJson(input);
  if (from === 'xml' && to === 'csv') return xmlToCsv(input);
  throw new Error('不支持的转换');
}

function detectFormat(text: string): DataFormat {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.startsWith('<')) return 'xml';
  return 'csv';
}

const SAMPLES: Record<DataFormat, string> = {
  csv: `name,age,city
Alice,25,Beijing
Bob,30,Shanghai
Charlie,28,Shenzhen`,
  json: `[
  { "name": "Alice", "age": 25, "city": "Beijing" },
  { "name": "Bob", "age": 30, "city": "Shanghai" },
  { "name": "Charlie", "age": 28, "city": "Shenzhen" }
]`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>
    <name>Alice</name>
    <age>25</age>
    <city>Beijing</city>
  </item>
  <item>
    <name>Bob</name>
    <age>30</age>
    <city>Shanghai</city>
  </item>
  <item>
    <name>Charlie</name>
    <age>28</age>
    <city>Shenzhen</city>
  </item>
</root>`,
};

let dcTimer: ReturnType<typeof setTimeout>;

export default {
  id: 'data-convert',
  name: '数据格式转换',
  icon: 'file_type',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/data" class="tool-page-back">${icon('data_object')} 数据格式</a>
          <h1 style="font: var(--text-headline-md);">数据格式转换</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">CSV / JSON / XML 数据格式互转</p>
        </div>
        <div class="tool-page-body">
          <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;">
            <div>
              <label class="tool-label">源格式</label>
              <select id="dc-from" class="tool-select">
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </select>
            </div>
            <button class="btn btn-secondary" id="dc-swap" style="margin-top:20px;" title="交换">${icon('swap_horiz')}</button>
            <div>
              <label class="tool-label">目标格式</label>
              <select id="dc-to" class="tool-select">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
              </select>
            </div>
          </div>
          <div class="tool-field">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <label class="tool-label">输入</label>
              <button class="btn btn-ghost" id="dc-sample" style="font:var(--text-body-sm);">填入示例</button>
            </div>
            <textarea id="dc-input" class="tool-textarea" rows="10" placeholder="粘贴 CSV / JSON / XML 数据..." style="font-family:var(--font-mono);font-size:13px;"></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-primary" id="dc-convert">${icon('swap_horiz')} 转换</button>
          </div>
          <div class="tool-field">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <label class="tool-label">输出</label>
              <button class="btn btn-ghost" id="dc-copy" style="font:var(--text-body-sm);">${icon('content_copy')} 复制</button>
            </div>
            <textarea id="dc-output" class="tool-textarea" rows="10" readonly style="font-family:var(--font-mono);font-size:13px;"></textarea>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="dc-download">${icon('download')} 下载输出文件</button>
          </div>
          <div id="dc-error" style="color:var(--color-error);font:var(--text-body-sm);margin-top:8px;display:none;"></div>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#dc-input') as HTMLTextAreaElement;
    const outputEl = container.querySelector('#dc-output') as HTMLTextAreaElement;
    const fromEl = container.querySelector('#dc-from') as HTMLSelectElement;
    const toEl = container.querySelector('#dc-to') as HTMLSelectElement;
    const errorEl = container.querySelector('#dc-error') as HTMLElement;

    function doConvert() {
      const text = inputEl.value.trim();
      if (!text) { outputEl.value = ''; errorEl.style.display = 'none'; return; }
      try {
        const result = convert(text, fromEl.value as DataFormat, toEl.value as DataFormat);
        outputEl.value = result;
        errorEl.style.display = 'none';
      } catch (e: any) {
        outputEl.value = '';
        errorEl.textContent = e.message || '转换失败';
        errorEl.style.display = '';
      }
    }

    // Auto-detect and sync when input changes
    inputEl.addEventListener('input', () => {
      clearTimeout(dcTimer);
      dcTimer = setTimeout(() => {
        if (inputEl.value.trim()) {
          fromEl.value = detectFormat(inputEl.value);
        }
        doConvert();
      }, 300);
    });

    fromEl.addEventListener('change', doConvert);
    toEl.addEventListener('change', doConvert);

    container.querySelector('#dc-convert')!.addEventListener('click', doConvert);

    container.querySelector('#dc-swap')!.addEventListener('click', () => {
      const tmp = fromEl.value;
      fromEl.value = toEl.value;
      toEl.value = tmp;
      // Also swap content if output is non-empty
      if (outputEl.value) {
        inputEl.value = outputEl.value;
        doConvert();
      }
    });

    container.querySelector('#dc-sample')!.addEventListener('click', () => {
      const fmt = fromEl.value as DataFormat;
      inputEl.value = SAMPLES[fmt];
      doConvert();
    });

    container.querySelector('#dc-copy')!.addEventListener('click', () => {
      if (outputEl.value) navigator.clipboard.writeText(outputEl.value);
    });

    container.querySelector('#dc-download')!.addEventListener('click', () => {
      if (!outputEl.value) return;
      const ext = toEl.value;
      const mime: Record<string, string> = { csv: 'text/csv', json: 'application/json', xml: 'application/xml' };
      const blob = new Blob([outputEl.value], { type: mime[ext] || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `output.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  },
  destroy() { clearTimeout(dcTimer); },
};
