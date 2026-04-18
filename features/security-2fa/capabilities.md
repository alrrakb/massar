# Security 2FA Capabilities

## Core Features
1. **Password Rules Validation:** Utilizes `Zod` combined with `React Hook Form` to strictly enforce:
   - Minimum 8 length, 1 uppercase, 1 number, 1 special character.
   - Strict `confirmPassword` equivalence.
2. **Dynamic Password Strength Evaluation:** Calculates a 0-5 strength score instantly as the user types, returning visual feedback ranging from `'Weak'` (red) to `'Very Strong'` (green).
3. **MFA State Retrieval:** Checks Supabase `auth.mfa.listFactors` on mount to establish if TOTP is active in verified state.
4. **Authentic Enrollment Flow:**
   - Cleans up stale/abandoned unverified factors.
   - Generates and presents the QR code payload (`svg`) and the canonical secret key text backup.
   - Submits the `verify` challenge using a 6-digit OTP code input to commit activation.
5. **Secure Challenge Bypass:** When updating a password for an account *with* 2FA enabled, it intercepts the submit action, mounts a challenge overlay requiring a 6-digit OTP to prove identity *before* modifying the core auth session password.
