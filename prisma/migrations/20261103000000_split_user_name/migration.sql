-- Split the single User.name column into firstName / lastName.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Backfill from the old column before dropping it. First word becomes the first
-- name; everything after it (middle names included) becomes the last name.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'User'
          AND column_name = 'name'
    ) THEN
        UPDATE "User"
        SET "firstName" = NULLIF(split_part(btrim("name"), ' ', 1), ''),
            "lastName" = NULLIF(
                btrim(substr(btrim("name"), length(split_part(btrim("name"), ' ', 1)) + 1)),
                ''
            )
        WHERE "name" IS NOT NULL
          AND btrim("name") <> ''
          AND "firstName" IS NULL;

        ALTER TABLE "User" DROP COLUMN "name";
    END IF;
END $$;

-- The password column was added with `prisma db push` and never recorded in a
-- migration; add it guardedly so fresh databases built from migrations match.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
