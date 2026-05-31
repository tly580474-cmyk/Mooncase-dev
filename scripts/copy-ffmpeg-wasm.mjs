import { mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const cores = [
  {
    name: 'core',
    source: join(rootDir, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm'),
    target: join(rootDir, 'public', 'ffmpeg', 'core'),
    files: ['ffmpeg-core.js', 'ffmpeg-core.wasm'],
  },
  {
    name: 'core-mt',
    source: join(rootDir, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'esm'),
    target: join(rootDir, 'public', 'ffmpeg', 'core-mt'),
    files: ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'],
  },
];

for (const { name, source, target, files } of cores) {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
    console.log(`Created directory: ${target}`);
  }
  for (const file of files) {
    const src = join(source, file);
    const dest = join(target, file);
    if (!existsSync(src)) {
      console.error(`Source file not found: ${src}`);
      process.exit(1);
    }
    copyFileSync(src, dest);
    console.log(`[${name}] Copied: ${file}`);
  }
}

console.log('FFmpeg WASM files copied successfully!');
