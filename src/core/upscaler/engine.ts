import type { UpscaleOptions, InferenceBackend, ScaleFactor, UpscaleProgress } from './types';
import { MODEL_URLS, BACKUP_MODEL_URLS } from './types';

const ERR_SAB_MISSING =
  '浏览器不支持 SharedArrayBuffer，ONNX Runtime 无法初始化。\n' +
  '请确保 Web 服务器配置了以下响应头：\n' +
  '  Cross-Origin-Opener-Policy: same-origin\n' +
  '  Cross-Origin-Embedder-Policy: require-corp';

// Minimal IndexedDB wrapper for model caching
const DB_NAME = 'upscaler-models';
const DB_VERSION = 1;
const STORE_NAME = 'models';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedModel(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function cacheModel(key: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Caching is best-effort
  }
}

function getModelUrl(scale: ScaleFactor): string {
  return MODEL_URLS[scale];
}

function getExecutionProviders(backend: InferenceBackend): string[] {
  switch (backend) {
    case 'webgpu':
      return ['webgpu', 'wasm'];
    case 'webgl':
      return ['webgl', 'wasm'];
    case 'wasm':
    default:
      return ['wasm'];
  }
}

export async function detectBackends(): Promise<InferenceBackend[]> {
  const available: InferenceBackend[] = ['wasm'];

  // WebGL detection
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) available.unshift('webgl');
  } catch {}

  // WebGPU detection
  if (typeof navigator !== 'undefined' && (navigator as any).gpu) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) available.unshift('webgpu');
    } catch {}
  }

  return available;
}

let ortModule: any = null;
let currentSession: any = null;
let currentModelKey = '';
let engineBusy = false;
let _preflightResult: { ok: boolean; reason?: string } | null = null;

