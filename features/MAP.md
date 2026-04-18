# Feature Documentation Map

| Feature Domain | Directory | Documentation Status |
|---|---|---|
| **Course Details** | `features/course-details/` | ✅ Complete |
| **Dashboard** | `features/dashboard/` | ✅ Complete |
| **Exam Engine** | `features/exam-engine/` | ✅ Complete |
| **Exam Result** | `features/exam-result/` | ✅ Complete |
| **Exam Timer Safety** | `features/exam-timer-safety/` | ✅ Complete |
| **My Courses** | `features/my-courses/` | ✅ Complete |
| **My Results** | `features/my-results/` | ✅ Complete |
| **Profile** | `features/profile/` | ✅ Complete |
| **Profile Avatar** | `features/profile-avatar/` | ✅ Complete |
| **Security 2FA** | `features/security-2fa/` | ✅ Complete |
| **Student Courses** | `features/student-courses/` | ✅ Complete |
| **Student Exam Details**| `features/student-exam-details/` | ✅ Complete |
| **Student Exams** | `features/student-exams/` | ✅ Complete |
| **Student Profile** | `features/student-profile/` | ✅ Complete |
| **Student Results** | `features/student-results/` | ✅ Complete |
| **Student Schedule** | `features/student-schedule/` | ✅ Complete |

## ⚠️ Pending FSD Implementation (Orphaned Code)
The following domains exist in the codebase but await strict Feature-Sliced Design refactoring and documentation blueprints:
- `auth`: Missing blueprint for Login/Register flows.
- `exam-creator`: Exists in code (`src/features/`), missing documentation blueprint in `features/`.
- `exam-review`: Missing blueprint for Exam Review UI.
- `manage-exams`: Exists in code (`src/features/`), missing documentation blueprint in `features/`.

---
## Blueprint Contents Reference

### dashboard/
- `logic.md` — API calls, countdown logic
- `capabilities.md` — Data metrics definition
- `interface.md` — StudentDashboard.tsx layout, SVGs, charts

### exam-engine/, exam-result/, exam-timer-safety/
- All components regarding live taking and score reporting.

*(Note: See individual folders for their specific `capabilities.md`, `interface.md`, and `logic.md` files.)*
