import type { UpscaleOptions, TileInfo } from './types';

function getOptimalTileSize(
  scale: number,
  imgW: number,
  imgH: number,
): number {
  const baseSize = scale === 4 ? 128 : 256;
  // Don't use tiles larger than the image
  return Math.min(baseSize, imgW, imgH);
}

function computeTiles(
  imgW: number,
  imgH: number,
  tileSize: number,
  overlap: number,
): TileInfo[] {
  const tiles: TileInfo[] = [];
  const step = tileSize - overlap;

  for (let y = 0; y < imgH; y += step) {
    for (let x = 0; x < imgW; x += step) {
      const padX = Math.max(0, x - overlap);
      const padY = Math.max(0, y - overlap);
      const padW = Math.min(tileSize + overlap * 2, imgW - padX);
      const padH = Math.min(tileSize + overlap * 2, imgH - padY);

      tiles.push({
        srcX: x, srcY: y,
        srcW: Math.min(tileSize, imgW - x),
        srcH: Math.min(tileSize, imgH - y),
        padX, padY, padW, padH,
      });
    }
  }

  return tiles;
}

function imageToTensor(
  ort: any,
  data: Uint8ClampedArray,
  w: number,
  h: number,
): { tensor: any; alpha: Uint8ClampedArray } {
  const planeSize = h * w;
  const float32 = new Float32Array(3 * planeSize);
  const alpha = new Uint8ClampedArray(planeSize);

  for (let i = 0; i < planeSize; i++) {
    float32[i] = data[i * 4] / 255.0;
    float32[planeSize + i] = data[i * 4 + 1] / 255.0;
    float32[2 * planeSize + i] = data[i * 4 + 2] / 255.0;
    alpha[i] = data[i * 4 + 3];
  }

  return {
    tensor: new ort.Tensor('float32', float32, [1, 3, h, w]),
    alpha,
  };
}

function tensorToImageData(
  tensorData: Float32Array,
  outW: number,
  outH: number,
  alpha: Uint8ClampedArray | null,
  alphaW: number,
  alphaH: number,
): ImageData {
  const planeSize = outH * outW;
  const rgba = new Uint8ClampedArray(planeSize * 4);

  for (let i = 0; i < planeSize; i++) {
    rgba[i * 4] = Math.round(Math.min(1, Math.max(0, tensorData[i])) * 255);
    rgba[i * 4 + 1] = Math.round(Math.min(1, Math.max(0, tensorData[planeSize + i])) * 255);
    rgba[i * 4 + 2] = Math.round(Math.min(1, Math.max(0, tensorData[2 * planeSize + i])) * 255);

    // Map alpha from input coordinates to output coordinates
    if (alpha) {
      const srcX = Math.floor((i % outW) / outW * alphaW);
      const srcY = Math.floor(Math.floor(i / outW) / outH * alphaH);
      const srcIdx = srcY * alphaW + srcX;
      rgba[i * 4 + 3] = alpha[Math.min(srcIdx, alpha.length - 1)];
    } else {
      rgba[i * 4 + 3] = 255;
    }
  }

  return new ImageData(rgba, outW, outH);
}

function cropImageData(imageData: ImageData, targetW: number, targetH: number): ImageData {
  if (imageData.width === targetW && imageData.height === targetH) return imageData;
  const rgba = new Uint8ClampedArray(targetW * targetH * 4);
  const src = imageData.data;
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const si = (y * imageData.width + x) * 4;
      const di = (y * targetW + x) * 4;
      rgba[di] = src[si];
      rgba[di + 1] = src[si + 1];
      rgba[di + 2] = src[si + 2];
      rgba[di + 3] = src[si + 3];
    }
  }
  return new ImageData(rgba, targetW, targetH);
}

function getModelInputSize(scale: number): number {
  return scale === 4 ? 128 : 0;
}

