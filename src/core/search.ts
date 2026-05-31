import { getRegistry, type ToolMeta } from './registry';

let index: ToolMeta[] | null = null;

function ensureIndex(): ToolMeta[] {
  if (!index) {
    index = getRegistry();
  }
  return index;
}

export function searchTools(query: string): ToolMeta[] {
  const tools = ensureIndex();
  const q = query.toLowerCase().trim();
  if (!q) return tools;

  return tools.filter(tool => {
    const haystack = [
      tool.name,
      tool.description,
      ...tool.tags,
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export function initSearch(inputEl: HTMLInputElement, onSelect: (toolId: string) => void) {
  const resultsEl = document.getElementById('search-results')!;

  inputEl.addEventListener('input', () => {
    const query = inputEl.value;
    const results = searchTools(query);

    if (!query.trim()) {
      resultsEl.style.display = 'none';
      resultsEl.innerHTML = '';
      return;
    }

    if (results.length === 0) {
      resultsEl.innerHTML = `<div class="search-result-item search-result-empty">未找到匹配的工具</div>`;
      resultsEl.style.display = 'block';
      return;
    }

    resultsEl.innerHTML = results.slice(0, 8).map(tool => `
      <a class="search-result-item" href="#/${tool.id}" data-tool-id="${tool.id}">
        <span class="search-result-name">${tool.name}</span>
        <span class="search-result-desc">${tool.description}</span>
      </a>
    `).join('');
    resultsEl.style.display = 'block';
  });

  resultsEl.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.search-result-item') as HTMLAnchorElement;
    if (!item) return;
    const toolId = item.dataset.toolId;
    if (toolId) {
      onSelect(toolId);
      resultsEl.style.display = 'none';
      inputEl.value = '';
    }
  });

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target as Node) && !resultsEl.contains(e.target as Node)) {
      resultsEl.style.display = 'none';
    }
  });
}
