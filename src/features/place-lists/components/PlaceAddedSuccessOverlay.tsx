"use client";

import { useTranslations } from "next-intl";
import CelebrationOverlay from "@/features/place-lists/components/CelebrationOverlay";

const AUTO_DISMISS_MS = 3500;

interface Props {
  onDismiss: () => void;
}

export default function PlaceAddedSuccessOverlay({ onDismiss }: Props) {
  const t = useTranslations("lists");

  return (
    <CelebrationOverlay
      title={t("placeAddedSuccess")}
      subtitle={t("placeAddedShareHint")}
      titleId="place-added-title"
      onDismiss={onDismiss}
      autoDismissMs={AUTO_DISMISS_MS}
    />
  );
}
