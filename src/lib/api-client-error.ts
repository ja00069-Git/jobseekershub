export type ApiErrorPayload = {
  error?: string;
  code?: string;
  requestId?: string;
};

const friendlyErrorMessages: Record<string, string> = {
  unauthorized: "Your session has expired. Sign in again and retry.",
  invalid_origin: "This request was blocked for security reasons. Refresh and try again.",
  rate_limited: "You are doing that too quickly. Wait a moment and try again.",
  invalid_json: "The request format was invalid. Refresh the page and try again.",
  database_unavailable: "The app is having trouble reaching the database right now. Try again shortly.",
  unique_conflict: "That record already exists.",
  invalid_relation: "One of the selected related records is no longer valid. Refresh and try again.",
  record_not_found: "That item could not be found anymore. Refresh and try again.",
  gmail_upstream_error: "Gmail did not respond correctly. Try again in a moment.",
  gmail_sync_failed: "Gmail sync failed. Try again in a moment.",
  invalid_resume_payload: "Enter a resume name and a valid file link, or upload a file.",
  resume_upload_failed: "The resume upload failed. Try again with the same file or a smaller one.",
  file_too_large: "That file is too large. Upload a file that is 10MB or smaller.",
  invalid_file_type: "Only PDF, DOC, and DOCX files are supported.",
  missing_id: "The selected item could not be identified. Refresh and try again.",
  invalid_company: "Enter a company name before saving.",
  invalid_role: "Enter a role title before saving.",
  invalid_status: "Choose a valid application stage.",
  invalid_date_applied: "Enter a valid application date.",
  empty_update: "No changes were provided to save.",
};

export async function readApiJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export function getFriendlyApiErrorMessage(
  payload: ApiErrorPayload | null | undefined,
  fallbackMessage: string,
) {
  const message =
    (payload?.code ? friendlyErrorMessages[payload.code] : null) ??
    payload?.error ??
    fallbackMessage;

  return payload?.requestId ? `${message} Reference ID: ${payload.requestId}.` : message;
}