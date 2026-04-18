# Exam Management System - Master Project Rules (.cursorrules)

# 🧠 Smart Autonomous Skill Retrieval (Using Index)
Before executing ANY task, planning architecture, or writing code, you MUST autonomously follow this protocol:
1. **Consult the Index:** Silently read the `.agent\skills_index.json` file located in the workspace.
2. **Find Relevant Skills:** Search the JSON data to identify the top 2-3 most critical skill files (e.g., React, architecture, security) that match the user's current task.
3. **Targeted Reading:** Extract the exact file paths from the JSON and read ONLY those specific `.md` files. Do NOT blindly search or read the entire skills directory.
4. **Apply Strict Rules:** Apply the guidelines from those specific skill files strictly to your generated solution.

---

## Technical Stack & Principles
- **Core Stack:** React, TypeScript, Tailwind CSS, Supabase.
- **Architecture Standard (Strict):** **Feature-Sliced Design (FSD)**
  - All domain-specific logic, components, services, and hooks **MUST** be strictly encapsulated within `src/features/[feature-name]/`.
  - The `src/pages/` directory must be kept thin. Pages are strictly for routing and composing features together. No heavy business logic should reside in pages.

---

## The 'Zero-Issue' Protocol
- You must always aim for **0-warnings** and **0-errors** in the codebase.
- **NO `@ts-ignore`**, `@ts-expect-error`, or `any` types allowed. Address type safety properly.
- After code generation or modification, you **MUST** verify the state via terminal commands (e.g., `npm run lint` or `npx tsc --noEmit`) to prove the codebase remains 100% clean.

---

## Iterative Development & Safe Execution
- Do not build giant monolithic features at once. Break problems down.
- You must pause and wait for explicit user approval between major phases of implementation.
- Observe the codebase auditing principles from `@codebase-audit-pre-push` before concluding any major session, ensuring no dead code or misaligned components have slipped through.

---

## 🗄️ Database Access Protocol

### Priority Order
1. **Supabase MCP Server (if available):** Use MCP tools for direct database access.
2. **Database Bridge Script (fallback):** Use `db-execute.cjs` script via terminal.

---

### Method 1: Supabase MCP Server (Preferred)
If MCP tools are available, use them to execute SQL directly.

---

### Method 2: Database Bridge Script (db-execute.cjs)
When MCP is unavailable, use the `db-execute.cjs` script in the project root.

**Credentials (from project .env):**
```
Project Ref: rbhvueszkkbavtzwqylg
Access Token: sbp_6931716ec1d77a9a307fff64d3cad9b4a6f6c452
```

**Usage:**
```bash
# Single query
node db-execute.cjs "SELECT * FROM submissions LIMIT 5;"

# Complex SQL (use quotes around the entire query)
node db-execute.cjs "CREATE POLICY \"New Policy\" ON submissions FOR SELECT USING (true);"

# Multi-line query
node db-execute.cjs "SELECT id, title FROM exams WHERE id = 24;"
```

**Important Notes:**
- The script uses CommonJS (`.cjs` extension)
- Script is already in `.gitignore` - DO NOT commit it
- All queries run in English

**Common Database Tasks:**

| Task | Command |
|------|---------|
| Check table schema | `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exams';` |
| Check RLS policies | `SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'submissions';` |
| Create RLS policy | `CREATE POLICY "policy_name" ON table_name FOR SELECT USING (condition);` |
| Drop RLS policy | `DROP POLICY IF EXISTS "policy_name" ON table_name;` |
| Check data | `SELECT * FROM table_name LIMIT 10;` |

---

### When to Use Database Access
Use direct database access for:
- **Schema Changes:** Creating tables, adding columns, modifying constraints
- **RLS Policies:** Creating/modifying Row Level Security policies
- **RPC Functions:** Creating stored procedures
- **Troubleshooting:** Verifying data exists, checking constraints
- **Debugging:** Inspecting actual database state when frontend queries fail

