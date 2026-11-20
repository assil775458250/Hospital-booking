-- ============================================================================
-- 0. Required Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

BEGIN;

-- ============================================================================
-- 1. Drop Legacy Triggers (if they exist)
-- ============================================================================
DROP TRIGGER IF EXISTS tr_appointment_slots_validate_insert ON "AppointmentSlots";
DROP TRIGGER IF EXISTS tr_appointment_slots_prevent_core_update ON "AppointmentSlots";
DROP TRIGGER IF EXISTS tr_appointment_slots_validate_cancellation ON "AppointmentSlots";
DROP TRIGGER IF EXISTS tr_appointment_slots_cancel_bookings ON "AppointmentSlots";
DROP TRIGGER IF EXISTS tr_appointment_slots_prevent_delete ON "AppointmentSlots";


-- ============================================================================
-- 2. Drop Legacy Functions (if they exist)
-- ============================================================================
DROP FUNCTION IF EXISTS fn_validate_appointment_slot_insert();
DROP FUNCTION IF EXISTS fn_prevent_appointment_slot_core_update();
DROP FUNCTION IF EXISTS fn_validate_appointment_slot_cancellation();
DROP FUNCTION IF EXISTS fn_cancel_bookings_after_slot_cancellation();
DROP FUNCTION IF EXISTS fn_prevent_appointment_slot_delete();


-- ============================================================================
-- 3. Structural Constraints (Create if not exists)
-- ============================================================================
DO $$
BEGIN
    -- 3.1 Validate Appointment Slot Date Range (EndDateTime > StartDateTime)
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'CK_AppointmentSlots_ValidDateRange'
          AND conrelid = '"AppointmentSlots"'::regclass
    ) THEN
        ALTER TABLE "AppointmentSlots"
        ADD CONSTRAINT "CK_AppointmentSlots_ValidDateRange"
        CHECK ("EndDateTime" > "StartDateTime");
    END IF;

    -- 3.2 Prevent Overlapping Active Appointment Slots for the Same Doctor
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'EX_AppointmentSlots_Doctor_NoOverlap'
          AND conrelid = '"AppointmentSlots"'::regclass
    ) THEN
        ALTER TABLE "AppointmentSlots"
        ADD CONSTRAINT "EX_AppointmentSlots_Doctor_NoOverlap"
        EXCLUDE USING GIST
        (
            "DoctorId" WITH =,
            tstzrange("StartDateTime", "EndDateTime", '[)') WITH &&
        )
        WHERE ("IsCancelled" = FALSE);
    END IF;
END;
$$;

COMMIT;
