"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  sharePlaceList,
  unsharePlaceList,
} from "@/features/place-lists/actions";

interface Props {
  listId: string;
  isShared: boolean;
  shareToken: string | null;
}

export default function ShareListButton({
  listId,
  isShared: initialShared,
  shareToken: initialToken,
}: Props) {
  const t = useTranslations("lists");
  const locale = useLocale();
  const [isShared, setIsShared] = useState(initialShared);
  const [shareToken, setShareToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shareUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/shared/${shareToken}`
      : shareToken
        ? `/${locale}/shared/${shareToken}`
        : null;

  const handleShare = () => {
    startTransition(async () => {
      setError(null);
      const result = await sharePlaceList(listId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setShareToken(result.data.shareToken);
      setIsShared(true);
    });
  };

  const handleUnshare = () => {
    startTransition(async () => {
      setError(null);
      const result = await unsharePlaceList(listId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setIsShared(false);
      setShareToken(null);
      setCopied(false);
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("copyError"));
    }
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-display text-fp-cream text-base">{t("shareTitle")}</h3>
        <p className="text-fp-muted text-sm mt-1">{t("shareDescription")}</p>
      </div>

      {isShared && shareUrl ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-fp-dark border border-fp-border text-fp-muted text-xs truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={pending}
              className="px-4 py-2 rounded-xl bg-fp-cyan text-fp-on-cyan text-sm font-semibold shrink-0 disabled:opacity-50"
            >
              {copied ? t("copied") : t("copyLink")}
            </button>
          </div>
          <button
            type="button"
            onClick={handleUnshare}
            disabled={pending}
            className="text-fp-red text-sm hover:underline disabled:opacity-50"
          >
            {t("stopSharing")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleShare}
          disabled={pending}
          className="px-5 py-2.5 rounded-full bg-fp-cyan text-fp-on-cyan text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {t("enableSharing")}
        </button>
      )}

      {error && <p className="text-fp-red text-sm">{error}</p>}
    </div>
  );
}
