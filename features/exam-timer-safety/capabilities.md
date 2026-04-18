# Exam Timer Safety Capabilities

## Core User Stories
1. **Accurate Countdown Tracking:** As a student taking an exam, I need a reliable timer that accurately reflects my remaining time relative to the server's truth boundary.
2. **Page Refresh Resilience:** If I accidentally refresh the page, the timer must instantly calculate the elapsed time against the fixed database start time to prevent me from cheating or losing exam state.
3. **Auto-Submission upon Expiry:** Once the timer expires (reaches 0), the system must immediately and autonomously submit my exam to the server without requiring manual interaction, ensuring strict deadline enforcement.
4. **Stale Closure Prevention:** The timer logic must be impervious to React lifecycle stale closures, ensuring the background tick mechanism always references the most up-to-date answer sheet during auto-submit.
