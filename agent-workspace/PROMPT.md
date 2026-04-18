# 🚀 EXAM MANAGEMENT SYSTEM - STARTUP PROMPT

## ⚠️ READ THIS FIRST

Welcome! This is your starting point for the **Exam Management System**. Follow the steps below to understand the project and get ready to work.

---

## 📋 STEP 1: READ THESE FILES (In Order)

1. **`handoff-context.md`** - Current project state overview
2. **`project-rules.md`** - All rules, protocols, and guidelines  
3. **`agent-workspace/sessions/`** - Recent work history (check the latest date folder)

---

## 🏗️ PROJECT OVERVIEW

**Tech Stack:**
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Supabase (PostgreSQL)
- **Architecture:** Feature-Sliced Design (FSD)

**Key Features:**
- Teacher: Create/manage exams, view submissions, manage courses
- Student: Take exams, view results, access materials
- Admin: User management, system settings

**Project Ref:** `rbhvueszkkbavtzwqylg`
**Supabase URL:** `https://rbhvueszkkbavtzwqylg.supabase.co`

---

## 📁 KEY FILE LOCATIONS

| Feature | Location |
|---------|----------|
| Exam Creation | `src/features/exam-creator/` |
| Exam Engine (Student) | `src/pages/student/ExamEngine/` |
| Exam Service | `src/services/examService.ts` |
| Course Service | `src/services/courseService.ts` |
| Teacher Manage Exams | `src/pages/teacher/ManageExams/` |
| Course Management | `src/features/teacher-courses/` |
| Auth | `src/features/auth/` |
| Database Bridge | `db-execute.cjs` (root) |

---

## ⚙️ QUICK SETUP

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run lint check
npm run lint

# TypeScript check
npx tsc --noEmit
```

---

## 🗄️ DATABASE ACCESS

### Method: db-execute.cjs

```bash
node db-execute.cjs "YOUR_SQL_QUERY"
```

**Examples:**
```bash
# Check table structure
node db-execute.cjs "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exams';"

# Check existing data
node db-execute.cjs "SELECT * FROM submissions LIMIT 10;"

# Check RLS policies
node db-execute.cjs "SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'submissions';"

# Create RLS policy
node db-execute.cjs "CREATE POLICY \"policy_name\" ON table_name FOR SELECT USING (condition);"
```

**Common Tasks:**
| Task | Query |
|------|-------|
| Check columns | `SELECT column_name FROM information_schema.columns WHERE table_name = 'table_name';` |
| Check RLS | `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'table_name';` |
| Check data | `SELECT * FROM table_name LIMIT 10;` |

---

## 📜 PROJECT RULES

1. **FSD Architecture:** All business logic in `src/features/[feature-name]/`
2. **Pages are thin:** No heavy logic in `src/pages/`
3. **Zero warnings:** Run `npm run lint` before finishing any task
4. **No @ts-ignore:** Fix types properly
5. **Check skills_index.json:** Read relevant skills before coding
6. **Iterative development:** Don't build everything at once
7. **Wait for approval:** Between major phases

---

## 📊 COMMON WORKFLOWS

### Adding a New Feature:
1. Read skills from `skills_index.json`
2. Create folder: `src/features/[feature-name]/`
3. Follow FSD structure: `api/`, `hooks/`, `components/`, `types/`
4. Update `src/pages/` to compose the feature
5. Run `npm run lint`

### Database Changes:
1. Write SQL query
2. Execute: `node db-execute.cjs "SQL"`
3. Verify output
4. If error, fix and retry
5. Log change in session summary

### Fixing a Bug:
1. Check browser console for errors
2. Identify affected files
3. Check database for data issues
4. Make minimal fix
5. Test thoroughly
6. Update session log

---

## 🎯 WORK SESSION LOGGING

After completing work, ALWAYS create a session log:

**Location:** `agent-workspace/sessions/YYYY-MM-DD/summary.md`

**Format:**
```markdown
# Session: YYYY-MM-DD - [Brief Topic]

## Date & Time
- Date: YYYY-MM-DD
- Duration: X hours

## Goals
- [ ] Planned task 1
- [ ] Planned task 2

## Actions Taken
### 1. [Feature/Change Name]
- **Files Modified:** `path/to/file.ts`, `path/to/file2.tsx`
- **Changes:** What was implemented or fixed

### 2. [Another Change]
- **Files:** `path/to/file.ts`
- **Changes:** Details

## Database Changes
- **Table:** `table_name` (if any)
- **SQL:** `CREATE/DROP/ALTER...`

## Errors Encountered & Resolved
- **Error:** Description
- **Solution:** How it was fixed

## Results
- ✅ What was accomplished
- ⚠️ Any warnings or issues

## Next Steps
- [ ] Pending task 1
- [ ] Pending task 2

## Recommendations
- Any suggestions for next agent
```

---

## ❓ NEED HELP?

1. Check `agent-workspace/sessions/` for past solutions
2. Read `project-rules.md` for protocols
3. Check `handoff-context.md` for project state
4. Review similar features in `src/features/`

---

## ✅ BEFORE FINISHING ANY TASK

- [ ] Run `npm run lint` (must pass)
- [ ] Run `npx tsc --noEmit` (no errors)
- [ ] Test the feature manually
- [ ] Log changes in session summary
- [ ] Report status to user
