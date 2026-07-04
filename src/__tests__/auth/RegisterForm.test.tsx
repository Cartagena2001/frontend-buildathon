/**
 * Component tests for RegisterForm.
 * Covers rendering, real-time password mismatch feedback and submission.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockRegisterUser = vi.fn();

vi.mock("@/lib/auth/actions", () => ({
  registerUser: (...args: unknown[]) => mockRegisterUser(...args),
  loginUser:    vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: (
      action: (state: unknown, payload: unknown) => unknown,
      initial: unknown
    ) => {
      const [state, setState] = actual.useState(initial);
      const dispatch = async (payload: unknown) => {
        const next = await action(state, payload);
        setState(next);
      };
      return [state, dispatch, false];
    },
  };
});

// ── Import component ───────────────────────────────────────────────────────

import RegisterForm from "../../../app/[locale]/(auth)/register/RegisterForm";

// ── Helpers ────────────────────────────────────────────────────────────────

function getPasswordInput() {
  return screen.getByLabelText("passwordLabel");
}
function getConfirmInput() {
  return screen.getByLabelText("confirmPasswordLabel");
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterUser.mockResolvedValue({});
  });

  it("renders all required fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText("firstNameLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("lastNameLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("emailLabel")).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(getConfirmInput()).toBeInTheDocument();
  });

  it("shows a password mismatch error after blurring confirm field", async () => {
    render(<RegisterForm />);
    await userEvent.type(getPasswordInput(), "password123");
    await userEvent.type(getConfirmInput(), "different_!");
    fireEvent.blur(getConfirmInput());

    await waitFor(() => {
      expect(screen.getByText(/passwordMismatch/i)).toBeInTheDocument();
    });
  });

  it("shows a check mark (✓) when passwords match", async () => {
    render(<RegisterForm />);
    await userEvent.type(getPasswordInput(), "password123");
    await userEvent.type(getConfirmInput(), "password123");
    fireEvent.blur(getConfirmInput());

    await waitFor(() => {
      expect(screen.getByText("✓")).toBeInTheDocument();
    });
  });

  it("hides mismatch error when passwords match", async () => {
    render(<RegisterForm />);
    await userEvent.type(getPasswordInput(), "password123");
    await userEvent.type(getConfirmInput(), "password123");
    fireEvent.blur(getConfirmInput());

    expect(screen.queryByText(/passwordMismatch/i)).not.toBeInTheDocument();
  });

  it("displays a server-side error returned by the action", async () => {
    // Override useActionState to start with an error state already present
    const { useActionState: _orig, ...rest } =
      await vi.importActual<typeof import("react")>("react");
    vi.spyOn(await import("react"), "useActionState").mockReturnValueOnce([
      { error: "An account with this email already exists." },
      vi.fn(),
      false,
    ] as never);

    render(<RegisterForm />);

    expect(
      screen.getByText("An account with this email already exists.")
    ).toBeInTheDocument();

    void _orig; void rest; // silence unused warnings
    vi.restoreAllMocks();
  });

  it("contains links to terms and privacy policy", () => {
    render(<RegisterForm />);
    expect(screen.getByText(/termsLink/i).closest("a")).toHaveAttribute(
      "href",
      "/legal/terms"
    );
    expect(screen.getByText(/privacyLink/i).closest("a")).toHaveAttribute(
      "href",
      "/legal/privacy"
    );
  });

  it("calls registerUser when form is submitted with valid data", async () => {
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("firstNameLabel"), "Ana");
    await userEvent.type(screen.getByLabelText("lastNameLabel"), "López");
    await userEvent.type(screen.getByLabelText("emailLabel"), "ana@example.com");
    await userEvent.type(getPasswordInput(), "password123");
    await userEvent.type(getConfirmInput(), "password123");
    fireEvent.blur(getConfirmInput());

    await userEvent.click(screen.getByRole("button", { name: /submitButton/i }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalled();
    });
  });
});
