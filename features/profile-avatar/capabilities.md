# Profile Avatar Capabilities

## Core Features
1. **Dynamic Media Resolution:** Automatically resolves the most appropriate avatar to show:
   - If a valid `url` property is provided (e.g., from an AWS S3 bucket or Supabase Storage), it renders the user image.
   - If `url` is null or invalid, it gracefully falls back to the initials computation.
2. **Initials Fallback Computation:**
   - Evaluates the provided `name` or `email` payload.
   - Extracts the first letter of the first and last name if space-separated.
   - Extracts the first two characters if it's a single continuous string.
3. **Adaptive Sizing:** Scales correctly via a generic `size` prop, preserving perfect circular borders and proportionally scaling the internal text size for the initials.
