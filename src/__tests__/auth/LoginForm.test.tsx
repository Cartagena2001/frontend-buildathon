/**
 * Component tests for LoginForm.
 * Verifies rendering, field validation feedback and submission behaviour.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockLoginUser = vi.fn();

vi.mock("@/lib/auth/actions", () => ({
  loginUser:    (...args: unknown[]) => mockLoginUser(...args),
  registerUser: vi.fn(),
}));

// next-intl client hook
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// locale-aware Link
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// useActionState: synchronous shim that calls the action and exposes state
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

import LoginForm from "../../../app/[locale]/(auth)/login/LoginForm";

// ── Tests ──────────────────────────────────────────────────────────────────

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginUser.mockResolvedValue({});
  });

  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("emailLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("passwordLabel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "submitButton" })).toBeInTheDocument();
  });

  it("has a link to the forgot-password page", () => {
    render(<LoginForm />);
    expect(screen.getByText(/forgotPassword/i)).toBeInTheDocument();
  });

  it("shows a server error message when the action returns one", async () => {
    mockLoginUser.mockResolvedValue({ error: "Invalid email or password." });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("emailLabel"), "bad@example.com");
    await userEvent.type(screen.getByLabelText("passwordLabel"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: "submitButton" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
    });
  });

  it("does not show an error message on initial render", () => {
    render(<LoginForm />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls the login action when the form is submitted", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("emailLabel"), "user@example.com");
    await userEvent.type(screen.getByLabelText("passwordLabel"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "submitButton" }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalled();
    });
  });
});
