# Database Architecture Analysis Report
**Exam Management System - Supabase Schema Audit**

**Generated:** April 16, 2026  
**Auditor:** Database Architect Agent  
**Scope:** Complete schema analysis across all migrations and type definitions

---

## Executive Summary

This report provides a comprehensive analysis of the Exam Management System's Supabase database schema, examining table structures, primary/foreign key relationships, domain boundaries, UUID consistency, and architectural patterns.

### Key Findings

| Category | Status | Issues Identified |
|----------|--------|-------------------|
| **Table Inventory** | ✅ Complete | 10 core tables identified |
| **Domain Boundaries** | ⚠️ Partial | Inventory domain NOT implemented |
| **UUID Consistency** | ❌ Mixed | PK/FK inconsistency between UUID and SERIAL |
| **Infinity Status** | ❌ Missing | No inventory status fields found |
| **FK Relationships** | ⚠️ Redundant | Some orphaned fields detected |

---

## 1. Complete Table Inventory

### 1.1 Core Tables Overview

| Table Name | Primary Key | PK Type | Foreign Keys | Domain |
|------------|-------------|---------|--------------|--------|
| `profiles` | `id` | UUID | `auth.users(id)` | Teachers/Students |
| `courses` | `id` | SERIAL (INTEGER) | `teacher_id → profiles(id)` | Courses |
| `course_materials` | `id` | SERIAL (INTEGER) | `course_id → courses(id)` | Courses |
| `exams` | `id` | SERIAL (INTEGER) | `course_id → courses(id)` | Exams |
| `questions` | `id` | SERIAL (INTEGER) | `exam_id → exams(id)` | Exams |
| `submissions` | `id` | UUID | `exam_id → exams(id)`, `student_id → profiles(id)` | Exams |
| `enrollments` | `id` | UUID | `course_id → courses(id)`, `student_id → profiles(id)` | Students |
| `notifications` | `id` | UUID | `sender_id → profiles(id)`, `target_id → profiles(id)` | Teachers/Students |
| `notification_recipients` | `id` | UUID | `notification_id → notifications(id)`, `student_id → profiles(id)` | Teachers/Students |
| `majors` | `id` | SERIAL (INTEGER) | None | Students |
| `academic_levels` | `id` | SERIAL (INTEGER) | None | Students |
| `question_bank` | `id` | UUID | `teacher_id → profiles(id)`, `course_id → courses(id)` | Exams |
| `questions` (legacy) | `id` | UUID | `teacher_id → profiles(id)`, `subject_id → courses(id)` | Exams |

### 1.2 Detailed Table Specifications

#### **profiles** (User Management)
```sql
Primary Key: id (UUID)
Foreign Keys: 
  - REFERENCES auth.users(id) ON DELETE CASCADE

Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - email: TEXT
  - full_name: TEXT
  - role: app_role ENUM ('admin', 'teacher', 'student')
  - student_id: TEXT (nullable)
  - employee_id: TEXT (nullable)
  - major: TEXT (nullable)
  - level: TEXT (nullable)
  - department: TEXT (nullable)
  - specialization: TEXT (nullable)
  - subjects: TEXT (nullable) -- comma-separated or array
  - date_of_birth: DATE (nullable)
  - 2fa_enabled: BOOLEAN DEFAULT false
  - headline: TEXT (nullable)
  - bio: TEXT (nullable)
  - academic_degree: TEXT (nullable)
  - years_of_experience: INTEGER (nullable)
  - years_experience: INTEGER (nullable) -- DUPLICATE FIELD
  - avatar_url: TEXT (nullable)
  - mobile: TEXT (nullable)
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
```

**Issues:**
- ⚠️ **Duplicate fields:** `years_of_experience` vs `years_experience`
- ⚠️ **Inconsistent FK types:** `major_id` (INTEGER) vs `major` (TEXT)
- ⚠️ **Redundant data:** `major`, `level`, `department` stored as TEXT alongside FK columns

---

#### **courses** (Course Management)
```sql
Primary Key: id (SERIAL/INTEGER)
Foreign Keys:
  - teacher_id → profiles(id) -- UUID reference to INTEGER PK

Columns:
  - id: SERIAL PRIMARY KEY
  - code: TEXT UNIQUE
  - title: TEXT NOT NULL
  - description: TEXT (nullable)
  - instructor: TEXT (nullable) -- REDUNDANT with teacher_id
  - teacher_id: UUID (nullable) -- REFERENCES profiles(id)
  - department: TEXT (nullable)
  - credits: INTEGER (nullable)
  - semester: TEXT (nullable)
  - visibility: course_visibility ENUM ('active', 'hidden', 'disabled')
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
```

