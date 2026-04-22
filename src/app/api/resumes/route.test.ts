import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUserRecord = vi.fn();
const mockValidateTrustedOrigin = vi.fn();
const mockEnforceRateLimit = vi.fn();
const mockResumeCreate = vi.fn();
const mockResumeFindMany = vi.fn();
const mockResumeFindFirst = vi.fn();
const mockTransaction = vi.fn();
const mockDeleteBlob = vi.fn();

vi.mock("@/lib/current-user", () => ({
  getCurrentUserRecord: mockGetCurrentUserRecord,
}));

vi.mock("@/lib/request-security", () => ({
  validateTrustedOrigin: mockValidateTrustedOrigin,
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mockEnforceRateLimit,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    resume: {
      create: mockResumeCreate,
      findMany: mockResumeFindMany,
      findFirst: mockResumeFindFirst,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("@vercel/blob", () => ({
  del: mockDeleteBlob,
}));

describe("POST /api/resumes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetCurrentUserRecord.mockResolvedValue({ user: { id: "user_123" } });
    mockValidateTrustedOrigin.mockReturnValue(null);
    mockEnforceRateLimit.mockReturnValue(null);
  });

  it("returns a structured validation error for invalid payloads", async () => {
    const { POST } = await import("@/app/api/resumes/route");

    const response = await POST(
      new Request("http://localhost/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Resume" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "name and a valid http/https fileUrl are required.",
      code: "invalid_resume_payload",
    });
    expect(mockResumeCreate).not.toHaveBeenCalled();
  });
});