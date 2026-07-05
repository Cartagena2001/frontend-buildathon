import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SOURCE = join(root, "referencias", "hero-cat-source.png");
const OUT = join(root, "public", "mascot", "hero-cat.png");

function pixel(data, width, channels, x, y) {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

function colorDistance(a, b) {
  return (
    Math.abs(a[0] - b[0]) +
    Math.abs(a[1] - b[1]) +
    Math.abs(a[2] - b[2])
  );
}

function isLight(r, g, b) {
  return r > 190 && g > 190 && b > 190;
}

function isCheckerboardPixel(data, width, height, channels, x, y) {
  if (x <= 0 || y <= 0 || x >= width - 1 || y >= height - 1) return false;

  const p00 = pixel(data, width, channels, x, y);
  const p10 = pixel(data, width, channels, x + 1, y);
  const p01 = pixel(data, width, channels, x, y + 1);
  const p11 = pixel(data, width, channels, x + 1, y + 1);

  if (![p00, p10, p01, p11].every(([r, g, b]) => isLight(r, g, b))) {
    return false;
  }

  const sameDiag =
    colorDistance(p00, p11) < 30 && colorDistance(p01, p10) < 30;
  const diffAdj = colorDistance(p00, p01) > 6;

  return sameDiag && diffAdj;
}

function floodEdgeBackground(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const trySeed = (x, y) => {
    const idx = y * width + x;
    const [r, g, b, a] = pixel(data, width, channels, x, y);
    if (a === 0) return;
    if (!(r > 248 && g > 246 && b > 244)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const i = idx * channels;
    data[i + 3] = 0;

    const x = idx % width;
    const y = (idx - x) / width;
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const [r, g, b] = pixel(data, width, channels, nx, ny);
      if (!(r > 248 && g > 246 && b > 244)) continue;
      visited[nIdx] = 1;
      queue.push(nIdx);
    }
  }
}

function removeSpeckle(data, width, height, channels) {
  const alpha = new Uint8Array(width * height);
  for (let idx = 0; idx < width * height; idx += 1) {
    alpha[idx] = data[idx * channels + 3];
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      const i = idx * channels;
      if (alpha[idx] === 0) continue;

      const [r, g, b] = pixel(data, width, channels, x, y);
      if (!(r > 235 && g > 230 && b > 225)) continue;

      let transparentNeighbors = 0;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (alpha[ny * width + nx] === 0) transparentNeighbors += 1;
      }

      if (transparentNeighbors >= 3) {
        data[i + 3] = 0;
      }
    }
  }
}

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let y = 0; y < info.height - 1; y += 1) {
  for (let x = 0; x < info.width - 1; x += 1) {
    if (!isCheckerboardPixel(data, info.width, info.height, info.channels, x, y)) {
      continue;
    }
    for (const [px, py] of [
      [x, y],
      [x + 1, y],
      [x, y + 1],
      [x + 1, y + 1],
    ]) {
      const i = (py * info.width + px) * info.channels;
      data[i + 3] = 0;
    }
  }
}

floodEdgeBackground(data, info.width, info.height, info.channels);
for (let pass = 0; pass < 3; pass += 1) {
  removeSpeckle(data, info.width, info.height, info.channels);
}

await sharp(data, {
  raw: {
    width: info.width,
    height: info.height,
    channels: info.channels,
  },
})
  .trim({ threshold: 12 })
  .png()
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT} (${meta.width}x${meta.height}, alpha=${meta.hasAlpha})`);
