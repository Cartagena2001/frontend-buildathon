"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createPlaceList } from "@/features/place-lists/actions";

export default function CreateListButton() {
  const t = useTranslations("lists");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    startTransition(async () => {
      setError(null);
      const result = await createPlaceList({
        name: trimmed,
        description: description.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      close();
      router.push(`/lists/${result.data.list.id}`);
    });
  };

  const modal = open ? (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-fp-dim border border-fp-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-fp-border flex items-center justify-between">
          <h2 className="font-display text-fp-cream text-xl">{t("createList")}</h2>
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-full text-fp-muted hover:text-fp-cream hover:bg-fp-border/50 transition-colors"
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-fp-muted text-xs font-medium mb-1.5">
              {t("listName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("listNamePlaceholder")}
              maxLength={100}
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan placeholder:text-fp-muted/50 transition-colors"
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
              placeholder={t("listDescriptionPlaceholder")}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan resize-none placeholder:text-fp-muted/50 transition-colors"
            />
          </div>
          {error && <p className="text-fp-red text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            type="button"
            onClick={close}
            className="px-5 py-2.5 rounded-full border border-fp-border text-fp-muted text-sm hover:text-fp-cream hover:border-fp-cream/30 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="px-5 py-2.5 rounded-full bg-fp-cyan text-fp-on-cyan text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? t("creating") : t("create")}
          </button>
        </div>
      </form>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-fp-red text-fp-on-accent text-sm font-semibold hover:bg-fp-cyan hover:text-fp-on-cyan transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {t("createNewList")}
      </button>

      {typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
