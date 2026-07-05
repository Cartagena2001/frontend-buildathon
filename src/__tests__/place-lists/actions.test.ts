/**
 * Unit tests for place-lists server actions.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.hoisted(() => vi.fn());
const mockFindyFetch = vi.hoisted(() => vi.fn());
const mockFindyFetchPublic = vi.hoisted(() => vi.fn());
const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/findy-core/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/findy-core/client")>();
  return {
    ...actual,
    findyFetch: mockFindyFetch,
    findyFetchPublic: mockFindyFetchPublic,
  };
});
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));

const { FindyApiError } = await import("@/lib/findy-core/client");
const {
  createPlaceList,
  getMyPlaceLists,
  addPlaceToList,
  removePlaceFromList,
  sharePlaceList,
  unsharePlaceList,
  getSharedPlaceList,
  deletePlaceList,
  getSavedPlaceIds,
} = await import("@/features/place-lists/actions");

const LIST_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
const PLACE_ID = "b2c3d4e5-f6a7-4890-b123-456789abcdef";
const SHARE_TOKEN = "c3d4e5f6-a7b8-4901-a234-56789abcdef0";

const session = {
  user: { id: "d4e5f6a7-b8c9-4012-d345-6789abcdef01", email: "user@test.com", name: "Test User" },
};

const listDetail = {
  id: LIST_ID,
  name: "Playas",
  description: null,
  placeCount: 0,
  isShared: false,
  shareToken: null,
  createdAt: "2026-07-04T18:00:00.000Z",
  updatedAt: "2026-07-04T18:00:00.000Z",
  places: [],
};

describe("place-lists actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(session);
  });

  describe("createPlaceList", () => {
    it("returns auth error when not logged in", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const result = await createPlaceList({ name: "Test" });
      expect(result).toEqual({ ok: false, error: "Not authenticated" });
    });

    it("creates a list via findy-core", async () => {
      mockFindyFetch.mockResolvedValueOnce({ list: listDetail });

      const result = await createPlaceList({ name: "Playas" });

      expect(result.ok).toBe(true);
      expect(mockFindyFetch).toHaveBeenCalledWith("/place-lists", {
        method: "POST",
        body: { name: "Playas" },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/lists");
    });

    it("maps API errors to action errors", async () => {
      mockFindyFetch.mockRejectedValueOnce(
        new FindyApiError("findy-core route not found", 404, "http://x/place-lists"),
      );

      const result = await createPlaceList({ name: "Playas" });
      expect(result).toEqual({
        ok: false,
        error: "findy-core route not found",
      });
    });
  });

  describe("addPlaceToList", () => {
    it("rejects non-UUID place ids (mock data)", async () => {
      const result = await addPlaceToList(LIST_ID, "el-tunco");
      expect(result).toEqual({
        ok: false,
        error: "Place not available in catalog yet",
      });
      expect(mockFindyFetch).not.toHaveBeenCalled();
    });

    it("adds a place to a list", async () => {
      const place = {
        id: PLACE_ID,
        canonicalName: "Playa El Tunco",
        category: "beach",
        location: { text: "El Tunco", lat: 13.49, lng: -89.38 },
        addedAt: "2026-07-04T18:05:00.000Z",
      };
      mockFindyFetch.mockResolvedValueOnce({ place });

      const result = await addPlaceToList(LIST_ID, PLACE_ID);

      expect(result.ok).toBe(true);
      expect(mockFindyFetch).toHaveBeenCalledWith(
        `/place-lists/${LIST_ID}/places`,
        { method: "POST", body: { placeId: PLACE_ID } },
      );
    });
  });

  describe("sharePlaceList", () => {
    it("returns share token", async () => {
      mockFindyFetch.mockResolvedValueOnce({ shareToken: SHARE_TOKEN });

      const result = await sharePlaceList(LIST_ID);

      expect(result).toEqual({ ok: true, data: { shareToken: SHARE_TOKEN } });
    });
  });

  describe("getSharedPlaceList", () => {
    it("fetches public shared list without auth", async () => {
      const shared = {
        name: "Playas",
        description: null,
        owner: { firstName: "Josue" },
        places: [],
      };
      mockFindyFetchPublic.mockResolvedValueOnce({ list: shared });

      const result = await getSharedPlaceList(SHARE_TOKEN);

      expect(result).toEqual(shared);
      expect(mockFindyFetchPublic).toHaveBeenCalledWith(`/shared/${SHARE_TOKEN}`);
    });

    it("returns null for invalid token format", async () => {
      const result = await getSharedPlaceList("not-a-uuid");
      expect(result).toBeNull();
      expect(mockFindyFetchPublic).not.toHaveBeenCalled();
    });
  });

  describe("getSavedPlaceIds", () => {
    it("aggregates place ids from all lists", async () => {
      mockFindyFetch
        .mockResolvedValueOnce({
          lists: [
            { ...listDetail, placeCount: 1 },
            { ...listDetail, id: "e5f6a7b8-c9d0-4123-a456-789abcdef012", placeCount: 1 },
          ],
        })
        .mockResolvedValueOnce({
          list: {
            ...listDetail,
            places: [{ id: PLACE_ID, canonicalName: "A", category: null, location: { text: null, lat: null, lng: null }, addedAt: "" }],
          },
        })
        .mockResolvedValueOnce({
          list: {
            ...listDetail,
            id: "e5f6a7b8-c9d0-4123-a456-789abcdef012",
            places: [{ id: "f6a7b8c9-d0e1-4234-a567-89abcdef012", canonicalName: "B", category: null, location: { text: null, lat: null, lng: null }, addedAt: "" }],
          },
        });

      const ids = await getSavedPlaceIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain(PLACE_ID);
    });

    it("returns empty array when not authenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const ids = await getSavedPlaceIds();
      expect(ids).toEqual([]);
    });
  });

  describe("deletePlaceList", () => {
    it("deletes and revalidates", async () => {
      mockFindyFetch.mockResolvedValueOnce(undefined);

      const result = await deletePlaceList(LIST_ID);
      expect(result.ok).toBe(true);
      expect(mockFindyFetch).toHaveBeenCalledWith(
        `/place-lists/${LIST_ID}`,
        { method: "DELETE" },
      );
    });
  });

  describe("removePlaceFromList", () => {
    it("removes place from list", async () => {
      mockFindyFetch.mockResolvedValueOnce(undefined);

      const result = await removePlaceFromList(LIST_ID, PLACE_ID);
      expect(result.ok).toBe(true);
    });
  });

  describe("unsharePlaceList", () => {
    it("disables sharing", async () => {
      mockFindyFetch.mockResolvedValueOnce(undefined);

      const result = await unsharePlaceList(LIST_ID);
      expect(result.ok).toBe(true);
      expect(mockFindyFetch).toHaveBeenCalledWith(
        `/place-lists/${LIST_ID}/share`,
        { method: "DELETE" },
      );
    });
  });

  describe("getMyPlaceLists", () => {
    it("returns empty when API fails", async () => {
      mockFindyFetch.mockRejectedValueOnce(new Error("down"));
      const lists = await getMyPlaceLists();
      expect(lists).toEqual([]);
    });
  });
});
