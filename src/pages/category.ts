import { icon } from '../core/icons';
import { getCategoryMeta, getToolsByCategory, type ToolCategory } from '../core/registry';
import { navigate } from '../core/router';
import { addRecentTool } from '../core/storage';

export function createCategoryPage(category: ToolCategory) {
  const meta = getCategoryMeta(category);

  return {
    id: category,
    name: meta.name,
    icon: meta.icon,
    render(container: HTMLElement) {
      const tools = getToolsByCategory(category);

      container.innerHTML = `
        <div class="content">
          <div style="margin-bottom: 40px;">
            <h1 style="font: var(--text-headline-lg); margin-bottom: 8px;">${meta.name}</h1>
            <p style="font: var(--text-body-lg); color: var(--color-on-surface-variant);">${meta.description}</p>
          </div>

          <div class="tool-grid tool-grid--3">
            ${tools.map(tool => `
              <a class="category-card" href="#/${tool.id}" data-tool-id="${tool.id}">
                <div class="category-card-icon" style="background: ${meta.color}15; color: ${meta.color};">
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
