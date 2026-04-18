# Security 2FA Interface

## Visual Components

### Password Form
- **Strength Meter:** An animated linear gauge evaluating 4 rules simultaneously (8+ chars, Uppercase, Number, Special char) showing pills that toggle green (`✓`) when met.
- **Input Group (`PasswordField`):** Unified inputs with inline Show/Hide eye-icon toggle using `lucide-react`.

### 2FA Enrollment Prompts
- **Bypass Prompt:** Glassmorphic card overlay capturing a 6-digit challenge code to verify auth changes.
- **QR Enroller:** 
  - Central white-background box explicitly rendering the QR SVG for mobile scanning contrast.
  - Copy-to-clipboard widget for the plain-text Backup Secret Key.
  - Spaced OTP verification inputs (`letterSpacing: '8px'`).
- **Status Dashboard:** Shows distinct `Active` (Green badge) vs `Disabled` (Red badge) state with contextual action buttons (Enable/Disable).
