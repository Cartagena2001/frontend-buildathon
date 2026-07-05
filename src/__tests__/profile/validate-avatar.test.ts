import { describe, it, expect } from "vitest";
import { validateAvatarDataUrl } from "@/lib/profile/validate-avatar";
import { AVATAR_MAX_DATA_URL_LENGTH } from "@/lib/profile/avatar.constants";

describe("validateAvatarDataUrl", () => {
  it("accepts null and empty as remove", () => {
    expect(validateAvatarDataUrl(null)).toEqual({ ok: true, value: null });
    expect(validateAvatarDataUrl("")).toEqual({ ok: true, value: null });
  });

  it("accepts a small JPEG data URL", () => {
    const value = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
    expect(validateAvatarDataUrl(value)).toEqual({ ok: true, value });
  });

  it("rejects invalid format", () => {
    const result = validateAvatarDataUrl("https://example.com/photo.jpg");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Invalid image format.");
  });

  it("rejects oversized data URLs", () => {
    const huge = `data:image/jpeg;base64,${"A".repeat(AVATAR_MAX_DATA_URL_LENGTH)}`;
    const result = validateAvatarDataUrl(huge);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Image is too large.");
  });
});
