ALTER TABLE "Resume"
ADD COLUMN IF NOT EXISTS "blobPathname" TEXT;

ALTER TABLE "ImportedEmail"
ADD COLUMN IF NOT EXISTS "appliedAt" TIMESTAMP(3);

UPDATE "Company"
SET "ownerId" = (
  SELECT "id"
  FROM "User"
  ORDER BY "createdAt" ASC
  LIMIT 1
)
WHERE "ownerId" IS NULL
  AND EXISTS (SELECT 1 FROM "User");

UPDATE "Resume"
SET "ownerId" = (
  SELECT "id"
  FROM "User"
  ORDER BY "createdAt" ASC
  LIMIT 1
)
WHERE "ownerId" IS NULL
  AND EXISTS (SELECT 1 FROM "User");

UPDATE "Application"
SET "ownerId" = (
  SELECT "id"
  FROM "User"
  ORDER BY "createdAt" ASC
  LIMIT 1
)
WHERE "ownerId" IS NULL
  AND EXISTS (SELECT 1 FROM "User");

UPDATE "ImportedEmail"
SET "ownerId" = (
  SELECT "id"
  FROM "User"
  ORDER BY "createdAt" ASC
  LIMIT 1
)
WHERE "ownerId" IS NULL
  AND EXISTS (SELECT 1 FROM "User");

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Company" WHERE "ownerId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot make Company.ownerId NOT NULL while null rows remain';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Resume" WHERE "ownerId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot make Resume.ownerId NOT NULL while null rows remain';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Application" WHERE "ownerId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot make Application.ownerId NOT NULL while null rows remain';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "ImportedEmail" WHERE "ownerId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot make ImportedEmail.ownerId NOT NULL while null rows remain';
  END IF;
END $$;

ALTER TABLE "Company"
ALTER COLUMN "ownerId" SET NOT NULL;

ALTER TABLE "Resume"
ALTER COLUMN "ownerId" SET NOT NULL;

ALTER TABLE "Application"
ALTER COLUMN "ownerId" SET NOT NULL;

ALTER TABLE "ImportedEmail"
ALTER COLUMN "ownerId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "Application_ownerId_dateApplied_idx"
ON "Application"("ownerId", "dateApplied" DESC, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "ImportedEmail_ownerId_reviewed_createdAt_idx"
ON "ImportedEmail"("ownerId", "reviewed", "createdAt" DESC);