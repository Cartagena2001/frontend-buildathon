// Root layout — intentionally minimal.
// The real layout (fonts, providers, lang attr) lives in app/[locale]/layout.tsx.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
