/**
 * End-to-end flow test for place lists — simulates findy-core API responses.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const LIST_ID = "a1b2c3d4-e5f6-4789-a012-3456789abcde";
const PLACE_ID = "b2c3d4e5-f6a7-4890-b123-456789abcdef";
const SHARE_TOKEN = "c3d4e5f6-a7b8-4901-c234-56789abcdef01";
const USER_ID = "d4e5f6a7-b8c9-4012-d345-6789abcdef012";

const mockAuth = vi.hoisted(() => vi.fn());
const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));

/** In-memory findy-core simulator */
function createFindyCoreSimulator() {
  const lists = new Map<string, {
    id: string;
    name: string;
    description: string | null;
    shareToken: string | null;
    createdAt: string;
    updatedAt: string;
    places: Map<string, { id: string; canonicalName: string; category: string; location: { text: string; lat: number; lng: number }; addedAt: string }>;
  }>();

  const placesCatalog = new Map([
    [PLACE_ID, {
      id: PLACE_ID,
      canonicalName: "Playa El Tunco",
      category: "beach",
      locationText: "El Tunco, La Libertad",
      lat: 13.4927,
      lng: -89.3823,
    }],
  ]);

  return async (url: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? "GET";
    const path = url.replace("http://findy.test", "");
    const auth = (init?.headers as Record<string, string>)?.Authorization;

    if (path.startsWith("/place-lists") && method !== "GET" && !auth) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (path === "/place-lists" && method === "POST") {
      const body = JSON.parse(String(init?.body));
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const list = {
        id,
        name: body.name,
        description: body.description ?? null,
        shareToken: null,
        createdAt: now,
        updatedAt: now,
        places: new Map(),
      };
      lists.set(id, list);
      return json({
        list: {
          id,
          name: list.name,
          description: list.description,
          placeCount: 0,
          isShared: false,
          shareToken: null,
          createdAt: now,
          updatedAt: now,
          places: [],
        },
      }, 201);
    }

    if (path === "/place-lists" && method === "GET") {
      const rows = [...lists.values()].map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        placeCount: l.places.size,
        isShared: l.shareToken !== null,
        shareToken: l.shareToken,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));
      return json({ lists: rows });
    }

    const listMatch = path.match(/^\/place-lists\/([^/]+)$/);
    if (listMatch && method === "GET") {
      const list = lists.get(listMatch[1]);
      if (!list) return json({ error: "List not found" }, 404);
      return json({
        list: {
          id: list.id,
          name: list.name,
          description: list.description,
          placeCount: list.places.size,
          isShared: list.shareToken !== null,
          shareToken: list.shareToken,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt,
          places: [...list.places.values()],
        },
      });
    }

    const addPlaceMatch = path.match(/^\/place-lists\/([^/]+)\/places$/);
    if (addPlaceMatch && method === "POST") {
      const list = lists.get(addPlaceMatch[1]);
      if (!list) return json({ error: "List not found" }, 404);
      const { placeId } = JSON.parse(String(init?.body));
      const place = placesCatalog.get(placeId);
      if (!place) return json({ error: "Place not found" }, 404);
      if (list.places.has(placeId)) return json({ error: "Place already in list" }, 409);
      const item = {
        id: place.id,
        canonicalName: place.canonicalName,
        category: place.category,
        location: { text: place.locationText, lat: place.lat, lng: place.lng },
        addedAt: new Date().toISOString(),
      };
      list.places.set(placeId, item);
      list.updatedAt = new Date().toISOString();
      return json({ place: item }, 201);
    }

    const removePlaceMatch = path.match(/^\/place-lists\/([^/]+)\/places\/([^/]+)$/);
    if (removePlaceMatch && method === "DELETE") {
      const list = lists.get(removePlaceMatch[1]);
      if (!list || !list.places.has(removePlaceMatch[2])) {
        return json({ error: "Place not in list" }, 404);
      }
      list.places.delete(removePlaceMatch[2]);
      return new Response(null, { status: 204 });
    }

    const shareMatch = path.match(/^\/place-lists\/([^/]+)\/share$/);
    if (shareMatch && method === "POST") {
      const list = lists.get(shareMatch[1]);
      if (!list) return json({ error: "List not found" }, 404);
      if (!list.shareToken) list.shareToken = crypto.randomUUID();
      return json({ shareToken: list.shareToken });
    }

    if (shareMatch && method === "DELETE") {
      const list = lists.get(shareMatch[1]);
      if (!list) return json({ error: "List not found" }, 404);
      list.shareToken = null;
      return new Response(null, { status: 204 });
    }

    const sharedMatch = path.match(/^\/shared\/([^/]+)$/);
    if (sharedMatch && method === "GET") {
      const token = sharedMatch[1];
      const list = [...lists.values()].find((l) => l.shareToken === token);
      if (!list) return json({ error: "Shared list not found" }, 404);
      return json({
        list: {
          name: list.name,
          description: list.description,
          owner: { firstName: "Test" },
          places: [...list.places.values()],
        },
      });
    }

    const deleteMatch = path.match(/^\/place-lists\/([^/]+)$/);
    if (deleteMatch && method === "DELETE") {
      lists.delete(deleteMatch[1]);
      return new Response(null, { status: 204 });
    }

    return json({ error: "Not found" }, 404);
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("place lists full flow (simulated API)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.FINDY_CORE_API_URL = "http://findy.test";
    process.env.JWT_SECRET = "test-secret";
    mockAuth.mockResolvedValue({
      user: { id: USER_ID, email: "flow@test.com", name: "Flow User" },
      findyCoreToken: "test-session-token",
    });
    vi.stubGlobal("fetch", vi.fn(createFindyCoreSimulator()));
  });

  it("create → add place → share → view public → remove → unshare → delete", async () => {
    const actions = await import("@/features/place-lists/actions");

    // 1. Create list
    const created = await actions.createPlaceList({
      name: "Playas favoritas",
      description: "Para el verano",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) throw new Error("create failed");
    const listId = created.data.list.id;

    // 2. List my lists
    const lists = await actions.getMyPlaceLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe("Playas favoritas");

    // 3. Add place
    const added = await actions.addPlaceToList(listId, PLACE_ID);
    expect(added.ok).toBe(true);

    // 4. Detail shows place
    const detail = await actions.getPlaceListDetail(listId);
    expect(detail?.places).toHaveLength(1);
    expect(detail?.places[0].canonicalName).toBe("Playa El Tunco");

    // 5. Saved ids include place
    const savedIds = await actions.getSavedPlaceIds();
    expect(savedIds).toContain(PLACE_ID);

    // 6. Share list
    const shared = await actions.sharePlaceList(listId);
    expect(shared.ok).toBe(true);
    if (!shared.ok) throw new Error("share failed");
    const token = shared.data.shareToken;

    // 7. Public view
    const publicList = await actions.getSharedPlaceList(token);
    expect(publicList?.name).toBe("Playas favoritas");
    expect(publicList?.places).toHaveLength(1);

    // 8. Remove place
    const removed = await actions.removePlaceFromList(listId, PLACE_ID);
    expect(removed.ok).toBe(true);

    const afterRemove = await actions.getPlaceListDetail(listId);
    expect(afterRemove?.places).toHaveLength(0);

    // 9. Unshare
    const unshared = await actions.unsharePlaceList(listId);
    expect(unshared.ok).toBe(true);

    // 10. Delete list
    const deleted = await actions.deletePlaceList(listId);
    expect(deleted.ok).toBe(true);

    const afterDelete = await actions.getMyPlaceLists();
    expect(afterDelete).toHaveLength(0);
  });

  it("rejects duplicate place in same list", async () => {
    const actions = await import("@/features/place-lists/actions");

    const created = await actions.createPlaceList({ name: "Dup test" });
    if (!created.ok) throw new Error("create failed");
    const listId = created.data.list.id;

    const first = await actions.addPlaceToList(listId, PLACE_ID);
    expect(first.ok).toBe(true);

    const second = await actions.addPlaceToList(listId, PLACE_ID);
    expect(second.ok).toBe(false);
    if (second.ok) throw new Error("expected failure");
    expect(second.error).toContain("already");
  });
});