async function getOrt() {
  if (!ortModule) {
    ortModule = await import('onnxruntime-web');
    // Set WASM paths to local files (avoid COEP cross-origin issues)
    ortModule.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`;
    // Single-threaded mode avoids SharedArrayBuffer requirement on browsers
    // that lack COOP/COEP headers (common in production deployments)
    ortModule.env.wasm.numThreads = 1;
    ortModule.env.wasm.proxy = false;
    ortModule.env.wasm.simd = true;
  }
  return ortModule;
}

export async function preflightCheck(): Promise<{ ok: boolean; reason?: string }> {
  // Return cached result if already run
  if (_preflightResult) return _preflightResult;

  try {
    // Check for SharedArrayBuffer (required by ORT's WASM backend)
    if (typeof SharedArrayBuffer === 'undefined') {
      _preflightResult = { ok: false, reason: ERR_SAB_MISSING };
      return _preflightResult;
    }

    const ort = await getOrt();
    if (typeof ort.InferenceSession?.create !== 'function') {
      _preflightResult = { ok: false, reason: 'ONNX Runtime 初始化异常：InferenceSession 不可用' };
      return _preflightResult;
    }

    // Actually exercise the WASM runtime to catch 404 / compile failures early.
    // Creating a tiny Tensor triggers WASM loading if not already loaded.
    try {
      const probe = new ort.Tensor('float32', new Float32Array([1, 2, 3, 4]), [1, 2, 2]);
      probe.dispose?.();
    } catch (err: any) {
      _preflightResult = {
        ok: false,
        reason: `WASM 运行时不可用: ${err.message || err}。请确认 /ort/ 目录下的 .wasm 文件可正常访问`,
      };
      return _preflightResult;
    }

    _preflightResult = { ok: true };
    return _preflightResult;
  } catch (err: any) {
    _preflightResult = { ok: false, reason: `ONNX Runtime 加载失败: ${err.message || err}` };
    return _preflightResult;
  }
}

async function loadModelBuffer(
  scale: ScaleFactor,
  onProgress?: (p: UpscaleProgress) => void,
): Promise<ArrayBuffer> {
  const cacheKey = `esrgan-${scale}x`;

  // Try IndexedDB cache first
  const cached = await getCachedModel(cacheKey);
  if (cached) {
    onProgress?.({ phase: 'loading-model', detail: '从缓存加载模型...', percent: 90 });
    return cached;
  }

  const primaryUrl = getModelUrl(scale);
  const backupUrl = BACKUP_MODEL_URLS[scale];
  const urls = [primaryUrl, backupUrl];

  let lastError: Error | null = null;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const isBackup = i > 0;
    try {
      onProgress?.({
        phase: 'loading-model',
        detail: isBackup ? '尝试备用源下载模型...' : '下载模型中...',
        percent: 0,
      });

      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const contentLength = resp.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength) : 0;

      if (resp.body && total > 0) {
        const reader = resp.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          onProgress?.({
            phase: 'loading-model',
            detail: `${isBackup ? '[备用源] ' : ''}下载中 ${(received / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)} MB`,
            percent: Math.round((received / total) * 80),
          });
        }

        const buffer = new Uint8Array(received);
        let offset = 0;
        for (const chunk of chunks) {
          buffer.set(chunk, offset);
          offset += chunk.length;
        }

        // new Uint8Array always allocates a fresh buffer at offset 0 — return directly
        onProgress?.({ phase: 'loading-model', detail: '缓存模型...', percent: 90 });
        await cacheModel(cacheKey, buffer.buffer);
        return buffer.buffer;
      }

      onProgress?.({ phase: 'loading-model', detail: `${isBackup ? '[备用源] ' : ''}下载中...`, percent: 50 });
      const buf = await resp.arrayBuffer();
      onProgress?.({ phase: 'loading-model', detail: '缓存模型...', percent: 90 });
      await cacheModel(cacheKey, buf);
      return buf;
    } catch (err) {
      lastError = err as Error;
      // Try next URL
    }
  }

  throw new Error(`模型下载失败：所有下载源均不可用。主源: ${primaryUrl}，备用源: ${backupUrl}。最后错误: ${lastError?.message}`);
}

export async function loadModelFromFile(
  file: File,
  scale: ScaleFactor,
  onProgress?: (p: UpscaleProgress) => void,
): Promise<void> {
  const cacheKey = `esrgan-${scale}x`;

  onProgress?.({ phase: 'loading-model', detail: `读取本地模型文件 (${(file.size / 1024 / 1024).toFixed(1)} MB)...`, percent: 0 });

  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.({
          phase: 'loading-model',
          detail: `读取本地模型 ${(e.loaded / 1024 / 1024).toFixed(1)} / ${(e.total / 1024 / 1024).toFixed(1)} MB`,
          percent: Math.round((e.loaded / e.total) * 80),
        });
      }
    };
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });

  onProgress?.({ phase: 'loading-model', detail: '缓存模型...', percent: 90 });
  await cacheModel(cacheKey, buffer);
  onProgress?.({ phase: 'loading-model', detail: '本地模型已就绪', percent: 100 });
}

function translateError(msg: string, provider: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return `${provider}: 网络请求失败，WASM 文件可能不可访问`;
  }
  if (lower.includes('abort') && (lower.includes('runtime') || lower.includes('exit'))) {
    return `${provider}: WASM 运行时异常退出，可能模型与后端不兼容`;
  }
  if (lower.includes('not a function') || lower.includes('undefined')) {
    return `${provider}: ONNX 运行时组件缺失，WASM 文件可能加载不完整`;
  }
  if (lower.includes('cannot read propert')) {
    return `${provider}: ONNX 运行时初始化不完整`;
  }
  return `${provider}: ${msg}`;
}

async function createSessionWithFallback(
  modelBuffer: ArrayBuffer,
  preferredBackend: InferenceBackend,
  onProgress?: (p: UpscaleProgress) => void,
) {
  const ort = await getOrt();
  const providers = getExecutionProviders(preferredBackend);
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      onProgress?.({ phase: 'loading-model', detail: `初始化 ${provider.toUpperCase()} 推理后端...`, percent: 95 });

      const sessionOptions: any = {
        executionProviders: [provider],
        graphOptimizationLevel: 'basic',
        intraOpNumThreads: 1,
      };

      // Disable pthread proxy for WASM to avoid SharedArrayBuffer dependency
      if (provider === 'wasm') {
        sessionOptions.enableCpuMemArena = false;
      }

      const session = await ort.InferenceSession.create(modelBuffer, sessionOptions);
      return { session, backend: provider as InferenceBackend };
    } catch (err) {
      const msg = translateError((err as Error).message || String(err), provider.toUpperCase());
      errors.push(msg);
    }
  }

  throw new Error(`所有推理后端均初始化失败:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
}

export async function runUpscale(
  imageData: ImageData,
  options: UpscaleOptions,
): Promise<ImageData> {
  if (engineBusy) throw new Error('引擎正忙，请等待当前任务完成');

  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error(ERR_SAB_MISSING);
  }

  engineBusy = true;
  try {
  const modelKey = `${options.scale}x`;

  if (currentModelKey !== modelKey || !currentSession) {
    if (currentSession) {
      try { currentSession.release(); } catch {}
      currentSession = null;
    }

    const modelBuffer = await loadModelBuffer(options.scale, options.onProgress);
    const result = await createSessionWithFallback(modelBuffer, options.backend, options.onProgress);
    currentSession = result.session;
    currentModelKey = modelKey;
  }

  const ort = await getOrt();
  const { processWithTiling } = await import('./tile');
  return processWithTiling(currentSession, ort, imageData, options);
  } finally {
    engineBusy = false;
  }
}

export function disposeEngine() {
  if (currentSession) {
    try { currentSession.release(); } catch {}
    currentSession = null;
    currentModelKey = '';
  }
  engineBusy = false;
}
