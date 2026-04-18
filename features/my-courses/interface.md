# My Courses Interface

## Layout & Components

### Header & Actions
- Page Title: `My Courses` with Book icon.
- Call to Action: `Register New Course` button with gradient styling.

### Filter Bar (Glassmorphism Context)
- **Search Input:** Debounced text field filtering by course name or code.
- **Semester Dropdown:** Filters entries by historical term (e.g., "Fall 2024").
- **Department Dropdown:** Filters by department domain.

### Main View Area
- **Tabs Component:** Three horizontal segments (`Current`, `Past`, `All`) with animated gradient bottom borders showing aggregated course counts.
- **Course List (List View):**
  - **Course Card:** Compact glassmorphic container displaying overarching course meta (Name, Code, Instructor).
  - **Information Grid (2-Column):**
    - *Column 1 (Info):* Credits, Semester, Dept, and a linear gradient Progress Bar for completion prediction.
    - *Column 2 (Performance):* Aggregate scores, ratio of exams taken, and small list of Upcoming scheduled events.
  - **Action Footer:** 3 distinct router action buttons mapping to Exams, Grades, and Materials context states.

### Sticky Sidebar Stats
- General metric overview displaying Cumulative GPA, Credits Earned, Credits Remaining, and a summarized generic Degree Progress gradient bar.
