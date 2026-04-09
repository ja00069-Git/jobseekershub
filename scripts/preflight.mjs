#!/usr/bin/env node
import { config as loadEnv } from "dotenv";

loadEnv();

const requiredEnv = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const problems = [];
const warnings = [];

for (const envName of requiredEnv) {
  const value = process.env[envName]?.trim();
  if (!value) {
    problems.push(`${envName} is missing.`);
  }
}

const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() ?? "";
const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim() ?? "";
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

if (nextAuthSecret && nextAuthSecret.length < 32) {
  problems.push("NEXTAUTH_SECRET should be at least 32 characters long.");
}

if (nextAuthUrl) {
  try {
    const parsedUrl = new URL(nextAuthUrl);
    if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
      problems.push("NEXTAUTH_URL must use https in production.");
    }
  } catch {
    problems.push("NEXTAUTH_URL must be a valid URL.");
  }
}

if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/i.test(databaseUrl)) {
  problems.push("DATABASE_URL should not point to localhost in production.");
}

if (/replace-with-a-long-random-secret/i.test(nextAuthSecret)) {
  problems.push("NEXTAUTH_SECRET is still using the example placeholder value.");
}

if (/your-google-client-id|your-google-client-secret/i.test(`${process.env.GOOGLE_CLIENT_ID} ${process.env.GOOGLE_CLIENT_SECRET}`)) {
  problems.push("Google OAuth credentials are still using example placeholder values.");
}

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  warnings.push("NODE_ENV is not set to production. This is fine for local testing, but change it before launch.");
}

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (problems.length > 0) {
  console.error("\nLaunch preflight failed:\n");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("\nLaunch preflight passed.");
console.log("- Required environment variables are present.");
console.log("- Auth URL and secret look production-ready.");
console.log("- Database URL passed the basic launch checks.");
