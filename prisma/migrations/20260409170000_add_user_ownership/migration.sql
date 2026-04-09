CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

ALTER TABLE "Company"
ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

ALTER TABLE "Resume"
ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

ALTER TABLE "Application"
ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

ALTER TABLE "ImportedEmail"
ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

DROP INDEX IF EXISTS "Company_name_key";
DROP INDEX IF EXISTS "Application_gmailId_key";
DROP INDEX IF EXISTS "ImportedEmail_gmailId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Company_ownerId_name_key" ON "Company"("ownerId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "Application_ownerId_gmailId_key" ON "Application"("ownerId", "gmailId");
CREATE UNIQUE INDEX IF NOT EXISTS "ImportedEmail_ownerId_gmailId_key" ON "ImportedEmail"("ownerId", "gmailId");

CREATE INDEX IF NOT EXISTS "Company_ownerId_idx" ON "Company"("ownerId");
CREATE INDEX IF NOT EXISTS "Resume_ownerId_idx" ON "Resume"("ownerId");
CREATE INDEX IF NOT EXISTS "Application_ownerId_idx" ON "Application"("ownerId");
CREATE INDEX IF NOT EXISTS "ImportedEmail_ownerId_idx" ON "ImportedEmail"("ownerId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Company_ownerId_fkey'
  ) THEN
    ALTER TABLE "Company"
    ADD CONSTRAINT "Company_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Resume_ownerId_fkey'
  ) THEN
    ALTER TABLE "Resume"
    ADD CONSTRAINT "Resume_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Application_ownerId_fkey'
  ) THEN
    ALTER TABLE "Application"
    ADD CONSTRAINT "Application_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ImportedEmail_ownerId_fkey'
  ) THEN
    ALTER TABLE "ImportedEmail"
    ADD CONSTRAINT "ImportedEmail_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
