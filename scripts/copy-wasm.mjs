import { mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const sourceDir = join(rootDir, 'node_modules', 'onnxruntime-web', 'dist');
const targetDir = join(rootDir, 'public', 'ort');

// All WASM files — copy every variant so ORT can fall back
// when SharedArrayBuffer or SIMD are unavailable
const files = [
  'ort-wasm-simd-threaded.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jspi.wasm',
  'ort-wasm-simd-threaded.jspi.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.asyncify.mjs',
];

// Create target directory if it doesn't exist
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
  console.log('Created directory: public/ort/');
}

// Copy each file
for (const file of files) {
  const source = join(sourceDir, file);
  const target = join(targetDir, file);

  if (!existsSync(source)) {
    console.error(`Source file not found: ${source}`);
    process.exit(1);
  }

  copyFileSync(source, target);
  console.log(`Copied: ${file}`);
}

console.log('WASM files copied successfully!');
