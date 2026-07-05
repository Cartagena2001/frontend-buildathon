"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  deletePlaceList,
  updatePlaceList,
} from "@/features/place-lists/actions";
import type { PlaceListDetail } from "@/features/place-lists/types";

interface Props {
  list: PlaceListDetail;
}

export default function EditListForm({ list }: Props) {
  const t = useTranslations("lists");
  const router = useRouter();
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      const result = await updatePlaceList(list.id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      const result = await deletePlaceList(list.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/lists");
    });
  };

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-4 py-2 rounded-full border border-fp-border text-fp-cream text-sm hover:border-fp-cyan transition-colors"
        >
          {t("editList")}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="px-4 py-2 rounded-full text-fp-red text-sm hover:bg-fp-red/10 transition-colors disabled:opacity-50"
        >
          {t("deleteList")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="glass rounded-2xl p-5 space-y-4 max-w-lg">
      <div>
        <label className="block text-fp-muted text-xs mb-1">{t("listName")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          className="w-full px-3 py-2 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan"
        />
      </div>
      <div>
        <label className="block text-fp-muted text-xs mb-1">{t("listDescription")}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan resize-none"
        />
      </div>
      {error && <p className="text-fp-red text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-full bg-fp-cyan text-fp-on-cyan text-sm font-semibold disabled:opacity-50"
        >
          {t("saveChanges")}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-4 py-2 rounded-full text-fp-muted text-sm hover:text-fp-cream"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
