-- Normalize any legacy phone statuses before removing the enum value.
UPDATE "Application"
SET "status" = 'interview'
WHERE "status"::text = 'phone';

UPDATE "ImportedEmail"
SET "status" = 'interview'
WHERE "status"::text = 'phone';

-- Recreate the enum without the deprecated `phone` variant.
ALTER TYPE "Status" RENAME TO "Status_old";

CREATE TYPE "Status" AS ENUM (
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn'
);

ALTER TABLE "Application"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "Status"
  USING ("status"::text::"Status"),
  ALTER COLUMN "status" SET DEFAULT 'applied';

ALTER TABLE "ImportedEmail"
  ALTER COLUMN "status" TYPE "Status"
  USING (
    CASE
      WHEN "status" IS NULL THEN NULL
      ELSE "status"::text::"Status"
    END
  );

DROP TYPE "Status_old";