**Issues:**
- ❌ **PK Type Mismatch:** `courses.id` is INTEGER, but `exams.course_id` and `course_materials.course_id` reference it correctly
- ⚠️ **Redundant field:** `instructor` (TEXT) duplicates `teacher_id` (UUID FK)
- ⚠️ **FK Type Mismatch:** `teacher_id` is UUID referencing `profiles.id` (UUID) - this is correct

---

#### **course_materials** (Course Resources)
```sql
Primary Key: id (SERIAL/INTEGER)
Foreign Keys:
  - course_id → courses(id)

Columns:
  - id: SERIAL PRIMARY KEY
  - course_id: INTEGER NOT NULL
  - title: TEXT NOT NULL
  - type: TEXT NOT NULL
  - url: TEXT (nullable)
  - description: TEXT (nullable)
  - week: INTEGER (nullable)
  - duration: TEXT (nullable)
  - file_size: TEXT (nullable)
  - created_at: TIMESTAMPTZ
```

**Status:** ✅ Well-structured, no issues

---

#### **exams** (Exam Engine)
```sql
Primary Key: id (SERIAL/INTEGER)
Foreign Keys:
  - course_id → courses(id)

Columns:
  - id: SERIAL PRIMARY KEY
  - title: TEXT NOT NULL
  - course_id: INTEGER (nullable)
  - subject: TEXT NOT NULL
  - subject_color: TEXT (nullable)
  - subject_icon: TEXT (nullable)
  - description: TEXT (nullable)
  - instructions: TEXT[] (nullable)
  - topics: TEXT[] (nullable)
  - start_time: TIMESTAMPTZ (nullable)
  - end_time: TIMESTAMPTZ (nullable)
  - duration_minutes: INTEGER NOT NULL
  - total_marks: INTEGER (nullable)
  - total_questions: INTEGER (nullable)
  - passing_score: INTEGER (nullable)
  - status: exam_status ENUM ('upcoming', 'ongoing', 'finished')
  - is_published: BOOLEAN (nullable)
  - is_randomized: BOOLEAN (nullable)
  - allow_review: BOOLEAN
  - show_correct_answers: BOOLEAN
  - target_group: TEXT (nullable)
  - target_student_ids: UUID[] (nullable)
  - tutor_name: TEXT (nullable)
  - created_at: TIMESTAMPTZ
```

**Status:** ✅ Well-structured, supports targeted exams

---

#### **questions** (Exam Questions - Legacy vs New)

**⚠️ CRITICAL: TWO DIFFERENT SCHEMAS DETECTED**

**Schema A (temp_types.ts - Current):**
```sql
Primary Key: id (SERIAL/INTEGER)
Foreign Keys:
  - exam_id → exams(id)

Columns:
  - id: SERIAL PRIMARY KEY
  - exam_id: INTEGER NOT NULL
  - text: TEXT NOT NULL
  - type: question_type ENUM ('mcq', 'true_false', 'essay', 'code')
  - correct_answer: TEXT (nullable)
  - explanation: TEXT (nullable)
  - options: JSONB (nullable)
  - marks: INTEGER (nullable)
  - image_url: TEXT (nullable)
  - created_at: TIMESTAMPTZ
```

**Schema B (question_bank_schema.sql - Legacy):**
```sql
Primary Key: id (UUID)
Foreign Keys:
  - teacher_id → profiles(id)
  - subject_id → courses(id)

Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - teacher_id: UUID NOT NULL
  - subject_id: INTEGER (nullable)
  - content: TEXT NOT NULL
  - type: question_type ENUM ('multiple_choice', 'true_false', 'essay', 'short_answer')
  - difficulty: difficulty_level ENUM ('easy', 'medium', 'hard')
  - options: JSONB (nullable)
  - correct_answer: TEXT (nullable)
  - explanation: TEXT (nullable)
  - tags: TEXT[] DEFAULT '{}'
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
```

**Issues:**
- ❌ **Schema Conflict:** Two different `questions` table definitions exist
- ❌ **PK Type Inconsistency:** One uses SERIAL, one uses UUID
- ❌ **FK Relationship Change:** Legacy has `teacher_id`, current has `exam_id`
- ⚠️ **Enum Mismatch:** `question_type` enums differ between schemas

