import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Job Seekers Hub",
  description: "How Job Seekers Hub collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Legal
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Effective date: April 13, 2026</p>
      </header>

      <article className="ui-surface-card space-y-5 p-5 text-sm leading-6 text-slate-700 dark:text-slate-300 sm:p-6">
        <p>
          Job Seekers Hub helps you organize job applications, resumes, companies, and job-related email imports.
          This policy explains what we collect, how we use it, and your choices.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">1. Information We Collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account data such as email, name, and profile image from your sign-in provider</li>
            <li>Workspace data such as applications, resumes, companies, and review records</li>
            <li>OAuth data required for Google sign-in and Gmail sync</li>
            <li>Operational telemetry such as request and error logs for security and reliability</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">2. How We Use Data</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Authenticate users and protect account access</li>
            <li>Provide core tracking and review features</li>
            <li>Process Gmail imports when you initiate sync</li>
            <li>Operate, secure, and improve service quality</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">3. Google API Data</h2>
          <p>
            Gmail data is only used for your review workflow. We do not sell Google user data, we do not use
            Gmail data for advertising, and we follow Google API Services User Data Policy including Limited Use
            requirements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">4. Sharing and Retention</h2>
          <p>
            We do not sell personal information. Data may be shared with contracted infrastructure providers,
            or when required by law or to protect rights and safety. Data is retained while needed to provide
            the service and for required legal and security obligations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">5. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, delete, restrict, or export your
            personal data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">6. Contact</h2>
          <p>
            Privacy requests: privacy@jobseekershub.com
            <br />
            Company: Job Seekers Hub
          </p>
        </section>
      </article>
    </div>
  );
}