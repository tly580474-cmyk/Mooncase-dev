# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**月光宝盒 (Mooncase)** — a pure-client-side Chinese online toolbox SPA. All processing runs in the browser via WASM; no backend server.

- **Stack**: Vanilla TypeScript + Vite (no framework). CSS custom properties for theming.
- **Routing**: Hash-based (#/tool-id) custom router with lazy-loaded tool pages.
- **WASM Dependencies**: `@ffmpeg/ffmpeg` (video/audio), `onnxruntime-web` (AI upscaling), `tesseract.js` (OCR).
- **Dev server requires COOP/COEP headers** (configured in vite.config.ts) for SharedArrayBuffer support.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (copies WASM files, serves with COOP/COEP headers)
npm run build        # Copy WASM files + tsc type-check + vite build
npm run preview      # Preview production build locally
```

## Architecture

### Entry & Shell

- `index.html` → loads `/src/main.ts`
- `main.ts` imports CSS tokens/layout/components, then calls `initShell()` from `src/core/shell.ts`
- `shell.ts` renders the persistent layout: sidebar nav, header with breadcrumb/theme toggle, and `#content-area`
- `src/styles/` contains three CSS files: `tokens.css` (design tokens + dark mode), `base.css`, `layout.css`

### Router (`src/core/router.ts`)

Hash-based lazy-loading router: `location.hash` → tool ID → dynamic `import()` of the page module → calls `render(container)`. Destruction via optional `destroy()` callback on the module. Tool IDs are registered in a static map (`toolLoaders`).

### Tool Page Pattern

Every tool in `src/pages/tools/` exports a default object:

```typescript
export default {
  id: 'tool-id',
  name: '工具名称',
  icon: 'icon-name',       // key in src/core/icons.ts
  render(container: HTMLElement) { /* sets container.innerHTML, binds events */ },
  destroy?() { /* cleanup */ },
};
```

Category pages (`src/pages/category.ts`) dynamically render a grid of tools within a given category and delegate navigation on click.

### Registry (`src/core/registry.ts`)

Single source of truth for all tool metadata: `id`, `name`, `icon`, `category`, `description`, `tags`. Used by category pages, search, and home page bento grid. Categories: `text`, `image`, `code`, `encoding`, `conversion`, `generator`, `security`, `network`.

### Core Utilities

| File | Purpose |
|------|---------|
| `src/core/icons.ts` | Inline SVG icons (Lucide-based, no icon library dependency) |
| `src/core/storage.ts` | `localStorage` wrapper with `moonbox_` prefix, recent tools, favorites, theme preference |
| `src/core/search.ts` | Client-side search over the registry (name + description + tags) |
| `src/core/theme.ts` | Dark/light/system theme toggle, persists to localStorage |
| `src/core/toast.ts` | Simple toast notification singleton |
| `src/core/ffmpeg-utils.ts` | FFmpeg WASM singleton with MT → ST auto-fallback, load timeout, file validation |
| `src/core/gif-encoder.ts` | GIF encoder for GIF maker and animated avatar tools |

### WASM Build Steps

- `scripts/copy-wasm.mjs` — copies ONNX Runtime WASM files from `node_modules/` to `public/ort/`
- `scripts/copy-ffmpeg-wasm.mjs` — copies FFmpeg core WASM files to `public/ffmpeg/core/` and `public/ffmpeg/core-mt/`
- Both run automatically via `npm run dev` and `npm run build`