---

#### **submissions** (Exam Submissions)
```sql
Primary Key: id (UUID)
Foreign Keys:
  - exam_id → exams(id)
  - student_id → profiles(id)

Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - exam_id: INTEGER (nullable)
  - student_id: UUID (nullable)
  - status: TEXT (nullable)
  - started_at: TIMESTAMPTZ (nullable)
  - submitted_at: TIMESTAMPTZ (nullable)
  - score: INTEGER (nullable)
  - answers: JSONB (nullable)
```

**Status:** ✅ UUID PK consistent, good FK relationships

---

#### **enrollments** (Student Course Enrollments)
```sql
Primary Key: id (UUID)
Foreign Keys:
  - course_id → courses(id)
  - student_id → profiles(id)

Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - course_id: INTEGER (nullable)
  - student_id: UUID (nullable)
  - status: enrollment_status ENUM ('enrolled', 'completed', 'dropped')
  - enrolled_at: TIMESTAMPTZ (nullable)
  - grade: INTEGER (nullable)
```

**Status:** ✅ Well-structured, UUID PK consistent

---

#### **notifications** (Notification System)
```sql
Primary Key: id (UUID)
Foreign Keys:
  - sender_id → profiles(id)
  - target_id → profiles(id) (nullable)

Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - sender_id: UUID NOT NULL
  - target_type: VARCHAR(50) CHECK ('individual', 'level', 'major', 'global')
  - target_id: UUID (nullable) -- for 'individual' target
  - level: TEXT (nullable) -- for 'level' target
  - major: TEXT (nullable) -- for 'major' target
  - title: TEXT NOT NULL
  - message: TEXT NOT NULL
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
```

**Status:** ✅ Well-structured, supports targeted notifications

---

#### **notification_recipients** (Notification Read Tracking)
```sql
Primary Key: id (UUID)
Foreign Keys:
  - notification_id → notifications(id)
  - student_id → profiles(id)

Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - notification_id: UUID NOT NULL
  - student_id: UUID NOT NULL
  - is_read: BOOLEAN DEFAULT false
  - read_at: TIMESTAMPTZ (nullable)
  - created_at: TIMESTAMPTZ
  - UNIQUE(notification_id, student_id)
```

**Status:** ✅ Well-structured, good uniqueness constraint

---

#### **majors** (Academic Majors)
```sql
Primary Key: id (SERIAL/INTEGER)

Columns:
  - id: SERIAL PRIMARY KEY
  - name: TEXT NOT NULL UNIQUE
  - code: TEXT UNIQUE
  - description: TEXT (nullable)
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
```

**Status:** ✅ Simple lookup table, no FKs needed

---

#### **academic_levels** (Academic Levels/Years)
```sql
Primary Key: id (SERIAL/INTEGER)

Columns:
  - id: SERIAL PRIMARY KEY
  - name: TEXT NOT NULL UNIQUE
  - code: TEXT UNIQUE
  - display_order: INTEGER DEFAULT 0
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
```

**Status:** ✅ Simple lookup table, no FKs needed

---

#### **question_bank** (Teacher Question Repository)
```sql
Primary Key: id (UUID)
Foreign Keys:
  - teacher_id → profiles(id)
  - course_id → courses(id)

Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - teacher_id: UUID NOT NULL
  - course_id: INTEGER (nullable)
  - content: TEXT NOT NULL
  - type: question_type ENUM ('multiple_choice', 'true_false', 'essay', 'short_answer')
  - difficulty: difficulty_level ENUM ('easy', 'medium', 'hard')
  - options: JSONB (nullable)
  - correct_answer: TEXT (nullable)
  - explanation: TEXT (nullable)
  - tags: TEXT[] DEFAULT '{}'
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
```

**Status:** ✅ UUID PK consistent, good for teacher-owned content

---

## 2. Domain Boundary Analysis (DDD)

### 2.1 Identified Bounded Contexts

| Domain | Tables | Responsibility |
|--------|--------|----------------|
| **Identity & Access** | `profiles`, `auth.users` | User management, authentication, roles |
| **Course Management** | `courses`, `course_materials` | Course catalog, resources, materials |
| **Exam Engine** | `exams`, `questions`, `submissions`, `question_bank` | Exam creation, delivery, grading |
| **Student Services** | `enrollments`, `majors`, `academic_levels` | Student enrollment, academic tracking |
| **Communication** | `notifications`, `notification_recipients` | System-wide and targeted messaging |