### Workflow for Database Changes
1. Write the SQL code
2. Execute via `node db-execute.cjs "YOUR_SQL"`
3. Verify output (success/error)
4. If error, fix SQL and retry
5. Report result to user

---

## 📝 Session Logging & Handoff Protocol

### ⚠️ MANDATORY: Log ALL Work Automatically

**This is NOT optional.** Every significant change MUST be logged to the session folder.

**When to Log:**
- After completing ANY task (bug fix, feature, refactor)
- After making database changes
- After running terminal commands that modify the project
- When the session ends (user closes conversation or you finish work)
- Before switching to a new major task

### Agent Workspace Location
```
agent-workspace/
├── README.md              # Workspace guide & format
├── PROMPT.md              # New agent prompt template
└── sessions/             # Session logs (newest first)
    └── YYYY-MM-DD/       # Date folder - ALWAYS USE TODAY'S DATE
        └── summary.md     # Session summary - APPEND TO THIS FILE
```

### Session Logging Workflow

#### Step 1: Start of Session
1. Read `agent-workspace/sessions/` to find if today's date folder exists
2. If it exists → Open the `summary.md` file and ADD to it
3. If not exists → Create `agent-workspace/sessions/YYYY-MM-DD/summary.md`

#### Step 2: During Session
After each significant change, ADD a new entry to the summary.md:

```markdown
### [Timestamp] Feature/Change Title
**Files Modified:**
- `src/path/to/file.ts`
- `src/path/to/another.tsx`

**Changes:**
- What was implemented or fixed

**Database Changes:**
- SQL executed (if any)
- `CREATE POLICY...`

**Errors Fixed:**
- Error description → Solution
```

#### Step 3: End of Session
1. Ensure all work is logged in today's summary.md
2. Verify the log is complete and readable
3. Include a "Next Steps" section with pending tasks

### Session Log Format (Complete)

```markdown
# Session: YYYY-MM-DD - [Brief Topic]

## Date & Time
- Date: YYYY-MM-DD
- Duration: X hours

## Goals
- [x] Completed task 1
- [ ] Pending task 2

## Actions Taken

### 1. Feature/Change Name
**Timestamp:** HH:MM

**Files Modified:**
- `src/path/to/file.ts`
- `src/path/to/another.tsx`

**Changes:**
- What was implemented or fixed
- Important implementation details

**Database Changes:**
- Table affected: `table_name`
- SQL: `CREATE POLICY...` or `ALTER TABLE...`

**Errors Encountered:**
- Error: Description of the error
- Solution: How it was fixed

### 2. Another Change
...

## Results
- ✅ What was accomplished
- ⚠️ Any warnings or issues

## Next Steps
- [ ] Pending task 1
- [ ] Pending task 2

## Commands Used
```bash
npm run lint
npx tsc --noEmit
node db-execute.cjs "SQL..."
```
```

### Quick Reference: Logging Common Tasks

| Task Type | What to Log |
|-----------|-------------|
| Bug Fix | Error description, root cause, solution, files changed |
| New Feature | Feature name, files created, FSD location, dependencies added |
| Database Change | SQL executed, tables affected, RLS policies modified |
| UI Change | Files modified, styling approach, component structure |
| API Change | Endpoint changes, request/response format |
| Package Install | Package name, version, purpose |

### Important Rules

1. **Append Don't Replace:** Always ADD to existing session files, never overwrite
2. **Be Descriptive:** "Fixed login bug" → "Fixed login redirect loop when session expires"
3. **Include Paths:** Always include file paths for code changes
4. **Log SQL:** Always log database changes with the actual SQL
5. **Timestamp:** Add time when each significant change was made
6. **One Entry Per Change:** Create a new subsection for each distinct change

### Ending Checklist
- [ ] All completed work is logged
- [ ] All errors and solutions documented
- [ ] Pending tasks are listed
- [ ] Next agent could understand current state from the log
- [ ] Database changes are logged with SQL
- [ ] Commands used are documented

