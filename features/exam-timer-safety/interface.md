# Exam Timer Safety Interface

## Exposed Presentation Components
While the timer safety is primarily a behavioral/logic requirement, it interfaces with the UI through the following visual structures:

- **`ExamHeader.tsx` Timer Display:**
  - Standard Display: Shows remaining time in `HH:MM:SS` or `MM:SS`.
  - Warning State: Transitions to an error/warning color scale (e.g., Red) when `< 5 minutes` remain to urgently notify the student.
  - Locked Overlay: When time reaches 0, the interface triggers a global blocking overlay displaying "Time's up! Submitting exam..." to prevent further interaction while the background logic flushes the answers.