### 2.2 Missing Domains

| Domain | Status | Required Tables |
|--------|--------|-----------------|
| **Inventory Management** | ❌ NOT IMPLEMENTED | `products`, `categories`, `stock`, `suppliers`, `orders` |
| **Teacher Dashboard** | ⚠️ PARTIAL | Analytics, reporting tables missing |
| **Performance Tracking** | ⚠️ PARTIAL | Grade books, learning analytics missing |

### 2.3 Domain Interaction Map

```
┌─────────────────────┐
│  Identity & Access  │
│   (profiles)        │
└─────────┬───────────┘
          │
          ├──────────────────────────────────────┐
          │                                      │
          ▼                                      ▼
┌───────────────────┐                  ┌─────────────────────┐
│  Course Management│                  │  Student Services   │
│  (courses,        │                  │  (enrollments,      │
│   materials)      │                  │   majors, levels)   │
└─────────┬─────────┘                  └─────────┬───────────┘
          │                                      │
          │              ┌───────────────────────┘
          │              │
          ▼              ▼
┌───────────────────────────────────────────────────┐
│              Exam Engine                          │
│    (exams, questions, submissions, question_bank) │
└───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Communication     │
│  (notifications)    │
└─────────────────────┘
```

---

## 3. UUID vs SERIAL Primary Key Distribution

### 3.1 PK Type Analysis

| PK Type | Table Count | Tables |
|---------|-------------|--------|
| **UUID** | 7 | `profiles`, `submissions`, `enrollments`, `notifications`, `notification_recipients`, `question_bank`, `question_bank.id` |
| **SERIAL (INTEGER)** | 6 | `courses`, `course_materials`, `exams`, `questions` (legacy), `majors`, `academic_levels` |

### 3.2 UUID Consistency Issues

#### ❌ **CRITICAL: FK Type Mismatches**

| Foreign Key | PK Type Referenced | FK Column Type | Status |
|-------------|-------------------|----------------|--------|
| `courses.teacher_id` → `profiles.id` | UUID | UUID | ✅ Correct |
| `exams.course_id` → `courses.id` | SERIAL | INTEGER | ✅ Correct |
| `course_materials.course_id` → `courses.id` | SERIAL | INTEGER | ✅ Correct |
| `questions.exam_id` → `exams.id` | SERIAL | INTEGER | ✅ Correct |
| `submissions.exam_id` → `exams.id` | SERIAL | INTEGER | ✅ Correct |
| `submissions.student_id` → `profiles.id` | UUID | UUID | ✅ Correct |
| `enrollments.course_id` → `courses.id` | SERIAL | INTEGER | ✅ Correct |
| `enrollments.student_id` → `profiles.id` | UUID | UUID | ✅ Correct |
| `notifications.sender_id` → `profiles.id` | UUID | UUID | ✅ Correct |
| `notifications.target_id` → `profiles.id` | UUID | UUID | ✅ Correct |
| `question_bank.teacher_id` → `profiles.id` | UUID | UUID | ✅ Correct |
| `question_bank.course_id` → `courses.id` | SERIAL | INTEGER | ✅ Correct |

**Summary:** FK relationships are **type-consistent** within each schema version, but the dual schema for `questions` creates ambiguity.

### 3.3 Recommendations

1. **Standardize on UUID for all PKs** to ensure consistency across distributed systems
2. **Migrate SERIAL PKs to UUID** for `courses`, `exams`, `course_materials`, `majors`, `academic_levels`
3. **Update all FK references** to use UUID consistently

---

## 4. Redundant and Orphaned Fields

### 4.1 Identified Redundancies

#### **profiles table**
| Field | Redundant With | Reason |
|-------|---------------|--------|
| `years_of_experience` | `years_experience` | Duplicate field, same purpose |
| `major` (TEXT) | `major_id` (INTEGER FK) | Storing both FK and text representation |
| `level` (TEXT) | `level_id` (INTEGER FK) | Storing both FK and text representation |
| `department` (TEXT) | None | Could be FK to departments table (not exists) |

#### **courses table**
| Field | Redundant With | Reason |
|-------|---------------|--------|
| `instructor` (TEXT) | `teacher_id` (UUID FK) | Storing both name and FK reference |

