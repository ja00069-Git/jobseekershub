import * as Sentry from "@sentry/node";

const globalForSentry = globalThis as {
  __jobSeekersHubSentryInitialized?: boolean;
};

function getSentryDsn() {
  return process.env.SENTRY_DSN?.trim() || null;
}

function ensureSentryInitialized() {
  if (globalForSentry.__jobSeekersHubSentryInitialized) {
    return Boolean(getSentryDsn());
  }

  const dsn = getSentryDsn();

  if (!dsn) {
    globalForSentry.__jobSeekersHubSentryInitialized = true;
    return false;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV,
    tracesSampleRate: 0,
  });

  globalForSentry.__jobSeekersHubSentryInitialized = true;
  return true;
}

export function reportServerError({
  label,
  error,
  requestId,
}: {
  label: string;
  error: unknown;
  requestId?: string;
}) {
  console.error(`[api:${label}]`, requestId ?? "", error);

  if (!ensureSentryInitialized()) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("surface", "api");
    scope.setTag("route_label", label);

    if (requestId) {
      scope.setTag("request_id", requestId);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
      return;
    }

    Sentry.captureMessage(`Non-Error exception in ${label}: ${String(error)}`, "error");
  });
}