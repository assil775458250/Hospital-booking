BEGIN;

-- ============================================================================
-- 1. Drop Legacy Triggers (if they exist)
-- ============================================================================
DROP TRIGGER IF EXISTS tr_clinics_preventdelete ON "Clinics";
DROP TRIGGER IF EXISTS tr_clinics_handledeactivation ON "Clinics";


-- ============================================================================
-- 2. Drop Legacy Functions (if they exist)
-- ============================================================================
DROP FUNCTION IF EXISTS fn_prevent_clinic_delete();
DROP FUNCTION IF EXISTS fn_handle_clinic_deactivation();


-- ============================================================================
-- 3. Standardize and Add CHECK Constraints
-- ============================================================================
-- 3.1 ClinicName must not be empty or whitespace only
ALTER TABLE "Clinics"
DROP CONSTRAINT IF EXISTS "CK_Clinics_ClinicName_NotBlank";

ALTER TABLE "Clinics"
ADD CONSTRAINT "CK_Clinics_ClinicName_NotBlank"
CHECK ("ClinicName" !~ '^[[:space:]]*$');


-- 3.2 Specialty must not be empty or whitespace only
ALTER TABLE "Clinics"
DROP CONSTRAINT IF EXISTS "CK_Clinics_Specialty_NotBlank";

ALTER TABLE "Clinics"
ADD CONSTRAINT "CK_Clinics_Specialty_NotBlank"
CHECK ("Specialty" !~ '^[[:space:]]*$');


-- 3.3 Description must not be empty or whitespace only when provided (allows NULL)
ALTER TABLE "Clinics"
DROP CONSTRAINT IF EXISTS "CK_Clinics_Description_NotBlank";

ALTER TABLE "Clinics"
ADD CONSTRAINT "CK_Clinics_Description_NotBlank"
CHECK ("Description" !~ '^[[:space:]]*$');


-- ============================================================================
-- 4. Functional Unique Index on ClinicName (case-insensitive)
-- ============================================================================
DROP INDEX IF EXISTS "UX_Clinics_ClinicName_Lower";

CREATE UNIQUE INDEX "UX_Clinics_ClinicName_Lower"
ON "Clinics" (LOWER("ClinicName"));

COMMIT;