### 4.2 Orphaned Fields (No FK Constraint)

| Table | Field | Expected FK | Status |
|-------|-------|-------------|--------|
| `profiles` | `major` | `majors.id` | ⚠️ TEXT field, should be INTEGER FK |
| `profiles` | `level` | `academic_levels.id` | ⚠️ TEXT field, should be INTEGER FK |
| `profiles` | `department` | `departments.id` | ❌ No departments table exists |
| `courses` | `department` | `departments.id` | ❌ No departments table exists |

### 4.3 Recommendations

1. **Remove duplicate fields:** Delete `years_experience` (keep `years_of_experience`)
2. **Convert TEXT fields to FKs:** Change `major`, `level` to INTEGER FK columns
3. **Create departments table** or remove orphaned `department` fields
4. **Remove `instructor` TEXT field** from `courses` (use `teacher_id` only)

---

## 5. "Infinity" Inventory Status Implementation

### 5.1 Current Status: ❌ NOT IMPLEMENTED

**Analysis:**
- No inventory-related tables exist in the schema
- No `products`, `categories`, `stock`, or `suppliers` tables
- No inventory status enums or fields found
- The schema is focused on **exam management**, not inventory management

### 5.2 Required Implementation for Inventory Domain

To support "Infinity" stock status and inventory management, the following tables are needed:

```sql
-- Required tables (NOT present in current schema)

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER REFERENCES categories(id),
  uuid UUID UNIQUE DEFAULT gen_random_uuid()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  stock_status TEXT CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'infinity')),
  stock_quantity INTEGER DEFAULT 0,
  is_infinite BOOLEAN DEFAULT false, -- For "Infinity" status
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id INTEGER REFERENCES products(id),
  transaction_type TEXT CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 Infinity Status Pattern

When implementing inventory, use this pattern:

```sql
-- Option 1: Boolean flag + status enum
ALTER TABLE products ADD COLUMN is_infinite BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN stock_status TEXT CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'infinity'));

-- Option 2: Single status enum (recommended)
ALTER TABLE products ADD COLUMN stock_status TEXT CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'infinity'));

-- Query for infinite stock
SELECT * FROM products WHERE stock_status = 'infinity' OR is_infinite = true;
```

---

## 6. Foreign Key Relationship Map

### 6.1 Complete FK Relationship Diagram

```
auth.users (id: UUID)
    │
    ├─ ON DELETE CASCADE
    │
    └─ profiles (id: UUID)
         │
         ├─ ON DELETE CASCADE
         │
         ├─ courses (teacher_id: UUID)
         │    │
         │    ├─ ON DELETE SET NULL
         │    │
         │    ├─ course_materials (course_id: INTEGER)
         │    │
         │    └─ exams (course_id: INTEGER)
         │         │
         │         ├─ ON DELETE CASCADE
         │         │
         │         └─ questions (exam_id: INTEGER)
         │
         ├─ ON DELETE CASCADE
         │
         ├─ submissions (student_id: UUID)
         │
         ├─ ON DELETE CASCADE
         │
         ├─ notifications (sender_id: UUID, target_id: UUID)
         │      │
         │      ├─ ON DELETE CASCADE
         │      │
         │      └─ notification_recipients (notification_id: UUID)
         │
         └─ enrollments (student_id: UUID)
