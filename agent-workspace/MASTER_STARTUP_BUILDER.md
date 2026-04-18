# 🚀 MASTER STARTUP PROTOCOL - THE BUILDER

**Role:** Technical Implementer  
**Mission:** Execute the Architect's plan with strict adherence to standards

---

## ⚠️ MANDATORY CONTEXT INGESTION

Before writing ANY code, you MUST read these files:

1. **`handoff-context.md`** - Current project state, build status, recent fixes
2. **`project-rules.md`** - FSD architecture, database protocols, session logging rules
3. **`agent-workspace/sessions/`** - Recent work history (latest date folder)
4. **Architect's Execution Prompt** - The plan you must follow

```
Required files:
- handoff-context.md (project root)
- project-rules.md (project root)
- agent-workspace/sessions/YYYY-MM-DD/summary.md (latest session)
- MASTER_STARTUP_ARCHITECT.md (this folder)
```

---

## 🎯 YOUR CORE RESPONSIBILITIES

### 1. Follow the Execution Prompt
- Implement exactly what the Architect specified
- Do NOT deviate from the plan without approval
- Ask clarifying questions if plan is unclear

### 2. FSD Compliance (STRICT)
All business logic MUST be in `src/features/[feature-name]/`:

```
src/features/[feature-name]/
├── api/           # API calls, service functions
├── hooks/         # Custom React hooks
├── components/    # Feature-specific components
├── types/         # TypeScript interfaces
└── index.ts       # Public exports
```

**Pages stay thin:**
- Pages in `src/pages/` should only compose features
- No heavy business logic in pages

### 3. Database Operations
Use `db-execute.cjs` for ALL database changes:

```bash
# Execute SQL
node db-execute.cjs "YOUR_SQL_HERE"

# Common operations:
# - CREATE TABLE / ALTER TABLE
# - CREATE POLICY (RLS)
# - CREATE FUNCTION (RPC)
# - INSERT / UPDATE / SELECT (for verification)
```

---

## 🎨 UI/UX STANDARDS

### Tailwind CSS + SaaS Mode
- Use Tailwind classes for styling
- Custom CSS in `*.module.css` files for complex styles
- Match existing component patterns in the codebase

### Responsive Breakpoints (from project history)
```css
/* Mobile: < 640px */
/* Tablet: 640px - 1023px */
/* Desktop: >= 1024px */
```

### Component Patterns to Match
- Dropdowns: `rgba(255, 255, 255, 0.05)` background, `12px` border-radius
- Cards: `16px` border-radius, subtle shadows
- Buttons: Consistent padding `0.875rem 1.75rem`
- Forms: Full-width inputs with consistent styling

---

## 🔴 ZERO-WARNING POLICY

### Before Finishing ANY Task
You MUST verify:

```bash
# ESLint - must pass with 0 errors, 0 warnings
npm run lint

# TypeScript - must pass with 0 errors
npx tsc --noEmit

# If either fails: FIX the code, do not ignore warnings
```

### Code Quality Rules
- NO `@ts-ignore` or `@ts-expect-error`
- NO `any` types - fix types properly
- NO unused imports or variables
- All React hooks dependencies must be complete

---

## 📝 SESSION LOGGING (MANDATORY)

After completing ANY task, you MUST log to:
`agent-workspace/sessions/YYYY-MM-DD/summary.md`

### Log Format:

```markdown
### [Timestamp] [Feature/Change Name]
**Files Modified:**
- `src/path/to/file.ts`
- `src/path/to/another.tsx`

**Changes:**
- What was implemented or fixed
- Implementation details

**Database Changes:**
- Table: `table_name`
- SQL: `CREATE/DROP/ALTER...`

**Errors Fixed:**
- Error: Description
- Solution: How it was fixed
```

### When to Log:
- After completing bug fixes
- After adding new features
- After making database changes
- After running terminal commands that modify the project
- Before ending session

---

## 🛠️ IMPLEMENTATION WORKFLOW

### Step 1: Setup
1. Read required context files
2. Review Architect's Execution Prompt
3. Create/update session log

### Step 2: Implementation
1. Make code changes as specified
2. Create new feature folder if needed (FSD compliant)
3. Run database changes if specified
4. Test locally

### Step 3: Verification
1. Run `npm run lint` → Fix all issues
2. Run `npx tsc --noEmit` → Fix all errors
3. Test functionality manually

### Step 4: Handoff
1. Log all changes to session summary
2. Report completion status to user
3. List any pending items

---

## ⚠️ COMMON PITFALLS TO AVOID

| Pitfall | Prevention |
|---------|------------|
| Placing logic in pages | Always use `src/features/` |
| Ignoring lint warnings | Run lint before finishing |
| Missing session log | Log every significant change |
| Using `@ts-ignore` | Fix types properly |
| Hardcoding credentials | Use environment variables |
| Skipping database verification | Always verify DB changes |

---

## 📋 BUILDER CHECKLIST

Before reporting completion:
- [ ] Read handoff-context.md
- [ ] Read project-rules.md
- [ ] Read latest session summary
- [ ] Followed Architect's Execution Prompt exactly
- [ ] All code in correct FSD location
- [ ] Ran `npm run lint` - 0 errors, 0 warnings
- [ ] Ran `npx tsc --noEmit` - 0 errors
- [ ] Tested functionality manually
- [ ] Logged all changes to session summary
- [ ] Reported status to user

---

## 🚨 EMERGENCY PROTOCOL

If you encounter:
- **Build failures:** Do not push, fix locally first
- **Database errors:** Verify SQL syntax, check table exists
- **RLS policy issues:** Use db-execute.cjs to check policies
- **Lost context:** Re-read all required files

---

## 📂 KEY FILE LOCATIONS REFERENCE

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

**Database:** Supabase `https://rbhvueszkkbavtzwqylg.supabase.co`

---
