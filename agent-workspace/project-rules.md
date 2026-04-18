# Exam Management System - Project Rules

## Architecture
- **Pattern**: Feature-Sliced Design (FSD)
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Styling**: Tailwind CSS + CSS Modules (glassmorphism theme)

## Design System
- **Theme**: Dark glassmorphism SaaS
- **Colors**: 
  - Primary: #6366f1 (Indigo)
  - Accent: #2dd4bf (Teal)
  - Danger: #fb7185 (Rose)
  - Success: #34d399 (Emerald)
- **Icons**: lucide-react only
- **Components**: Custom glass-card, btn-primary, btn-secondary classes

## File Structure
```
src/
├── features/          # Feature modules (FSD)
│   └── admin-management/
│       ├── api/      # API hooks and services
│       └── components/ # UI components
├── pages/            # Route pages
├── components/       # Shared components
├── hooks/            # Global hooks
├── services/         # Supabase, auth
└── types/            # TypeScript types
```

## Coding Standards
- Functional components with hooks
- No 'any' - use 'unknown' with type guards
- React.memo for pure components
- useCallback for event handlers passed to children
- Props interface must always be defined

## Security
- RLS policies on all tables
- Admin-only actions check JWT role
- No hardcoded secrets

## Database Conventions
- Table names: snake_case
- Enums: CREATE TYPE public.enum_name
- Indexes: idx_table_column
- RLS: Always enabled