```

### 6.2 FK Relationship Summary

| Source Table | FK Column | References | Delete Action | Cardinality |
|--------------|-----------|------------|---------------|-------------|
| `profiles.id` | (self) | `auth.users.id` | CASCADE | 1:1 |
| `courses.teacher_id` | `teacher_id` | `profiles.id` | (not specified) | N:1 |
| `course_materials.course_id` | `course_id` | `courses.id` | (not specified) | N:1 |
| `exams.course_id` | `course_id` | `courses.id` | SET NULL | N:1 |
| `questions.exam_id` | `exam_id` | `exams.id` | CASCADE | N:1 |
| `submissions.exam_id` | `exam_id` | `exams.id` | (not specified) | N:1 |
| `submissions.student_id` | `student_id` | `profiles.id` | (not specified) | N:1 |
| `enrollments.course_id` | `course_id` | `courses.id` | (not specified) | N:1 |
| `enrollments.student_id` | `student_id` | `profiles.id` | (not specified) | N:1 |
| `notifications.sender_id` | `sender_id` | `profiles.id` | CASCADE | N:1 |
| `notifications.target_id` | `target_id` | `profiles.id` | CASCADE | N:1 (optional) |
| `notification_recipients.notification_id` | `notification_id` | `notifications.id` | CASCADE | N:1 |
| `notification_recipients.student_id` | `student_id` | `profiles.id` | CASCADE | N:1 |
| `question_bank.teacher_id` | `teacher_id` | `profiles.id` | CASCADE | N:1 |
| `question_bank.course_id` | `course_id` | `courses.id` | SET NULL | N:1 |

### 6.3 Missing FK Constraints

| Table | Expected FK | Status |
|-------|-------------|--------|
| `majors` | None | ✅ Lookup table |
| `academic_levels` | None | ✅ Lookup table |
| `profiles.major` | `majors.id` | ❌ TEXT field, should be INTEGER FK |
| `profiles.level` | `academic_levels.id` | ❌ TEXT field, should be INTEGER FK |

---

## 7. Critical Issues & Recommendations

### 7.1 Priority 1: Schema Conflicts

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| **Dual `questions` schema** | High | Consolidate to single schema (prefer UUID PK version) |
| **PK type inconsistency** | Medium | Migrate all PKs to UUID for consistency |
| **Duplicate fields in profiles** | Medium | Remove `years_experience`, keep `years_of_experience` |

### 7.2 Priority 2: Data Integrity

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| **TEXT fields instead of FKs** | Medium | Convert `major`, `level` to INTEGER FK columns |
| **Missing departments table** | Low | Create `departments` table or remove orphaned fields |
| **Redundant `instructor` field** | Low | Remove `courses.instructor`, use `teacher_id` only |

### 7.3 Priority 3: Missing Domains

| Domain | Status | Recommendation |
|--------|--------|----------------|
| **Inventory Management** | ❌ Not implemented | Create `products`, `categories`, `stock` tables |
| **Teacher Analytics** | ⚠️ Partial | Add analytics/aggregation tables |
| **Performance Tracking** | ⚠️ Partial | Add grade book, learning outcomes tables |

---

## 8. Architecture Decision Records (ADR)

### ADR-001: Primary Key Strategy
**Status:** ⚠️ Inconsistent  
**Decision:** Mixed UUID/SERIAL PKs  
**Recommendation:** Standardize on UUID for all tables

### ADR-002: Question Schema
**Status:** ❌ Conflict  
**Decision:** Two different `questions` table definitions exist  
**Recommendation:** Consolidate to single schema with UUID PK

### ADR-003: Domain Boundaries
**Status:** ⚠️ Partial  
**Decision:** Exam-focused architecture, inventory domain missing  
**Recommendation:** Implement inventory domain if required by business

---

## 9. Next Steps

1. **Immediate:** Resolve `questions` schema conflict
2. **Short-term:** Standardize PK types to UUID
3. **Medium-term:** Fix redundant fields and orphaned columns
4. **Long-term:** Implement missing domains (Inventory, Analytics)

---

## 10. Appendix: Schema Files Referenced

| File | Purpose | Tables Defined |
|------|---------|----------------|
| `20240101_initial_schema.sql` | Initial schema | `profiles` |
| `20251219_add_profile_fields.sql` | Profile extensions | `profiles` (additional columns) |
| `20260324174600_add_2fa_enabled_to_profiles.sql` | 2FA support | `profiles.2fa_enabled` |
| `20260324220000_add_date_of_birth_to_profiles.sql` | DOB field | `profiles.date_of_birth` |
| `20260325015840_add_instructor_fields_to_profiles.sql` | Instructor fields | `profiles` (headline, bio, etc.) |
| `20260325041000_add_instructor_profile_fields.sql` | Instructor extensions | `profiles` (academic_degree, years_of_experience) |
| `20260416_admin_management_schema_update.sql` | Admin schema | `majors`, `academic_levels` |
| `20260416_create_majors_and_levels.sql` | Academic structure | `majors`, `academic_levels` |
| `question_bank_schema.sql` | Legacy questions | `questions` (UUID PK version) |
| `question_bank_schema_v2.sql` | Question bank | `question_bank` |
| `notifications_schema.sql` | Notifications | `notifications`, `notification_recipients` |
| `temp_types.ts` | Type definitions | Complete schema snapshot |

---

**Report End**

*This analysis was generated automatically by the Database Architect agent based on schema files and type definitions found in the workspace.*
