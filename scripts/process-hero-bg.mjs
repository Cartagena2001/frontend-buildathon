/**
 * Compress hero background video for web — loop-friendly H.264 + poster frame.
 *
 * Source: referencias/hero-bg-source.mp4 (drop your ElevenLabs export here)
 * Output: public/hero/hero-bg.mp4, public/hero/hero-bg-poster.webp
 *
 * Usage: npm run process:hero-bg
 */
import { execSync } from "child_process";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SOURCE = join(root, "referencias", "hero-bg-source.mp4");
const OUT_DIR = join(root, "public", "hero");
const MP4 = join(OUT_DIR, "hero-bg.mp4");
const POSTER = join(OUT_DIR, "hero-bg-poster.webp");

/** Max width — 1280 keeps hero loops under ~2 MB with CRF 28 */
const MAX_WIDTH = 1280;
const CRF = 28;

function run(cmd) {
  console.log(`\n→ ${cmd}\n`);
  execSync(cmd, { stdio: "inherit" });
}

async function main() {
  try {
    execSync("ffmpeg -version", { stdio: "pipe" });
  } catch {
    console.error("ffmpeg not found. Install with: brew install ffmpeg");
    process.exit(1);
  }

  if (!existsSync(SOURCE)) {
    console.error(
      "Source not found. Copy your hero MP4 to referencias/hero-bg-source.mp4",
    );
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  run(
    [
      `ffmpeg -y -i "${SOURCE}"`,
      "-an",
      `-vf "scale='min(${MAX_WIDTH},iw)':-2:flags=lanczos"`,
      "-c:v libx264",
      "-preset slow",
      `-crf ${CRF}`,
      "-movflags +faststart",
      "-pix_fmt yuv420p",
      "-tag:v avc1",
      `"${MP4}"`,
    ].join(" "),
  );

  const posterPng = join(OUT_DIR, ".hero-bg-poster-tmp.png");
  run(`ffmpeg -y -i "${MP4}" -frames:v 1 -update 1 "${posterPng}"`);
  await sharp(posterPng).webp({ quality: 82 }).toFile(POSTER);
  unlinkSync(posterPng);

  const size = execSync(`ls -lh "${MP4}"`, { encoding: "utf8" }).trim().split(/\s+/)[4];
  console.log(`\n✓ Hero video → ${MP4}`);
  console.log(`✓ Poster → ${POSTER}`);
  console.log(`\nDone. Compressed hero background (~${size}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
