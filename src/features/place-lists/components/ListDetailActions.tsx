"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  deletePlaceList,
  sharePlaceList,
  unsharePlaceList,
  updatePlaceList,
} from "@/features/place-lists/actions";
import type { PlaceListDetail } from "@/features/place-lists/types";

interface Props {
  list: PlaceListDetail;
}

export default function ListDetailActions({ list }: Props) {
  const t = useTranslations("lists");
  const locale = useLocale();
  const router = useRouter();

  const [shareToken, setShareToken] = useState(list.shareToken);
  const [isShared, setIsShared] = useState(list.isShared);
  const [copied, setCopied] = useState(false);
  const [sharePending, startShareTransition] = useTransition();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? "");
  const [editPending, startEditTransition] = useTransition();
  const [editError, setEditError] = useState<string | null>(null);

  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Share ────────────────────────────────────────────────

  const shareUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/shared/${shareToken}`
      : shareToken
        ? `/${locale}/shared/${shareToken}`
        : null;

  const handleShare = () => {
    startShareTransition(async () => {
      let token = shareToken;

      if (!isShared || !token) {
        const result = await sharePlaceList(list.id);
        if (!result.ok) return;
        token = result.data.shareToken;
        setShareToken(token);
        setIsShared(true);
      }

      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/${locale}/shared/${token}`
          : `/${locale}/shared/${token}`;

      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // ignore
      }
    });
  };

  const handleUnshare = () => {
    startShareTransition(async () => {
      const result = await unsharePlaceList(list.id);
      if (!result.ok) return;
      setIsShared(false);
      setShareToken(null);
      setCopied(false);
    });
  };

  // ── Edit ─────────────────────────────────────────────────

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startEditTransition(async () => {
      setEditError(null);
      const result = await updatePlaceList(list.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      if (!result.ok) {
        setEditError(result.error);
        return;
      }
      setEditOpen(false);
      router.refresh();
    });
  };

  // ── Delete ───────────────────────────────────────────────

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deletePlaceList(list.id);
      if (!result.ok) return;
      router.push("/lists");
    });
  };

  // ── Edit modal ───────────────────────────────────────────

  const editModal = editOpen ? (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setEditOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-fp-dim border border-fp-border sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-fp-cream text-lg">{t("editList")}</h2>
          <button
            type="button"
            onClick={() => setEditOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-fp-muted hover:text-fp-cream hover:bg-fp-surface transition-colors"
            aria-label={t("cancel")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-5 sm:px-6 pb-5 space-y-4">
          <div>
            <label className="block text-fp-muted text-[0.65rem] font-semibold uppercase tracking-widest mb-2">
              {t("listName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl fp-field border border-fp-border text-sm outline-none focus:border-fp-teal/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-fp-muted text-[0.65rem] font-semibold uppercase tracking-widest mb-2">
              {t("listDescription")}
              <span className="ml-1.5 normal-case tracking-normal font-normal text-fp-muted/60">
                ({t("optional")})
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl fp-field border border-fp-border text-sm outline-none focus:border-fp-teal/50 resize-none transition-colors"
            />
          </div>
          {editError && <p className="text-fp-coral text-sm">{editError}</p>}
        </div>
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(false)}
            className="flex-1 px-4 py-2.5 rounded-full text-fp-muted text-sm hover:text-fp-cream transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={editPending || !name.trim()}
            className="flex-1 px-4 py-2.5 rounded-full bg-fp-coral text-white text-sm font-semibold hover:bg-fp-coral/90 transition-colors disabled:opacity-50"
          >
            {editPending ? t("saving") : t("saveChanges")}
          </button>
        </div>
      </form>
    </div>
  ) : null;

  // ── Delete modal ─────────────────────────────────────────

  const deleteModal = deleteOpen ? (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setDeleteOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-sm bg-fp-dim border border-fp-border sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-5 sm:px-6 pt-5 pb-4">
          <h3 className="font-display text-fp-cream text-lg mb-1">{t("deleteTitle")}</h3>
          <p className="text-fp-muted text-sm leading-relaxed">{t("deleteConfirm")}</p>
        </div>
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="flex-1 px-4 py-2.5 rounded-full text-fp-muted text-sm hover:text-fp-cream transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={() => { setDeleteOpen(false); handleDelete(); }}
            disabled={deletePending}
            className="flex-1 px-4 py-2.5 rounded-full bg-fp-coral text-white text-sm font-semibold hover:bg-fp-coral/90 transition-colors disabled:opacity-50"
          >
            {deletePending ? t("deleting") : t("deleteShort")}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ── Render ───────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Share — primary action */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharePending}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 ${
              copied
                ? "bg-fp-teal/15 text-fp-teal border border-fp-teal/30"
                : "bg-fp-coral text-white hover:bg-fp-coral/90 shadow-sm"
            }`}
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                {t("copied")}
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                {isShared ? t("copyLink") : t("shareList")}
              </>
            )}
          </button>

          {isShared && (
            <button
              type="button"
              onClick={handleUnshare}
              disabled={sharePending}
              className="text-fp-muted text-xs font-medium hover:text-fp-coral transition-colors disabled:opacity-40 px-1"
            >
              {t("stopSharing")}
            </button>
          )}
        </div>

        {/* Edit + Delete — grouped, minimal */}
        <div
          role="group"
          aria-label={t("listActions")}
          className="inline-flex items-center rounded-full border border-fp-border bg-fp-surface/50 p-1"
        >
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm text-fp-muted hover:text-fp-cream hover:bg-fp-field-hover-bg transition-colors"
          >
            <EditIcon />
            <span className="hidden sm:inline">{t("editList")}</span>
          </button>
          <span className="w-px h-4 bg-fp-border shrink-0" aria-hidden />
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            disabled={deletePending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm text-fp-muted hover:text-fp-coral hover:bg-fp-coral/5 transition-colors disabled:opacity-50"
          >
            <TrashIcon />
            <span className="hidden sm:inline">{t("deleteShort")}</span>
          </button>
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(editModal, document.body)}
      {typeof document !== "undefined" && createPortal(deleteModal, document.body)}
    </>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
