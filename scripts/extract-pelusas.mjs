import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';

const INPUTS = [
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-dd247f07-80ae-4afe-898d-7c506b28f044.png',
    out: 'pelusa_1.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-04cdb1c8-3f4e-40e7-9dcc-bcf9fe30a7b8.png',
    out: 'pelusa_2.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-44febd3d-c035-49b2-97d6-2f111684c9fe.png',
    out: 'pelusa_3.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-a79c3249-1095-4121-8b35-7e01fd5b9e51.png',
    out: 'pelusa_4.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-b73ae591-30fb-4588-b430-ffc40ddf2e16.png',
    out: 'pelusa_5.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-27b9ed15-b195-418e-b046-3f82c20bb454.png',
    out: 'pelusa_6.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-011ba7ac-9a02-4f17-9326-07979b86e985.png',
    out: 'pelusa_7.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-f5c20fb5-4bb4-4172-b400-e6d2fbb760da.png',
    out: 'pelusa_8.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-181756d7-7280-4b59-aa51-bba494cd7f74.png',
    out: 'pelusa_9.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-6295f14a-20c8-41b2-b169-d6fcbac73f0b.png',
    out: 'pelusa_10.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-cf7dbb98-5dc3-4c72-964d-58c584570e4f.png',
    out: 'pelusa_20.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-fbe7f375-e3ef-4ea1-bc96-2a3ccfb9656f.png',
    out: 'pelusa_n7.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-02b5d66f-0eb0-4696-bbae-934ebb0b549d.png',
    out: 'pelusa_4_rev.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-a1fd3b16-8605-43c7-9961-4b75413049b7.png',
    out: 'pelusa_5_rev.png',
  },
  {
    src: 'C:/Users/Julián/.cursor/projects/d-Documentos-Proyectos-JbGamesScore-JbGamesScore/assets/c__Users_Juli_n_AppData_Roaming_Cursor_User_workspaceStorage_ba8a09287afa8b8e766b9552380f72b1_images_image-770cf1bf-ecbd-4914-88a1-1d468eab6abe.png',
    out: 'pelusa_7_rev.png',
  },
];

const OUT_DIR = path.resolve('assets/pelusas');

function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleBackgroundFromStrip(data, width, stripHeight, channels) {
  const samples = [];
  for (let y = 0; y < stripHeight; y++) {
    for (let x = 0; x < width; x += 3) {
      const i = (y * width + x) * channels;
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  const avg = [0, 0, 0];
  for (const [r, g, b] of samples) {
    avg[0] += r;
    avg[1] += g;
    avg[2] += b;
  }
  avg[0] /= samples.length;
  avg[1] /= samples.length;
  avg[2] /= samples.length;
  return avg;
}

function isBackgroundPixel(r, g, b, bg, threshold) {
  return colorDistance(r, g, b, bg[0], bg[1], bg[2]) <= threshold;
}

function floodBackgroundMask(data, width, height, channels, bg, threshold) {
  const mask = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (mask[idx]) return;
    const i = idx * channels;
    if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2], bg, threshold)) return;
    mask[idx] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    if (x > 0) tryPush(x - 1, y);
    if (x < width - 1) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y < height - 1) tryPush(x, y + 1);
  }

  return mask;
}

function keepForegroundComponentAt(foregroundMask, width, height, seedX, seedY) {
  const result = new Uint8Array(width * height);
  const start = seedY * width + seedX;
  if (!foregroundMask[start]) return result;

  const queue = [[seedX, seedY]];
  result[start] = 1;

  while (queue.length) {
    const [x, y] = queue.pop();
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const idx = ny * width + nx;
      if (!foregroundMask[idx] || result[idx]) continue;
      result[idx] = 1;
      queue.push([nx, ny]);
    }
  }

  return result;
}

function buildForegroundMask(bgMask, width, height) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = bgMask[i] ? 0 : 1;
  }
  return mask;
}

