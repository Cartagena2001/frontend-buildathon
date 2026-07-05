import {
  AVATAR_MAX_DATA_URL_LENGTH,
} from "./avatar.constants";

const DATA_URL_RE =
  /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i;

export function validateAvatarDataUrl(
  value: string | null | undefined,
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }

  if (value.length > AVATAR_MAX_DATA_URL_LENGTH) {
    return { ok: false, error: "Image is too large." };
  }

  if (!DATA_URL_RE.test(value)) {
    return { ok: false, error: "Invalid image format." };
  }

  return { ok: true, value };
}
