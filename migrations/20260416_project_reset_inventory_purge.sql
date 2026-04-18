-- ============================================================
-- PROJECT RESET: INVENTORY PURGE SCRIPT
-- Project: Exam Management System (Graduation Project)
-- Date: 2026-04-16
-- Purpose: Remove ALL inventory/perfume/incense related data
-- Author: The Architect
-- ============================================================

-- ============================================================
-- PART 1: DROP TABLES (in correct order for FK constraints)
-- ============================================================

-- Drop inventory tables first (they have FKs to other tables)
DROP TABLE IF EXISTS inventory_stock_transactions CASCADE;
DROP TABLE IF EXISTS inventory_products CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;

-- Drop admin tables
DROP TABLE IF EXISTS teacher_performance_metrics CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS admin_audit_logs CASCADE;

-- ============================================================
-- PART 2: DROP ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS stock_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS admin_role CASCADE;
DROP TYPE IF EXISTS performance_tier CASCADE;
DROP TYPE IF EXISTS audit_severity CASCADE;
DROP TYPE IF EXISTS setting_category CASCADE;

-- ============================================================
-- PART 3: DROP FUNCTIONS & TRIGGERS
-- ============================================================

-- Drop validation functions
DROP FUNCTION IF EXISTS validate_infinity_stock() CASCADE;
DROP FUNCTION IF EXISTS update_inventory_product_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_system_settings_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_inventory_categories_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_teacher_performance_metrics_updated_at() CASCADE;

-- ============================================================
-- PART 4: DROP INDEXES (if any remain)
-- ============================================================

-- These will be dropped automatically with tables, but explicit cleanup:
DROP INDEX IF EXISTS idx_inventory_stock_transactions_product_id;
DROP INDEX IF EXISTS idx_inventory_stock_transactions_transaction_type;
DROP INDEX IF EXISTS idx_inventory_stock_transactions_performed_by;
DROP INDEX IF EXISTS idx_inventory_stock_transactions_created_at;
DROP INDEX IF EXISTS idx_inventory_products_category_id;
DROP INDEX IF EXISTS idx_inventory_products_sku;
DROP INDEX IF EXISTS idx_inventory_products_stock_status;
DROP INDEX IF EXISTS idx_inventory_products_is_active;
DROP INDEX IF EXISTS idx_inventory_categories_parent_id;
DROP INDEX IF EXISTS idx_inventory_categories_code;
DROP INDEX IF EXISTS idx_inventory_categories_display_order;
DROP INDEX IF EXISTS idx_teacher_performance_metrics_teacher_id;
DROP INDEX IF EXISTS idx_teacher_performance_metrics_metric_date;
DROP INDEX IF EXISTS idx_teacher_performance_metrics_performance_tier;
DROP INDEX IF EXISTS idx_system_settings_key;
DROP INDEX IF EXISTS idx_system_settings_category;
DROP INDEX IF EXISTS idx_admin_audit_logs_admin_id;
DROP INDEX IF EXISTS idx_admin_audit_logs_entity_type_entity_id;
DROP INDEX IF EXISTS idx_admin_audit_logs_created_at;
DROP INDEX IF EXISTS idx_admin_audit_logs_compliance_flag;

-- ============================================================
-- PART 5: VERIFY PURGE
-- ============================================================

-- Verify tables are dropped
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'inventory_categories',
        'inventory_products',
        'inventory_stock_transactions',
        'admin_audit_logs',
        'system_settings',
        'teacher_performance_metrics'
    )
ORDER BY table_name;

-- Should return 0 rows if purge successful

-- Verify enum types are dropped
SELECT 
    type_name
FROM information_schema.types
WHERE type_schema = 'public'
    AND type_name IN (
        'stock_status',
        'transaction_type',
        'admin_role',
        'performance_tier',
        'audit_severity',
        'setting_category'
    )
ORDER BY type_name;

-- Should return 0 rows if purge successful

-- ============================================================
-- PART 6: CLEANUP NOTES
-- ============================================================

-- After running this script, you should:
-- 1. Delete the following files from your project:
--    - ADMIN_DASHBOARD_ARCHITECTURE_DESIGN.md
--    - ADMIN_DASHBOARD_EXECUTIVE_SUMMARY.md
--    - ADMIN_DASHBOARD_RECONSTRUCTION_BLUEPRINT.md
--    - PHASE_2_ARCHITECTURE_SUMMARY.md
--    - PHASE_2_API_FRONTEND_ARCHITECTURE.md
--    - PHASE_2_EXECUTION_GUIDE.md
--    - PHASE_2_SEED_DATA_EXECUTION_CONFIRMATION.md
--    - database-architecture-analysis.md
--    - migrations/20260416_admin_dashboard_phase2_seed_data.sql
--    - .agent/skills/inventory-demand-planning/ (entire folder)
--    - .windsurf/skills/inventory-demand-planning/ (entire folder)
--
-- 2. Remove any inventory-related code from existing files
-- 3. Rebuild the Admin Dashboard for EXAM MANAGEMENT only
--
-- ============================================================

-- PURGE COMPLETE
-- ============================================================