function dilateMask(mask, width, height, radius) {
  const dilated = new Uint8Array(mask);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          dilated[ny * width + nx] = 1;
        }
      }
    }
  }
  return dilated;
}

function labelComponents(mask, width, height) {
  const labels = new Int32Array(width * height);
  const sizes = [0];
  let label = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      if (!mask[start] || labels[start]) continue;

      label += 1;
      let size = 0;
      const queue = [[x, y]];
      labels[start] = label;

      while (queue.length) {
        const [cx, cy] = queue.pop();
        size += 1;
        for (const [nx, ny] of [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ]) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const idx = ny * width + nx;
          if (!mask[idx] || labels[idx]) continue;
          labels[idx] = label;
          queue.push([nx, ny]);
        }
      }

      sizes[label] = size;
    }
  }

  return { labels, sizes, count: label };
}

function componentBounds(labels, label, width, height) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (labels[y * width + x] !== label) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  return { minX, minY, maxX, maxY };
}

function boxesOverlap(a, b, margin) {
  return !(
    a.maxX + margin < b.minX - margin ||
    b.maxX + margin < a.minX - margin ||
    a.maxY + margin < b.minY - margin ||
    b.maxY + margin < a.minY - margin
  );
}

function keepCreatureCluster(
  roughForeground,
  width,
  height,
  minComponentSize,
  clusterMargin,
) {
  const { labels, sizes, count } = labelComponents(roughForeground, width, height);
  if (count === 0) return roughForeground;

  let mainLabel = 1;
  for (let i = 2; i <= count; i++) {
    if (sizes[i] > sizes[mainLabel]) mainLabel = i;
  }

  const mainBounds = componentBounds(labels, mainLabel, width, height);
  const keep = new Uint8Array(width * height);

  for (let label = 1; label <= count; label++) {
    const size = sizes[label] ?? 0;
    if (size === 0) continue;
    const bounds = componentBounds(labels, label, width, height);
    const shouldKeep =
      label === mainLabel ||
      size >= minComponentSize ||
      boxesOverlap(bounds, mainBounds, clusterMargin);

    if (!shouldKeep) continue;

    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === label) keep[i] = 1;
    }
  }

  return keep;
}

function floodExteriorBackground(
  data,
  width,
  height,
  channels,
  bg,
  threshold,
  barrier,
  edgeSamples = [],
) {
  const exterior = new Uint8Array(width * height);
  const queue = [];

  const isExteriorBg = (r, g, b) =>
    edgeSamples.length > 0
      ? matchesBackground(r, g, b, bg, edgeSamples, threshold)
      : isBackgroundPixel(r, g, b, bg, threshold);

  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (exterior[idx] || barrier[idx]) return;
    const i = idx * channels;
    if (!isExteriorBg(data[i], data[i + 1], data[i + 2])) return;
    exterior[idx] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      tryPush(nx, ny);
    }
  }

  return exterior;
}

function isWhitePixel(r, g, b) {
  return r > 190 && g > 190 && b > 190;
}

function dilateWhiteMask(data, width, height, channels, radius) {
  const base = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (isWhitePixel(data[i], data[i + 1], data[i + 2])) {
        base[y * width + x] = 1;
      }
    }
  }

  return dilateMask(base, width, height, radius);
}

function maskInsideWhiteSticker(data, width, height, channels) {
  const OUT = 1;
  const grid = new Uint8Array(width * height);
  const whiteMask = dilateWhiteMask(data, width, height, channels, 2);

  for (let i = 0; i < whiteMask.length; i++) {
    if (whiteMask[i]) grid[i] = 2;
  }

  const queue = [];
  const tryOutside = (x, y) => {
    const idx = y * width + x;
    if (grid[idx]) return;
    grid[idx] = OUT;
    queue.push([x, y]);
  };

  for (let x = 0; x < width; x++) {
    tryOutside(x, 0);
    tryOutside(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryOutside(0, y);
    tryOutside(width - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      tryOutside(nx, ny);
    }
  }

  const inside = new Uint8Array(width * height);
  for (let i = 0; i < grid.length; i++) {
    inside[i] = grid[i] !== OUT ? 1 : 0;
  }
  return inside;
}

function findSeedNearCenter(foregroundMask, width, height) {
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  if (foregroundMask[cy * width + cx]) return [cx, cy];

  for (let radius = 1; radius < Math.max(width, height); radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        if (foregroundMask[y * width + x]) return [x, y];
      }
    }
  }

  return [cx, cy];
}

