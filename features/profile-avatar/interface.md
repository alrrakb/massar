# Profile Avatar Interface

## Component API
- `<UserAvatar />` accepts:
  - `url` (optional string): Full remote image URL.
  - `name` (optional string): Full name of the user.
  - `email` (optional string): Active email of the user.
  - `size` (optional number, default 40): Pixel width & height.
  - `className` and `style` props for extended layout flexibility.

## Styling Rules
- Container is absolutely circular (`borderRadius: '50%'`).
- The initials fallback employs a slate color-scheme gradient background (`linear-gradient(135deg, #334155, #1e293b)`) rendering solid white text.
- Inner image relies on `object-fit: cover` to prevent image stretching inside the circular mask.
