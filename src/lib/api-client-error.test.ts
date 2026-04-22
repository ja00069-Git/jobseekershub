import { describe, expect, it } from "vitest";

import { getFriendlyApiErrorMessage } from "@/lib/api-client-error";

describe("getFriendlyApiErrorMessage", () => {
  it("maps stable codes to friendly copy", () => {
    expect(
      getFriendlyApiErrorMessage(
        { code: "invalid_resume_payload", error: "name and a valid http/https fileUrl are required." },
        "Fallback",
      ),
    ).toBe("Enter a resume name and a valid file link, or upload a file.");
  });

  it("appends request ids for supportable server failures", () => {
    expect(
      getFriendlyApiErrorMessage(
        { error: "Failed to load resumes.", requestId: "req_123" },
        "Fallback",
      ),
    ).toBe("Failed to load resumes. Reference ID: req_123.");
  });
});