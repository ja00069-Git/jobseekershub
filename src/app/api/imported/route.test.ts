import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUserRecord = vi.fn();
const mockValidateTrustedOrigin = vi.fn();
const mockEnforceRateLimit = vi.fn();
const mockImportedFindMany = vi.fn();
const mockTransaction = vi.fn();

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
    importedEmail: {
      findMany: mockImportedFindMany,
    },
    $transaction: mockTransaction,
  },
}));

describe("POST /api/imported", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetCurrentUserRecord.mockResolvedValue({ user: { id: "user_123" } });
    mockValidateTrustedOrigin.mockReturnValue(null);
    mockEnforceRateLimit.mockReturnValue(null);
  });

  it("returns missing_id when no import id is provided", async () => {
    const { POST } = await import("@/app/api/imported/route");

    const response = await POST(
      new Request("http://localhost/api/imported", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: "Acme" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing id",
      code: "missing_id",
    });
  });

  it("returns a structured not_found error when the import is gone", async () => {
    mockTransaction.mockImplementation(async (callback) =>
      callback({
        importedEmail: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      }),
    );

    const { POST } = await import("@/app/api/imported/route");

    const response = await POST(
      new Request("http://localhost/api/imported", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "missing-import-id" }),
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Import not found.",
      code: "not_found",
    });
  });
});