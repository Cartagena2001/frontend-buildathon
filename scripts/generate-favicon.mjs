import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SOURCE = join(
  root,
  "referencias",
  "ElevenLabs_image_gpt-image-2_RECREALO PERO C_2026-07-04T19_53_12.png"
);

const CREAM = "#FFF6EE";
const SIZES = [
  { out: join(root, "app", "icon.png"), size: 512 },
  { out: join(root, "app", "apple-icon.png"), size: 180 },
];

async function buildIcon(size, outputPath) {
  const catSize = Math.round(size * 0.72);
  const circleRadius = Math.round(size * 0.42);

  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${circleRadius}" fill="${CREAM}"/>
    </svg>`
  );

  const cat = await sharp(SOURCE)
    .resize(catSize, catSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const catMeta = await sharp(cat).metadata();
  const left = Math.round((size - catMeta.width) / 2);
  const top = Math.round((size - catMeta.height) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: circleSvg, top: 0, left: 0 },
      { input: cat, top, left },
    ])
    .png()
    .toFile(outputPath);

  console.log(`Wrote ${outputPath} (${size}x${size})`);
}

for (const { out, size } of SIZES) {
  await buildIcon(size, out);
}
