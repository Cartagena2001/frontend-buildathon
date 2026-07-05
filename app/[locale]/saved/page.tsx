import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/** Legacy route — redirects to place lists. */
export default async function SavedPage() {
  const locale = await getLocale();
  redirect(`/${locale}/lists`);
}
