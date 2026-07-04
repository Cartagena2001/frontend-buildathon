/**
 * Install mascot search video — stream-optimized copy (faststart) + poster frame.
 * No re-encoding; moves moov atom to the front for faster playback start.
 *
 * Usage: npm run process:mascot-search
 */
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SOURCE = join(root, "referencias", "loading-search-source.mp4");
const SOURCE_FALLBACK = join(root, "public", "mascot", "loading-search-source.mp4");
const OUT_DIR = join(root, "public", "mascot");
const MP4 = join(OUT_DIR, "loading-search.mp4");
const POSTER = join(OUT_DIR, "loading-search-poster.png");

function run(cmd) {
  console.log(`\n→ ${cmd}\n`);
  execSync(cmd, { stdio: "inherit" });
}

function resolveSource() {
  if (existsSync(SOURCE)) return SOURCE;
  if (existsSync(SOURCE_FALLBACK)) return SOURCE_FALLBACK;
  console.error("Source not found. Copy the ElevenLabs MP4 to referencias/loading-search-source.mp4");
  process.exit(1);
}

function main() {
  try {
    execSync("ffmpeg -version", { stdio: "pipe" });
  } catch {
    console.error("ffmpeg not found. Install with: brew install ffmpeg");
    process.exit(1);
  }

  const source = resolveSource();
  mkdirSync(OUT_DIR, { recursive: true });

  run(
    `ffmpeg -y -i "${source}" -c copy -movflags +faststart "${MP4}"`,
  );
  console.log(`✓ Stream-optimized copy → ${MP4} (moov at front, no re-encode)`);

  run(
    `ffmpeg -y -i "${MP4}" -frames:v 1 -update 1 "${POSTER}"`,
  );

  console.log(`✓ Poster → ${POSTER}`);
  console.log("\nDone. Video is faststart-optimized for web playback.");
}

main();
