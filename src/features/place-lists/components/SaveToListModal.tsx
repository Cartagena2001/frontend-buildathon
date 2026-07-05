"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  addPlaceToList,
  createPlaceList,
  getListsContainingPlace,
  getMyPlaceLists,
  removePlaceFromList,
} from "@/features/place-lists/actions";
import type { PlaceList } from "@/features/place-lists/types";
import { isUuid } from "@/features/place-lists/types";

interface Props {
  placeId: string;
  placeName: string;
  isSaved?: boolean;
  className?: string;
  onSavedChange?: (saved: boolean) => void;
}

export default function SaveToListModal({
  placeId,
  placeName,
  isSaved: initialSaved = false,
  className = "",
  onSavedChange,
}: Props) {
  const t = useTranslations("lists");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [prevInitialSaved, setPrevInitialSaved] = useState(initialSaved);
  const [lists, setLists] = useState<PlaceList[]>([]);
  const [inLists, setInLists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();
  const modalRef = useRef<HTMLDivElement>(null);

  if (initialSaved !== prevInitialSaved) {
    setPrevInitialSaved(initialSaved);
    setSaved(initialSaved);
  }

  async function loadLists() {
    setLoading(true);
    setError(null);

    try {
      const [allLists, containing] = await Promise.all([
        getMyPlaceLists(),
        getListsContainingPlace(placeId),
      ]);
      setLists(allLists);
      setInLists(new Set(containing));
      setSaved(containing.length > 0);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const redirectToLogin = () => {
    const params = new URLSearchParams({ callbackUrl: window.location.pathname });
    router.push(`/login?${params.toString()}`);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    void loadLists();
  };

  const toggleList = (listId: string) => {
    startTransition(async () => {
      setError(null);
      const isIn = inLists.has(listId);

      const result = isIn
        ? await removePlaceFromList(listId, placeId)
        : await addPlaceToList(listId, placeId);

      if (!result.ok) {
        if (result.error === "Not authenticated") {
          setOpen(false);
          redirectToLogin();
          return;
        }
        setError(result.error);
        return;
      }

      const next = new Set(inLists);
      if (isIn) next.delete(listId);
      else next.add(listId);
      setInLists(next);
      setLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                placeCount: Math.max(
                  0,
                  list.placeCount + (isIn ? -1 : 1),
                ),
              }
            : list,
        ),
      );
      const nowSaved = next.size > 0;
      setSaved(nowSaved);
      onSavedChange?.(nowSaved);
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    startTransition(async () => {
      setError(null);
      const created = await createPlaceList({ name });
      if (!created.ok) {
        if (created.error === "Not authenticated") {
          setOpen(false);
          redirectToLogin();
          return;
        }
        setError(created.error);
        return;
      }

      const list = created.data.list;
      setLists((prev) => [list, ...prev]);
      setNewName("");
      setShowCreate(false);

      if (isUuid(placeId)) {
        const added = await addPlaceToList(list.id, placeId);
        if (added.ok) {
          setInLists((prev) => new Set([...prev, list.id]));
          setLists((prev) =>
            prev.map((l) =>
              l.id === list.id ? { ...l, placeCount: l.placeCount + 1 } : l,
            ),
          );
          setSaved(true);
          onSavedChange?.(true);
        }
      }
    });
  };

  const modal = open ? (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("saveToList")}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-fp-dim border border-fp-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-fp-border flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-fp-cream text-lg">{t("saveToList")}</h2>
            <p className="text-fp-muted text-sm mt-0.5 truncate">{placeName}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("close")}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-fp-muted hover:text-fp-cream hover:bg-fp-border/40 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-5 py-3">
          {!isUuid(placeId) && (
            <p className="text-fp-coral text-sm mb-3">{t("mockPlaceWarning")}</p>
          )}

          {loading ? (
            <p className="text-fp-muted text-sm py-6 text-center">{t("loading")}</p>
          ) : lists.length === 0 && !showCreate ? (
            <p className="text-fp-muted text-sm py-4 text-center">{t("noListsYet")}</p>
          ) : (
            <ul className="space-y-1">
              {lists.map((list) => {
                const checked = inLists.has(list.id);
                return (
                  <li key={list.id}>
                    <button
                      type="button"
                      disabled={pending || !isUuid(placeId)}
                      onClick={() => toggleList(list.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-fp-cyan/10 transition-colors disabled:opacity-50 text-left"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          checked
                            ? "bg-fp-cyan border-fp-cyan text-fp-on-cyan"
                            : "border-fp-border"
                        }`}
                      >
                        {checked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-fp-cream text-sm font-medium truncate">
                          {list.name}
                        </span>
                        <span className="block text-fp-muted text-xs">
                          {t("placeCount", { count: list.placeCount })}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {error && (
            <p className="text-fp-red text-sm mt-3">{error}</p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-fp-border">
          {showCreate ? (
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("listNamePlaceholder")}
                maxLength={100}
                autoFocus
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan"
              />
              <button
                type="submit"
                disabled={pending || !newName.trim()}
                className="px-4 py-2 rounded-xl bg-fp-cyan text-fp-on-cyan text-sm font-semibold disabled:opacity-50"
              >
                {t("create")}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-fp-border text-fp-cream text-sm hover:border-fp-cyan hover:text-fp-cyan transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t("createNewList")}
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={pending}
        aria-label={saved ? t("saved") : t("save")}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
          saved
            ? "bg-fp-cyan/20 text-fp-cyan hover:bg-fp-red/20 hover:text-fp-red"
            : "fp-badge-overlay text-fp-muted hover:text-fp-cyan hover:border-fp-cyan/40"
        } ${className}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
