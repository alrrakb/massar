# 📁 Agent Workspace

This folder contains all documentation and logs for seamless agent collaboration.

## 🚀 Quick Start for New Agents

**Start here:** [`PROMPT.md`](./PROMPT.md)

This file is your template for any new task or conversation. It includes:
- Project overview and tech stack
- Key file locations
- Database access instructions
- Common development workflows
- Session logging format

---

## 📂 Folder Structure

```
agent-workspace/
├── PROMPT.md                         ← User template for new chats
├── README.md                         ← This file
├── MASTER_STARTUP_ARCHITECT.md        ← Architect startup protocol
├── MASTER_STARTUP_BUILDER.md         ← Builder startup protocol
└── sessions/                         ← Work history (newest first)
    └── YYYY-MM-DD/
        └── summary.md
```

## 🎭 Role-Based Startup Prompts

### For Strategic Planning (The Architect)
Use **`MASTER_STARTUP_ARCHITECT.md`** when you need:
- Analysis and planning
- FSD compliance verification
- Database schema planning
- Execution prompt generation for builders

### For Implementation (The Builder)
Use **`MASTER_STARTUP_BUILDER.md`** when you need:
- Technical implementation
- Following the architect's plan
- Running lint/type checks
- Session logging

---

## 📝 Session Logs

Sessions are organized by date (newest first):

| Date | Status |
|------|--------|
| Check `sessions/` folder | Recent work history |

---

## 🔄 For New Conversations

To start a new conversation with a fresh agent:

1. Copy the content of [`PROMPT.md`](./PROMPT.md)
2. Paste it at the start of your message
3. Describe the task you need

The agent will:
- Read the project context
- Follow the development rules
- Log their work in `sessions/`
- Report results when done

---

## 📋 What's In Each Session Log

Each session includes:
- **Goals:** What was planned
- **Actions:** Code changes, files, SQL executed
- **Errors:** Problems encountered and solutions
- **Results:** Accomplishments and issues
- **Next Steps:** Pending work

---

## 🆕 Creating a New Session

1. Create folder: `sessions/YYYY-MM-DD/`
2. Copy format from [`PROMPT.md`](./PROMPT.md) → "Work Session Logging" section
3. Fill in your work details
4. Update this README with the new session

---

## 📌 Session Log Format (Quick Copy)

```markdown
# Session: YYYY-MM-DD - Topic

## Goals
- [ ] Task 1
- [ ] Task 2

## Actions Taken
### 1. Change Name
- Files: `path/to/file.ts`
- Changes: What was done

## Database Changes
- SQL: (if any)

## Errors & Solutions
- Error: ...
- Solution: ...

## Next Steps
- [ ] Pending task

## Recommendations
- Suggestions for next agent
```

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `project-rules.md` | Development rules & protocols |
| `handoff-context.md` | Current project state |
| `.agent/skills_index.json` | Available skill files |
