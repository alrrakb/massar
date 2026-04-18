# Dashboard Interface Blueprint

## Component Tree
- `StudentDashboard.tsx`
  - `Header`: Greeting and contextual subtext.
  - `NextEventCard`: Countdown timer (HRS:MIN:SEC) for the immediate upcoming or live exam, with `Play` action.
  - `StatsRow`:
    - Active Exams Count
    - New Grades Count
    - Completion Percentage
  - `ActiveAssignments`: List of exams displaying name, course, duration, and status badge (`Live`, `Upcoming`, `Done`, `Missed`).
  - `PerformanceChart`: Interactive `Recharts/LineChart` plotting percentage scores across subjects over time. Includes custom SVG linear gradients and tooltips.
  - `Sidebar`:
    - `GpaGauge`: Circular SVG gauge visualizing term GPA out of 4.0.
    - `AcademicStanding`: Summary of passed exams, courses, and pending exams.
    - `QuickAccess`: Navigation links to Exams, Results, Courses, and Profile using Lucide React icons.

## Data Binding
- `DashboardData` interface powers the UI state (upcoming/live exams, recent submissions).
- Chart utilizes `buildChartData()` utility to pivot flat arrays into `Recharts` compatible array of objects mapped by `date`.
