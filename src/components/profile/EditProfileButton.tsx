"use client";

import { useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/lib/auth/profile-actions";
import { AVATAR_ACCEPT } from "@/lib/profile/avatar.constants";
import { processAvatarFile } from "@/lib/profile/process-avatar-file";
import UserAvatar from "@/components/ui/UserAvatar";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
}

export default function EditProfileButton({
  firstName,
  lastName,
  email,
  image,
}: Props) {
  const t = useTranslations("profile");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [avatar, setAvatar] = useState<string | null>(image ?? null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displayName = `${first} ${last}`.trim() || firstName;

  const openModal = () => {
    setFirst(firstName);
    setLast(lastName);
    setAvatar(image ?? null);
    setAvatarChanged(false);
    setError(null);
    setOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    try {
      const dataUrl = await processAvatarFile(file);
      setAvatar(dataUrl);
      setAvatarChanged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("avatarUploadError"));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarChanged(true);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      const result = await updateProfile({
        firstName: first,
        lastName: last,
        ...(avatarChanged ? { image: avatar } : {}),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  const modal = open ? (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <form
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-fp-dim border border-fp-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-fp-border flex items-center justify-between">
          <h2 className="font-display text-fp-cream text-xl">{t("editProfile")}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-fp-muted hover:text-fp-cream hover:bg-fp-border/50 transition-colors"
            aria-label={t("cancel")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar name={displayName} image={avatar} size="lg" />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-full border border-fp-border text-fp-cream text-sm hover:border-fp-cyan/60 transition-colors"
              >
                {t("uploadPhoto")}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-4 py-2 rounded-full text-fp-muted text-sm hover:text-fp-red transition-colors"
                >
                  {t("removePhoto")}
                </button>
              )}
            </div>
            <p className="text-fp-muted text-xs text-center max-w-xs">{t("avatarHint")}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="profile-first-name" className="block text-fp-muted text-xs font-medium mb-1.5">
                {t("firstNameLabel")}
              </label>
              <input
                id="profile-first-name"
                type="text"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                maxLength={100}
                required
                autoComplete="given-name"
                className="w-full px-4 py-2.5 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan transition-colors"
              />
            </div>
            <div>
              <label htmlFor="profile-last-name" className="block text-fp-muted text-xs font-medium mb-1.5">
                {t("lastNameLabel")}
              </label>
              <input
                id="profile-last-name"
                type="text"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                maxLength={100}
                required
                autoComplete="family-name"
                className="w-full px-4 py-2.5 rounded-xl bg-fp-dark border border-fp-border text-fp-cream text-sm outline-none focus:border-fp-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-fp-muted text-xs font-medium mb-1.5">
              {t("emailLabel")}
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2.5 rounded-xl bg-fp-dark/60 border border-fp-border text-fp-muted text-sm outline-none cursor-not-allowed"
            />
          </div>

          {error && <p className="text-fp-red text-sm">{error}</p>}
        </div>

        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 rounded-full border border-fp-border text-fp-muted text-sm hover:text-fp-cream transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={pending || !first.trim() || !last.trim()}
            className="px-5 py-2.5 rounded-full bg-fp-cyan text-fp-on-cyan text-sm font-semibold disabled:opacity-50"
          >
            {pending ? t("saving") : t("saveChanges")}
          </button>
        </div>
      </form>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="fp-btn-secondary rounded-xl px-5 py-2.5 text-sm font-medium border border-fp-border hover:border-fp-cyan hover:text-fp-cyan transition-colors"
      >
        {t("editProfile")}
      </button>
      {typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