function padToSize(
  data: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
): Uint8ClampedArray<ArrayBuffer> {
  const rgba = new Uint8ClampedArray(targetW * targetH * 4);
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const si = (y * srcW + x) * 4;
      const di = (y * targetW + x) * 4;
      rgba[di] = data[si];
      rgba[di + 1] = data[si + 1];
      rgba[di + 2] = data[si + 2];
      rgba[di + 3] = data[si + 3];
    }
  }
  // Edge-fill right
  for (let y = 0; y < srcH; y++) {
    for (let x = srcW; x < targetW; x++) {
      const si = (y * srcW + (srcW - 1)) * 4;
      const di = (y * targetW + x) * 4;
      rgba[di] = data[si]; rgba[di + 1] = data[si + 1];
      rgba[di + 2] = data[si + 2]; rgba[di + 3] = data[si + 3];
    }
  }
  // Edge-fill bottom
  for (let y = srcH; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.min(x, srcW - 1);
      const si = ((srcH - 1) * srcW + srcX) * 4;
      const di = (y * targetW + x) * 4;
      rgba[di] = data[si]; rgba[di + 1] = data[si + 1];
      rgba[di + 2] = data[si + 2]; rgba[di + 3] = data[si + 3];
    }
  }
  return rgba;
}

function padImageData(
  imageData: ImageData,
  scale: number,
): { padded: ImageData; origW: number; origH: number } {
  const { width: imgW, height: imgH } = imageData;
  const padW = Math.ceil(imgW / scale) * scale;
  const padH = Math.ceil(imgH / scale) * scale;

  if (padW === imgW && padH === imgH) {
    return { padded: imageData, origW: imgW, origH: imgH };
  }

  return {
    padded: new ImageData(padToSize(imageData.data, imgW, imgH, padW, padH), padW, padH),
    origW: imgW, origH: imgH,
  };
}