function buildStandardAlphaMask(data, width, height, channels, bg, threshold) {
  const bgMask = floodBackgroundMask(data, width, height, channels, bg, threshold);
  const roughForeground = buildForegroundMask(bgMask, width, height);
  const [seedX, seedY] = findSeedNearCenter(roughForeground, width, height);
  const centerComponent = keepForegroundComponentAt(
    roughForeground,
    width,
    height,
    seedX,
    seedY,
  );
  const stickerInterior = maskInsideWhiteSticker(data, width, height, channels);

  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = centerComponent[i] && stickerInterior[i] ? 1 : 0;
  }
  return alpha;
}

function sampleBackgroundFromEdges(data, width, height, channels) {
  const samples = [];
  const add = (x, y) => {
    const i = (y * width + x) * channels;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  };

  for (let x = 0; x < width; x += 2) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 0; y < height; y += 2) {
    add(0, y);
    add(width - 1, y);
  }

  const avg = [0, 0, 0];
  for (const [r, g, b] of samples) {
    avg[0] += r;
    avg[1] += g;
    avg[2] += b;
  }
  avg[0] /= samples.length;
  avg[1] /= samples.length;
  avg[2] /= samples.length;
  return avg;
}

function componentCentroid(labels, label, width, height) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (labels[y * width + x] !== label) continue;
      sumX += x;
      sumY += y;
      count += 1;
    }
  }
  return count ? [sumX / count, sumY / count] : [width / 2, height / 2];
}

function keepRevolutionCluster(roughForeground, width, height) {
  const { labels, sizes, count } = labelComponents(roughForeground, width, height);
  if (count === 0) return roughForeground;

  let mainLabel = 1;
  for (let i = 2; i <= count; i++) {
    if (sizes[i] > sizes[mainLabel]) mainLabel = i;
  }

  const [mainCx, mainCy] = componentCentroid(labels, mainLabel, width, height);
  const mainBounds = componentBounds(labels, mainLabel, width, height);
  const keep = new Uint8Array(width * height);
  const maxOrbit = 45;
  const maxSatelliteSize = 900;

  for (let label = 1; label <= count; label++) {
    const size = sizes[label] ?? 0;
    if (size === 0) continue;
    const [cx, cy] = componentCentroid(labels, label, width, height);
    const dist = Math.hypot(cx - mainCx, cy - mainCy);
    const bounds = componentBounds(labels, label, width, height);
    const shouldKeep =
      label === mainLabel ||
      (dist <= maxOrbit && size >= 12 && size <= maxSatelliteSize) ||
      boxesOverlap(bounds, mainBounds, 4);

    if (!shouldKeep) continue;

    for (let i = 0; i < labels.length; i++) {
      if (labels[i] === label) keep[i] = 1;
    }
  }

  return keep;
}

function sampleEdgeColors(data, width, height, channels) {
  const samples = [];
  const add = (x, y) => {
    const i = (y * width + x) * channels;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  };

  for (let x = 0; x < width; x += 2) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 0; y < height; y += 2) {
    add(0, y);
    add(width - 1, y);
  }

  return samples;
}

function matchesBackground(r, g, b, bg, edgeSamples, threshold) {
  if (colorDistance(r, g, b, bg[0], bg[1], bg[2]) <= threshold) return true;
  for (const [sr, sg, sb] of edgeSamples) {
    if (colorDistance(r, g, b, sr, sg, sb) <= threshold) return true;
  }
  return false;
}

