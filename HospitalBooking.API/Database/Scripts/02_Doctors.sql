BEGIN;

-- ============================================================================
-- 1. Drop Legacy Triggers (if they exist)
-- ============================================================================
-- Triggers on "Doctors"
DROP TRIGGER IF EXISTS tr_doctors_01_validateuser ON "Doctors";
DROP TRIGGER IF EXISTS tr_doctors_02_validateclinic ON "Doctors";
DROP TRIGGER IF EXISTS tr_doctors_preventuseridchange ON "Doctors";
DROP TRIGGER IF EXISTS tr_doctors_preventdelete ON "Doctors";
DROP TRIGGER IF EXISTS tr_doctors_userconsistency ON "Doctors";

-- Triggers on "Users" created by doctors script
DROP TRIGGER IF EXISTS tr_users_preventdoctorrolechange ON "Users";
DROP TRIGGER IF EXISTS tr_users_doctorconsistency ON "Users";


-- ============================================================================
-- 2. Drop Legacy Functions (if they exist)
-- ============================================================================
DROP FUNCTION IF EXISTS fn_validate_doctor_user();
DROP FUNCTION IF EXISTS fn_validate_doctor_clinic();
DROP FUNCTION IF EXISTS fn_prevent_doctor_userid_change();
DROP FUNCTION IF EXISTS fn_prevent_doctor_role_change();
DROP FUNCTION IF EXISTS fn_prevent_doctor_delete();
DROP FUNCTION IF EXISTS fn_trigger_check_user_doctor();
DROP FUNCTION IF EXISTS fn_check_user_doctor_consistency(integer);


-- ============================================================================
-- 3. Add CHECK Constraints for Bio and ProfileImage
-- ============================================================================
-- 3.1 Bio must not be empty or whitespace only when provided (allows NULL)
ALTER TABLE "Doctors"
DROP CONSTRAINT IF EXISTS "CK_Doctors_Bio_NotBlank";

ALTER TABLE "Doctors"
ADD CONSTRAINT "CK_Doctors_Bio_NotBlank"
CHECK ("Bio" !~ '^[[:space:]]*$');


-- 3.2 ProfileImage must not be empty or whitespace only when provided (allows NULL)
ALTER TABLE "Doctors"
DROP CONSTRAINT IF EXISTS "CK_Doctors_ProfileImage_NotBlank";

ALTER TABLE "Doctors"
ADD CONSTRAINT "CK_Doctors_ProfileImage_NotBlank"
CHECK ("ProfileImage" !~ '^[[:space:]]*$');

COMMIT;
