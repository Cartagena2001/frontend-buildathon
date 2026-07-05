import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetGooglePlacePhotos = vi.fn();

vi.mock("@/lib/google-places/place-photo", () => ({
  getGooglePlacePhotos: (...args: unknown[]) => mockGetGooglePlacePhotos(...args),
}));

const PLACE = {
  id: "a1b2c3d4-e5f6-4789-a012-3456789abcde",
  canonicalName: "Playa Las Hojas, La Paz",
  category: "Beach",
  location: { text: "La Paz", lat: 13.5, lng: -89.2 },
  addedAt: "2026-07-05T00:00:00.000Z",
};

describe("enrichPlaceListPlace", () => {
  beforeEach(() => {
    mockGetGooglePlacePhotos.mockReset();
  });

  it("uses Google photo when available", async () => {
    mockGetGooglePlacePhotos.mockResolvedValue({
      photos: ["https://lh3.googleusercontent.com/photo1"],
    });

    const { enrichPlaceListPlace } = await import("@/features/place-lists/enrich-place-images");
    const result = await enrichPlaceListPlace(PLACE);

    expect(result.coverImage).toBe("https://lh3.googleusercontent.com/photo1");
    expect(mockGetGooglePlacePhotos).toHaveBeenCalledWith({
      name: PLACE.canonicalName,
      location: "La Paz",
    });
  });

  it("falls back to category image when Google returns nothing", async () => {
    mockGetGooglePlacePhotos.mockResolvedValue({ photos: [] });

    const { enrichPlaceListPlace } = await import("@/features/place-lists/enrich-place-images");
    const result = await enrichPlaceListPlace(PLACE);

    expect(result.coverImage).toContain("unsplash.com");
  });
});

describe("fallbackCoverImage", () => {
  it("uses the same category map as Explore search", async () => {
    const { fallbackCoverImage } = await import("@/features/place-lists/enrich-place-images");
    const { imagesForCategory } = await import("@/features/search/map-search-result");

    expect(fallbackCoverImage("beach")).toBe(imagesForCategory("beach").cover);
  });
});
