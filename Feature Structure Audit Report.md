# Feature Structure Audit Report

**Audit Date:** 2026-03-25
**Scope:** Strict Feature-Sliced Design (FSD) and standard Documentation Blueprint validation.

---

## ✅ Standard Adherence
The following blueprint folders perfectly adhere to the 3-file documentation standard (`capabilities.md`, `interface.md`, `logic.md`):
- `features/course-details` (Reference)
- `features/exam-engine`
- `features/exam-result`
- `features/my-results`
- `features/profile`
- `features/student-courses`
- `features/student-exam-details`
- `features/student-exams`
- `features/student-profile`
- `features/student-results`
- `features/student-schedule`

---

## ⚠️ Documentation Gaps
The following blueprint folders in `features/` are missing required markdown files:
- **`features/dashboard`**: Missing `interface.md`
- **`features/exam-timer-safety`**: Missing `capabilities.md`, `interface.md`
- **`features/my-courses`**: Missing `interface.md`
- **`features/profile-avatar`**: Missing `capabilities.md`, `interface.md`
- **`features/security-2fa`**: Missing `capabilities.md`, `interface.md`

---

## 🚨 Orphaned Code/Refactoring Requirements
The following domain-specific logic and components are currently sitting outside of `src/features/` and should be refactored into their respective feature folders to satisfy FSD strictness:

1. **Exam Engine UI:** `src/pages/student/ExamEngine/` (Hooks and components like `TrueFalseQuestion`, `ExamHeader`, `useExamEngine.ts` belong in `src/features/exam-engine/`).
2. **Exam Result UI:** `src/pages/student/ExamResult/` (Should move to `src/features/exam-result/`).
3. **Exam Review UI:** `src/pages/student/ExamReview/` (Should move to a feature folder like `src/features/exam-review/`).
4. **Profile Tabs:** `src/pages/student/ProfileTabs/` and `src/pages/teacher/TeacherProfile/` (Components exist in `pages/` but belong in `src/features/profile/` or their respective domain).
5. **Manage Exams:** `src/pages/teacher/ManageExams/` (There is already a `src/features/manage-exams` directory; these UI components and modals belong there, not in pages).
6. **Authentication/Register Flow:** `src/components/register/`, `Login.tsx`, API hooks. Missing a dedicated FSD `auth` domain.
7. **Services Layer:** `src/services/courseService.ts`, `examService.ts`, `instructorService.ts` are grouped purely by technical role. Strict FSD mandates these API layers sit inside `src/features/[feature]/api/`.

---

## 💡 Missing Map Entries & Blueprint Discrepancies
**Root MAP.md Synchronization Check:**
The current `features/MAP.md` completely fails to reflect the reality of the project structure.
1. **Missing Existing Blueprint Entries:** `MAP.md` only details 3 features (`course-details`, `exam-result`, `profile`). It entirely omits the other 13 blueprint directories physically present in `features/` (e.g., `dashboard`, `exam-engine`, `student-courses`).
2. **Missing Architectural Features:** The active codebase contains actual feature folders (`src/features/exam-creator` and `src/features/manage-exams`), but there are **NO** corresponding documentation blueprints for them in the root `features/` folder.
3. **Missing Auth/User Session Domain:** Given the complex login, registration, and component structure, a new `auth` feature blueprint must be created and added to the map.
4. **Missing Exam Review Domain:** An `exam-review` domain is missing from the blueprints to map to the orphaned `src/pages/student/ExamReview/` code.
5. **Missing Question Bank Domain:** A `question-bank` feature blueprint is missing to map to `src/features/question-bank/` and `src/pages/teacher/QuestionBank/` components.
