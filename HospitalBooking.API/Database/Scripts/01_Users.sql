BEGIN;

-- ============================================================================
-- 1. FullName must not be empty or whitespace only
-- ============================================================================
ALTER TABLE "Users"
DROP CONSTRAINT IF EXISTS "CK_Users_FullName_NotBlank";

ALTER TABLE "Users"
ADD CONSTRAINT "CK_Users_FullName_NotBlank"
CHECK ("FullName" !~ '^[[:space:]]*$');


-- ============================================================================
-- 2. PhoneNumber must not be empty or whitespace only when provided
-- ============================================================================
ALTER TABLE "Users"
DROP CONSTRAINT IF EXISTS "CK_Users_PhoneNumber_NotBlank";

ALTER TABLE "Users"
ADD CONSTRAINT "CK_Users_PhoneNumber_NotBlank"
CHECK ("PhoneNumber" !~ '^[[:space:]]*$');


-- ============================================================================
-- 3. Email must not be empty or whitespace only when provided
-- ============================================================================
ALTER TABLE "Users"
DROP CONSTRAINT IF EXISTS "CK_Users_Email_NotBlank";

ALTER TABLE "Users"
ADD CONSTRAINT "CK_Users_Email_NotBlank"
CHECK ("Email" !~ '^[[:space:]]*$');


-- ============================================================================
-- 4. At least one contact method is required (Phone or Email)
-- ============================================================================
ALTER TABLE "Users"
DROP CONSTRAINT IF EXISTS "CK_Users_AtLeastOneContact";

ALTER TABLE "Users"
ADD CONSTRAINT "CK_Users_AtLeastOneContact"
CHECK (
    "PhoneNumber" IS NOT NULL
    OR "Email" IS NOT NULL
);


-- ============================================================================
-- 5. Only valid user roles are allowed (Patient, Doctor, Admin)
-- ============================================================================
ALTER TABLE "Users"
DROP CONSTRAINT IF EXISTS "CK_Users_ValidRole";

ALTER TABLE "Users"
ADD CONSTRAINT "CK_Users_ValidRole"
CHECK (
    "Role" IN ('Patient', 'Doctor', 'Admin')
);


-- ============================================================================
-- 6. PasswordHash must not be empty or whitespace only
-- ============================================================================
ALTER TABLE "Users"
DROP CONSTRAINT IF EXISTS "CK_Users_PasswordHash_NotBlank";

ALTER TABLE "Users"
ADD CONSTRAINT "CK_Users_PasswordHash_NotBlank"
CHECK ("PasswordHash" !~ '^[[:space:]]*$');


-- ============================================================================
-- 7. Partial unique index on PhoneNumber (indexes non-NULL values only)
-- ============================================================================
DROP INDEX IF EXISTS "IX_Users_PhoneNumber";

CREATE UNIQUE INDEX "IX_Users_PhoneNumber"
ON "Users" ("PhoneNumber")
WHERE "PhoneNumber" IS NOT NULL;


-- ============================================================================
-- 8. Functional partial unique index on Email (case-insensitive, non-NULL only)
-- Note: "IX_Users_Email" is retained on Neon without deletion until verification.
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS "UX_Users_Email_Lower"
ON "Users" (LOWER("Email"))
WHERE "Email" IS NOT NULL;

COMMIT;
