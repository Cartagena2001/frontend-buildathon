import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
    insert: vi.fn().mockReturnValue({ values: vi.fn() }),
    select: vi.fn(),
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ ok: true }),
  passwordResetOtpEmail: vi.fn().mockReturnValue({ subject: "test", html: "<p>test</p>" }),
}));

const { generateOtp, verifyPasswordResetOtp, createPasswordResetOtp } =
  await import("@/lib/auth/password-reset");

describe("generateOtp", () => {
  it("returns a 6-digit string", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });
});

describe("createPasswordResetOtp + verifyPasswordResetOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores hashed OTP and verifies correctly", async () => {
    const plainOtp = "482910";
    const otpHash = await bcrypt.hash(plainOtp, 10);

    const mockInsert = vi.fn().mockResolvedValue(undefined);
    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    const { db } = await import("@/lib/db");
    vi.mocked(db.update).mockImplementation(mockUpdate);
    vi.mocked(db.insert).mockReturnValue({ values: mockInsert } as never);

    vi.mocked(db.insert).mockReturnValue({ values: mockInsert } as never);

    vi.spyOn(await import("@/lib/auth/password-reset"), "generateOtp").mockReturnValue(plainOtp);

    await createPasswordResetOtp("user-uuid");

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-uuid",
        otpHash: expect.any(String),
        expiresAt: expect.any(Date),
      })
    );

    const otpId = "otp-record-id";
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              { id: otpId, userId: "user-uuid", otpHash, expiresAt: new Date(Date.now() + 3600000) },
            ]),
          }),
        }),
      }),
    });
    vi.mocked(db.select).mockImplementation(mockSelect);

    const result = await verifyPasswordResetOtp("user-uuid", plainOtp);
    expect(result).toBe(otpId);

    const invalid = await verifyPasswordResetOtp("user-uuid", "000000");
    expect(invalid).toBeNull();
  });
});