export async function processWithTiling(
  session: any,
  ort: any,
  imageData: ImageData,
  options: UpscaleOptions,
): Promise<ImageData> {
  const scale = options.scale;
  const { padded, origW, origH } = padImageData(imageData, scale);
  const { width: imgW, height: imgH, data: imgData } = padded;
  const overlap = options.overlap ?? 16;
  const tileSize = options.tileSize ?? getOptimalTileSize(scale, imgW, imgH);

  const modelInputSize = getModelInputSize(scale);

  // For fixed-size models, constrain tile size so padded tiles fit within model input
  const effectiveTileSize = modelInputSize > 0
    ? Math.min(tileSize, modelInputSize - overlap * 2)
    : tileSize;

  // If image is small enough, process without tiling
  if (imgW <= effectiveTileSize && imgH <= effectiveTileSize) {
    options.onProgress?.({ phase: 'preprocessing', detail: '处理中...', percent: 0 });

    // For fixed-size models, pad to model input size
    const inferW = modelInputSize > 0 ? Math.max(imgW, modelInputSize) : imgW;
    const inferH = modelInputSize > 0 ? Math.max(imgH, modelInputSize) : imgH;
    const inferData = (inferW === imgW && inferH === imgH)
      ? imgData
      : padToSize(imgData, imgW, imgH, inferW, inferH);

    const { tensor, alpha } = imageToTensor(ort, inferData, inferW, inferH);
    const feeds: Record<string, any> = {};
    const inputNames = session.inputNames || ['input'];
    feeds[inputNames[0]] = tensor;

    options.onProgress?.({ phase: 'inferring', detail: 'AI 处理中...', percent: 50 });
    const results = await session.run(feeds);
    const outputTensor = results[Object.keys(results)[0]];
    const outData = outputTensor.data as Float32Array;

    const result = tensorToImageData(outData, inferW * scale, inferH * scale, alpha, inferW, inferH);
    tensor.dispose?.();
    outputTensor.dispose?.();

    // Crop to actual image output size (remove model padding)
    const cropped = cropImageData(result, imgW * scale, imgH * scale);
    options.onProgress?.({ phase: 'done', detail: '完成', percent: 100 });
    return cropImageData(cropped, origW * scale, origH * scale);
  }

  // Tiled processing
  const tiles = computeTiles(imgW, imgH, effectiveTileSize, overlap);
  const outW = imgW * scale;
  const outH = imgH * scale;

  // Create output canvas for stitching
  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d')!;

  // Create weight canvas for alpha blending
  const weightCanvas = document.createElement('canvas');
  weightCanvas.width = outW;
  weightCanvas.height = outH;
  const weightCtx = weightCanvas.getContext('2d')!;

  options.onProgress?.({ phase: 'preprocessing', detail: `处理 ${tiles.length} 个图块...`, percent: 0 });

  const inputNames = session.inputNames || ['input'];

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    options.onProgress?.({
      phase: 'inferring',
      detail: `处理图块 ${i + 1}/${tiles.length}`,
      percent: Math.round(((i + 1) / tiles.length) * 100),
    });

    // Extract tile pixels from source image
    const tileData = new Uint8ClampedArray(tile.padW * tile.padH * 4);
    for (let ty = 0; ty < tile.padH; ty++) {
      const srcRow = (tile.padY + ty) * imgW + tile.padX;
      const dstRow = ty * tile.padW;
      for (let tx = 0; tx < tile.padW; tx++) {
        const si = (srcRow + tx) * 4;
        const di = (dstRow + tx) * 4;
        tileData[di] = imgData[si];
        tileData[di + 1] = imgData[si + 1];
        tileData[di + 2] = imgData[si + 2];
        tileData[di + 3] = imgData[si + 3];
      }
    }

    // For fixed-size models, pad tile to model input size
    const inferW = modelInputSize > 0 ? Math.max(tile.padW, modelInputSize) : tile.padW;
    const inferH = modelInputSize > 0 ? Math.max(tile.padH, modelInputSize) : tile.padH;
    const inferData = (inferW === tile.padW && inferH === tile.padH)
      ? tileData
      : padToSize(tileData, tile.padW, tile.padH, inferW, inferH);

    const { tensor, alpha } = imageToTensor(ort, inferData, inferW, inferH);
    const feeds: Record<string, any> = {};
    feeds[inputNames[0]] = tensor;

    const results = await session.run(feeds);
    const outputTensor = results[Object.keys(results)[0]];
    const outData = outputTensor.data as Float32Array;

    const tileOutW = tile.padW * scale;
    const tileOutH = tile.padH * scale;

    // Convert tile output to ImageData (using inference dimensions, then crop to tile)
    const fullResult = tensorToImageData(outData, inferW * scale, inferH * scale, alpha, inferW, inferH);
    const tileResult = cropImageData(fullResult, tileOutW, tileOutH);

    // Compute the region in the output image that this tile covers
    const outX = tile.srcX * scale;
    const outY = tile.srcY * scale;
    const outTileW = tile.srcW * scale;
    const outTileH = tile.srcH * scale;

    // Compute the crop region within the tile output (remove overlap padding)
    const cropX = (tile.srcX - tile.padX) * scale;
    const cropY = (tile.srcY - tile.padY) * scale;

    // Create a temporary canvas for this tile with blending weights
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileOutW;
    tileCanvas.height = tileOutH;
    const tileCtx = tileCanvas.getContext('2d')!;
    tileCtx.putImageData(tileResult, 0, 0);

    // Create weight map for this tile (ramp from 0 at edges to 1 in center)
    const weightMapCanvas = document.createElement('canvas');
    weightMapCanvas.width = tileOutW;
    weightMapCanvas.height = tileOutH;
    const wCtx = weightMapCanvas.getContext('2d')!;

    // Fill with 1 (full weight)
    wCtx.fillStyle = 'white';
    wCtx.fillRect(0, 0, tileOutW, tileOutH);

    // Create edge ramps
    const rampSize = overlap * scale;
    if (rampSize > 0) {
      // Left ramp
      if (tile.padX < tile.srcX) {
        const grad = wCtx.createLinearGradient(0, 0, rampSize, 0);
        grad.addColorStop(0, 'black');
        grad.addColorStop(1, 'white');
        wCtx.fillStyle = grad;
        wCtx.fillRect(0, 0, rampSize, tileOutH);
      }
      // Top ramp
      if (tile.padY < tile.srcY) {
        const grad = wCtx.createLinearGradient(0, 0, 0, rampSize);
        grad.addColorStop(0, 'black');
        grad.addColorStop(1, 'white');
        wCtx.fillStyle = grad;
        wCtx.fillRect(0, 0, tileOutW, rampSize);
      }
      // Right ramp
      if (tile.padX + tile.padW > tile.srcX + tile.srcW) {
        const grad = wCtx.createLinearGradient(tileOutW - rampSize, 0, tileOutW, 0);
        grad.addColorStop(0, 'white');
        grad.addColorStop(1, 'black');
        wCtx.fillStyle = grad;
        wCtx.fillRect(tileOutW - rampSize, 0, rampSize, tileOutH);
      }
      // Bottom ramp
      if (tile.padY + tile.padH > tile.srcY + tile.srcH) {
        const grad = wCtx.createLinearGradient(0, tileOutH - rampSize, 0, tileOutH);
        grad.addColorStop(0, 'white');
        grad.addColorStop(1, 'black');
        wCtx.fillStyle = grad;
        wCtx.fillRect(0, tileOutH - rampSize, tileOutW, rampSize);
      }
    }

    // Stamp tile onto output using weighted blending
    // We use composite operations: multiply tile by weight, add to output
    const croppedTile = document.createElement('canvas');
    croppedTile.width = outTileW;
    croppedTile.height = outTileH;
    const ctCtx = croppedTile.getContext('2d')!;
    ctCtx.drawImage(tileCanvas, cropX, cropY, outTileW, outTileH, 0, 0, outTileW, outTileH);

    const croppedWeight = document.createElement('canvas');
    croppedWeight.width = outTileW;
    croppedWeight.height = outTileH;
    const cwCtx = croppedWeight.getContext('2d')!;
    cwCtx.drawImage(weightMapCanvas, cropX, cropY, outTileW, outTileH, 0, 0, outTileW, outTileH);

    // For blending: read existing pixels before writing new tile
    const tilePixels = ctCtx.getImageData(0, 0, outTileW, outTileH);
    const weightPixels = cwCtx.getImageData(0, 0, outTileW, outTileH);
    const existingPixels = outCtx.getImageData(outX, outY, outTileW, outTileH);
    const existingWeight = weightCtx.getImageData(outX, outY, outTileW, outTileH);

    for (let p = 0; p < tilePixels.data.length; p += 4) {
      const w = weightPixels.data[p] / 255; // Use red channel as weight
      const ew = existingWeight.data[p] / 255;
      const totalW = w + ew;

      if (totalW > 0) {
        const nw = w / totalW;
        existingPixels.data[p] = Math.round(existingPixels.data[p] * (1 - nw) + tilePixels.data[p] * nw);
        existingPixels.data[p + 1] = Math.round(existingPixels.data[p + 1] * (1 - nw) + tilePixels.data[p + 1] * nw);
        existingPixels.data[p + 2] = Math.round(existingPixels.data[p + 2] * (1 - nw) + tilePixels.data[p + 2] * nw);
        existingPixels.data[p + 3] = Math.round(existingPixels.data[p + 3] * (1 - nw) + tilePixels.data[p + 3] * nw);
      }
      existingWeight.data[p] = Math.round(Math.max(w, ew) * 255);
      existingWeight.data[p + 1] = existingWeight.data[p];
      existingWeight.data[p + 2] = existingWeight.data[p];
      existingWeight.data[p + 3] = 255;
    }

    outCtx.putImageData(existingPixels, outX, outY);
    weightCtx.putImageData(existingWeight, outX, outY);

    tensor.dispose?.();
    outputTensor.dispose?.();

    // Yield to UI thread
    await new Promise(r => setTimeout(r, 0));
  }

  options.onProgress?.({ phase: 'done', detail: '完成', percent: 100 });
  return cropImageData(outCtx.getImageData(0, 0, outW, outH), origW * scale, origH * scale);
}
