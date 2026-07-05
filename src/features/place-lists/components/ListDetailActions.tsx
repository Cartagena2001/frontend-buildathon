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
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={() => setEditOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-fp-dim border border-fp-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-fp-border flex items-center justify-between">
          <h2 className="font-display text-fp-cream text-xl">{t("editList")}</h2>
          <button
            type="button"
            onClick={() => setEditOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-fp-muted hover:text-fp-cream hover:bg-fp-border/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-fp-muted text-xs font-medium mb-1.5">{t("listName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan transition-colors"
            />
          </div>
          <div>
            <label className="block text-fp-muted text-xs font-medium mb-1.5">
              {t("listDescription")}
              <span className="ml-1 text-fp-muted/50">{t("optional")}</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan resize-none transition-colors"
            />
          </div>
          {editError && <p className="text-fp-red text-sm">{editError}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setEditOpen(false)}
            className="px-5 py-2.5 rounded-full border border-fp-border text-fp-muted text-sm hover:text-fp-cream transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={editPending || !name.trim()}
            className="px-5 py-2.5 rounded-full bg-fp-cyan text-fp-on-cyan text-sm font-semibold disabled:opacity-50"
          >
            {t("saveChanges")}
          </button>
        </div>
      </form>
    </div>
  ) : null;

  // ── Delete modal ─────────────────────────────────────────

  const deleteModal = deleteOpen ? (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={() => setDeleteOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-fp-dim border border-fp-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Icon */}
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center gap-4">
          <span className="w-14 h-14 rounded-full bg-fp-red/15 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-fp-red">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </span>
          <div>
            <h3 className="font-display text-fp-cream text-lg mb-1">{t("deleteTitle")}</h3>
            <p className="text-fp-muted text-sm">{t("deleteConfirm")}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="flex-1 px-4 py-2.5 rounded-full border border-fp-border text-fp-cream text-sm hover:border-fp-cyan/50 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={() => { setDeleteOpen(false); handleDelete(); }}
            disabled={deletePending}
            className="flex-1 px-4 py-2.5 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {deletePending ? t("deleting") : t("deleteList")}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ── Render ───────────────────────────────────────────────

  return (
    <>
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        {/* Share button */}
        <button
          type="button"
          onClick={handleShare}
          disabled={sharePending}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
            copied
              ? "bg-fp-teal/20 text-fp-teal"
              : "bg-fp-cyan/10 text-fp-cyan hover:bg-fp-cyan/20"
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
            className="text-fp-muted text-xs hover:text-fp-red transition-colors disabled:opacity-40"
          >
            {t("stopSharing")}
          </button>
        )}

        <div className="flex-1" />

        {/* Edit */}
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-fp-border text-fp-cream text-sm hover:border-fp-cyan/60 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          {t("editList")}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          disabled={deletePending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-fp-red text-sm hover:bg-fp-red/10 transition-colors disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          {t("deleteList")}
        </button>
      </div>

      {typeof document !== "undefined" && createPortal(editModal, document.body)}
      {typeof document !== "undefined" && createPortal(deleteModal, document.body)}
    </>
  );
}
