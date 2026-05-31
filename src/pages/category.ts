import { icon } from '../core/icons';
import { getToolsByCategory, type ToolCategory } from '../core/registry';
import { navigate } from '../core/router';
import { addRecentTool } from '../core/storage';

const categoryNames: Record<ToolCategory, string> = {
  text: '文本工具',
  image: '图片工具',
  code: '代码工具',
  conversion: '格式转换',
  encoding: '编码解码',
  generator: '生成器',
  security: '安全工具',
  network: '网络工具',
};

const categoryDescriptions: Record<ToolCategory, string> = {
  text: '文本处理、转换、对比与统计工具',
  image: '图片压缩、转换与在线编辑',
  code: '代码格式化、压缩与测试工具',
  conversion: '各种格式之间的互转工具',
  encoding: 'Unicode、Base64、URL、摩斯密码等编解码工具',
  generator: '密码、UUID、占位文等生成工具',
  security: '加密、哈希、安全检测工具',
  network: 'IP 查询、DNS 解析等网络工具',
};

const categoryColors: Record<ToolCategory, string> = {
  text: '#3d70d8',
  image: '#5c8cf5',
  code: '#1b57bd',
  conversion: '#585c65',
  encoding: '#0f766e',
  generator: '#585f6a',
  security: '#ba1a1a',
  network: '#1f59c0',
};

export function createCategoryPage(category: ToolCategory) {
  return {
    id: category,
    name: categoryNames[category],
    icon: 'description',
    render(container: HTMLElement) {
      const tools = getToolsByCategory(category);

      container.innerHTML = `
        <div class="content">
          <div style="margin-bottom: 40px;">
            <h1 style="font: var(--text-headline-lg); margin-bottom: 8px;">${categoryNames[category]}</h1>
            <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">${categoryDescriptions[category]}</p>
          </div>

          <div class="tool-grid tool-grid--3">
            ${tools.map(tool => `
              <a class="category-card" href="#/${tool.id}" data-tool-id="${tool.id}">
                <div class="category-card-icon" style="background: ${categoryColors[category]}15; color: ${categoryColors[category]};">
                  ${icon(tool.icon, 28)}
                </div>
                <h3 class="category-card-name">${tool.name}</h3>
                <p class="category-card-desc">${tool.description}</p>
                <span class="category-card-arrow">→</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;

      container.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('.category-card') as HTMLElement;
        if (!card) return;
        e.preventDefault();
        const toolId = card.dataset.toolId!;
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
          addRecentTool(tool.id, tool.name);
        }
        navigate(toolId);
      });
    },
  };
}
