import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import toIco from "to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SOURCE = join(
  root,
  "referencias",
  "ElevenLabs_image_gpt-image-2_RECREALO PERO C_2026-07-04T19_53_12.png"
);

// Square crop around the cat logo (source is 1280×720 with padding below)
const CROP = { left: 340, top: 60, width: 600, height: 600 };

const CREAM = { r: 255, g: 246, b: 238, alpha: 1 };

const SIZES = [
  { out: join(root, "app", "icon.png"), size: 512 },
  { out: join(root, "app", "apple-icon.png"), size: 180 },
  { out: join(root, "public", "icon.png"), size: 32 },
  { out: join(root, "public", "apple-icon.png"), size: 180 },
];

/** Cropped square logo buffer, reused for every output size. */
async function getLogoSource() {
  return sharp(SOURCE).extract(CROP).png().toBuffer();
}

/**
 * Resize the logo to fill a square canvas.
 * Small sizes get a cream background so the cat stays readable on dark tabs.
 */
async function buildIcon(logoSource, size, outputPath) {
  const useCreamBg = size <= 48;

  let pipeline = sharp(logoSource).resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (size <= 48) {
    pipeline = pipeline.sharpen({ sigma: 0.6 });
  }

  const logo = await pipeline.png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: useCreamBg ? CREAM : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, top: 0, left: 0 }])
    .png()
    .toFile(outputPath);

  console.log(`Wrote ${outputPath} (${size}x${size})`);
}

async function buildFavicon(logoSource) {
  const icoSizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    icoSizes.map(async (size) => {
      let pipeline = sharp(logoSource).resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });

      if (size <= 32) {
        pipeline = pipeline.sharpen({ sigma: 0.6 });
      }

      const logo = await pipeline.png().toBuffer();

      return sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: CREAM,
        },
      })
        .composite([{ input: logo, top: 0, left: 0 }])
        .png()
        .toBuffer();
    })
  );

  const ico = await toIco(pngBuffers);
  for (const out of [
    join(root, "app", "favicon.ico"),
    join(root, "public", "favicon.ico"),
  ]) {
    writeFileSync(out, ico);
    console.log(`Wrote ${out}`);
  }
}

const logoSource = await getLogoSource();

for (const { out, size } of SIZES) {
  await buildIcon(logoSource, size, out);
}

await buildFavicon(logoSource);