function isCardDecorationPixel(r, g, b, bg, threshold) {
  if (isBackgroundPixel(r, g, b, bg, threshold)) return true;
  return isCardDecorationOnly(r, g, b);
}

function isCardDecorationOnly(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (r > 150 && g > 110 && b < 95 && lum > 130 && r - g < 60) return true;
  if (r > 155 && g < 120 && b > 90 && b < 200 && lum > 120) return true;
  if (b > 165 && r > 100 && g < 115 && b > r + 25 && lum > 125) return true;
  if (b > 145 && g > 125 && r < 150 && lum > 135) return true;
  return false;
}

function isRemovableCardPixel(r, g, b, bg, threshold) {
  return isCardDecorationOnly(r, g, b);
}

function isStickerRemovablePixel(r, g, b, bg, threshold) {
  return (
    isBackgroundPixel(r, g, b, bg, threshold) || isCardDecorationOnly(r, g, b)
  );
}

function floodStickerRemovable(
  data,
  width,
  height,
  channels,
  bg,
  threshold,
  barrier,
  stickerInterior,
) {
  const flooded = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (!stickerInterior[idx] || flooded[idx] || barrier[idx]) return;
    const ci = idx * channels;
    if (
      !isStickerRemovablePixel(
        data[ci],
        data[ci + 1],
        data[ci + 2],
        bg,
        threshold,
      )
    ) {
      return;
    }
    flooded[idx] = 1;
    queue.push([x, y]);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!stickerInterior[idx]) continue;
      let onBoundary = false;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          onBoundary = true;
          break;
        }
        if (!stickerInterior[ny * width + nx]) {
          onBoundary = true;
          break;
        }
      }
      if (onBoundary) tryPush(x, y);
    }
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      tryPush(nx, ny);
    }
  }

  return flooded;
}

function fillInteriorWithinSticker(cluster, stickerInterior, width, height) {
  const exterior = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (exterior[idx] || cluster[idx] || !stickerInterior[idx]) return;
    exterior[idx] = 1;
    queue.push([x, y]);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!stickerInterior[idx]) continue;
      let onBoundary = false;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          onBoundary = true;
          break;
        }
        if (!stickerInterior[ny * width + nx]) {
          onBoundary = true;
          break;
        }
      }
      if (onBoundary) tryPush(x, y);
    }
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      tryPush(nx, ny);
    }
  }

  const filled = new Uint8Array(width * height);
  for (let i = 0; i < filled.length; i++) {
    filled[i] = stickerInterior[i] && (cluster[i] || !exterior[i]) ? 1 : 0;
  }
  return filled;
}

function findCreatureSeed(
  data,
  roughForeground,
  stickerInterior,
  width,
  height,
  channels,
  bg,
  threshold,
) {
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  for (let radius = 0; radius < Math.max(width, height); radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const idx = y * width + x;
        if (!roughForeground[idx] || !stickerInterior[idx]) continue;
        const ci = idx * channels;
        const r = data[ci];
        const g = data[ci + 1];
        const b = data[ci + 2];
        if (isBackgroundPixel(r, g, b, bg, threshold)) continue;
        if (isCardDecorationOnly(r, g, b)) continue;
        return [x, y];
      }
    }
  }

  return findSeedNearCenter(roughForeground, width, height);
}

