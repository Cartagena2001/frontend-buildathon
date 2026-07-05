import {
  AVATAR_MAX_DATA_URL_LENGTH,
  AVATAR_MAX_INPUT_BYTES,
  AVATAR_SIZE,
} from "./avatar.constants";

function cropToSquareDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
  quality: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");

  const side = Math.min(width, height);
  const sx = (width - side) / 2;
  const sy = (height - side) / 2;

  ctx.drawImage(source, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Resize and crop an image file to a small square JPEG data URL. */
export async function processAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type.");
  }
  if (file.size > AVATAR_MAX_INPUT_BYTES) {
    throw new Error("File is too large.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image."));
      el.src = objectUrl;
    });

    for (const quality of [0.82, 0.7, 0.55]) {
      const dataUrl = cropToSquareDataUrl(img, img.width, img.height, quality);
      if (dataUrl.length <= AVATAR_MAX_DATA_URL_LENGTH) {
        return dataUrl;
      }
    }

    throw new Error("Image is too large after resize.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
