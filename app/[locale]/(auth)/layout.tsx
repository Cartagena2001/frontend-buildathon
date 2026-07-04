import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-bg min-h-screen flex flex-col">
      <nav className="auth-content w-full flex items-center justify-between px-8 py-6">
        <Link
          href="/"
          className="text-fp-cream font-sans text-[1.05rem] font-light tracking-wide"
        >
          findy<span className="text-fp-coral">.</span>place
        </Link>
        <ThemeToggle />
      </nav>

      <div className="auth-content flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
}
