import "@testing-library/jest-dom";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Silence Next.js-specific globals that don't exist in Vitest jsdom
// (e.g. next-intl server functions)
vi.mock("next-intl/server", () => ({
  getLocale: vi.fn().mockResolvedValue("es"),
  getTranslations: vi.fn().mockResolvedValue(() => (key: string) => key),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/es"),
}));

vi.mock("next-intl/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    `<a href="${href}">${children}</a>`,
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/es"),
}));
