BEGIN;

-- ============================================================================
-- 1. Drop Legacy Triggers (if they exist)
-- ============================================================================
DROP TRIGGER IF EXISTS tr_bookings_validate_insert ON "Bookings";
DROP TRIGGER IF EXISTS tr_bookings_validate_status_transition ON "Bookings";
DROP TRIGGER IF EXISTS tr_bookings_prevent_core_update ON "Bookings";
DROP TRIGGER IF EXISTS tr_bookings_prevent_delete ON "Bookings";


-- ============================================================================
-- 2. Drop Legacy Functions (if they exist)
-- ============================================================================
DROP FUNCTION IF EXISTS fn_validate_booking_insert();
DROP FUNCTION IF EXISTS fn_validate_booking_status_transition();
DROP FUNCTION IF EXISTS fn_prevent_booking_core_update();
DROP FUNCTION IF EXISTS fn_prevent_booking_delete();


-- ============================================================================
-- 3. Structural Constraints (Create if not exists)
-- ============================================================================
-- 3.1 Validate Booking Status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'CK_Bookings_ValidStatus'
          AND conrelid = '"Bookings"'::regclass
    ) THEN
        ALTER TABLE "Bookings"
        ADD CONSTRAINT "CK_Bookings_ValidStatus"
        CHECK (
            "Status" IN (
                'Pending',
                'Approved',
                'Rejected',
                'Cancelled'
            )
        );
    END IF;
END;
$$;


-- ============================================================================
-- 4. Default Column Values
-- ============================================================================
ALTER TABLE "Bookings"
ALTER COLUMN "Status"
SET DEFAULT 'Pending';


-- ============================================================================
-- 5. Indexes (Validate or create)
-- ============================================================================
-- Prevent Multiple Active Bookings Per Slot
DO $$
DECLARE
    v_index_oid OID;
    v_is_unique BOOLEAN;
    v_am_name TEXT;
    v_indnatts INT;
    v_indnkeyatts INT;
    v_col_name TEXT;
    v_predicate TEXT;
    v_normalized_pred TEXT;
    v_is_valid_pred BOOLEAN;
    v_indexdef TEXT;
    v_schema_oid OID;
BEGIN
    -- 1. Get the schema OID of the "Bookings" table
    SELECT relnamespace INTO v_schema_oid
    FROM pg_class
    WHERE oid = '"Bookings"'::regclass;

    -- 2. Inspect if the index exists on table "Bookings"
    SELECT 
        c.oid,
        i.indisunique,
        am.amname,
        i.indnatts,
        i.indnkeyatts,
        a.attname,
        pg_get_expr(i.indpred, i.indrelid),
        pg_get_indexdef(c.oid)
    INTO 
        v_index_oid,
        v_is_unique,
        v_am_name,
        v_indnatts,
        v_indnkeyatts,
        v_col_name,
        v_predicate,
        v_indexdef
    FROM pg_class c
    JOIN pg_index i ON c.oid = i.indexrelid
    JOIN pg_am am ON am.oid = c.relam
    LEFT JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = i.indkey[0]
    WHERE c.relname = 'UX_Bookings_SlotId_Active'
      AND i.indrelid = '"Bookings"'::regclass
      AND c.relnamespace = v_schema_oid;

    IF FOUND THEN
        -- Normalize the predicate by stripping type casts, whitespace, quotes, and outer parentheses
        IF v_predicate IS NOT NULL THEN
            -- Strip type casts (e.g., ::character varying, ::text, ::text[])
            v_normalized_pred := regexp_replace(v_predicate, '::[a-zA-Z0-9_ ]+(\[[0-9]*\])?', '', 'g');
            -- Strip parentheses, double quotes, and whitespace
            v_normalized_pred := regexp_replace(v_normalized_pred, '[\s"()]+', '', 'g');

            -- Verify exact equivalence to Status IN ('Pending', 'Approved')
            v_is_valid_pred := (
                v_normalized_pred IN (
                    'Status=ANYARRAY[''Pending'',''Approved'']',
                    'Status=ANYARRAY[''Approved'',''Pending'']',
                    'Status=''Pending''ORStatus=''Approved''',
                    'Status=''Approved''ORStatus=''Pending'''
                )
            );
        ELSE
            v_is_valid_pred := FALSE;
        END IF;

        -- Verify all 5 requirements:
        -- 1. UNIQUE
        -- 2. Access method is B-tree
        -- 3. Exactly 1 key column (no extra columns)
        -- 4. Key column is "SlotId" (no INCLUDE columns: indnatts = indnkeyatts = 1)
        -- 5. Exact approved partial filter
        IF NOT (
            v_is_unique = TRUE
            AND v_am_name = 'btree'
            AND v_indnkeyatts = 1
            AND v_indnatts = 1
            AND v_col_name = 'SlotId'
            AND v_is_valid_pred = TRUE
        ) THEN
            RAISE EXCEPTION 
                'Index "UX_Bookings_SlotId_Active" exists on table "Bookings" but does not match the approved definition (must be B-tree, UNIQUE on "SlotId" with condition Status IN (''Pending'', ''Approved''), with no INCLUDE columns). Current definition: %',
                v_indexdef;
        END IF;

        -- Matches approved definition: skip without modification
    ELSE
        -- 3. Check for name collision strictly within the same schema
        IF EXISTS (
            SELECT 1
            FROM pg_class c
            WHERE c.relname = 'UX_Bookings_SlotId_Active'
              AND c.relkind = 'i'
              AND c.relnamespace = v_schema_oid
        ) THEN
            RAISE EXCEPTION 
                'An index named "UX_Bookings_SlotId_Active" already exists on another table in schema %.',
                (SELECT nspname FROM pg_namespace WHERE oid = v_schema_oid);
        END IF;

        -- 4. Create the index with the approved definition
        CREATE UNIQUE INDEX "UX_Bookings_SlotId_Active"
        ON "Bookings" ("SlotId")
        WHERE "Status" IN ('Pending', 'Approved');
    END IF;
END;
$$;

COMMIT;