function buildRevolutionAlphaMask(data, width, height, channels, bg, _edgeSamples, threshold) {
  const stickerInterior = maskInsideWhiteSticker(data, width, height, channels);

  const initialExterior = floodExteriorBackground(
    data,
    width,
    height,
    channels,
    bg,
    threshold,
    new Uint8Array(width * height),
  );

  const roughForeground = new Uint8Array(width * height);
  for (let i = 0; i < roughForeground.length; i++) {
    roughForeground[i] = initialExterior[i] ? 0 : 1;
  }

  const [seedX, seedY] = findCreatureSeed(
    data,
    roughForeground,
    stickerInterior,
    width,
    height,
    channels,
    bg,
    threshold,
  );
  const mainCluster = keepForegroundComponentAt(
    roughForeground,
    width,
    height,
    seedX,
    seedY,
  );
  const cluster = keepRevolutionCluster(mainCluster, width, height);
  const barrier = dilateMask(cluster, width, height, 8);
  const exterior = floodExteriorBackground(
    data,
    width,
    height,
    channels,
    bg,
    threshold,
    barrier,
  );
  const core = dilateMask(mainCluster, width, height, 5);

  const stickerFlooded = floodStickerRemovable(
    data,
    width,
    height,
    channels,
    bg,
    threshold,
    barrier,
    stickerInterior,
  );

  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < alpha.length; i++) {
    if (!stickerInterior[i] || exterior[i] || stickerFlooded[i]) {
      alpha[i] = 0;
      continue;
    }

    if (
      !core[i] &&
      (isCardDecorationOnly(
        data[i * channels],
        data[i * channels + 1],
        data[i * channels + 2],
      ) ||
        isWhitePixel(
          data[i * channels],
          data[i * channels + 1],
          data[i * channels + 2],
        ))
    ) {
      alpha[i] = 0;
      continue;
    }

    alpha[i] = 1;
  }
  return alpha;
}

function findContentBounds(foreground, width, height) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (foreground[y * width + x]) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { minX, minY, maxX, maxY };
}

function isRevolutionOutput(out) {
  return out.includes('_rev') || out.includes('_20') || out.includes('_n7');
}

async function extractPelusa({ src, out }) {
  const meta = await sharp(src).metadata();
  const splitY = Math.floor(meta.height * 0.48);

  const fullRaw = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bgStripHeight = Math.floor(meta.height * 0.35);

  const { data, info } = await sharp(src)
    .extract({
      left: 0,
      top: splitY,
      width: meta.width,
      height: meta.height - splitY,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const revolution = isRevolutionOutput(out);
  const edgeSamples = revolution
    ? sampleEdgeColors(data, width, height, channels)
    : [];
  const bg = revolution
    ? sampleBackgroundFromEdges(data, width, height, channels)
    : sampleBackgroundFromStrip(
        fullRaw.data,
        meta.width,
        bgStripHeight,
        fullRaw.info.channels,
      );
  const threshold = revolution ? 42 : 55;
  const alpha = revolution
    ? buildRevolutionAlphaMask(data, width, height, channels, bg, edgeSamples, threshold)
    : buildStandardAlphaMask(data, width, height, channels, bg, threshold);
  const bounds = findContentBounds(alpha, width, height);
  if (bounds.minX > bounds.maxX) {
    throw new Error(`No opaque pixels produced for ${out}`);
  }

  const pad = revolution ? 6 : 2;
  const left = Math.max(0, bounds.minX - pad);
  const top = Math.max(0, bounds.minY - pad);
  const right = Math.min(width - 1, bounds.maxX + pad);
  const bottom = Math.min(height - 1, bounds.maxY + pad);
  const cropW = right - left + 1;
  const cropH = bottom - top + 1;

  const rgba = Buffer.alloc(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcX = left + x;
      const srcY = top + y;
      const srcI = (srcY * width + srcX) * channels;
      const srcIdx = srcY * width + srcX;
      const dstI = (y * cropW + x) * 4;

      rgba[dstI] = data[srcI];
      rgba[dstI + 1] = data[srcI + 1];
      rgba[dstI + 2] = data[srcI + 2];
      rgba[dstI + 3] = alpha[srcIdx] ? 255 : 0;
    }
  }

  const outPath = path.join(OUT_DIR, out);
  await sharp(rgba, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png()
    .toFile(outPath);

  console.log(`Saved ${outPath} (${cropW}x${cropH}), bg=[${bg.map(Math.round).join(',')}]`);
}

await mkdir(OUT_DIR, { recursive: true });
for (const input of INPUTS) {
  await extractPelusa(input);
}
