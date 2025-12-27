# Theme Guide

SkillLink Frontend supports two color themes: Blue + White and Green + White.

## How It Works
- The current theme is stored in `localStorage` under key `skl_theme`.
- The `<html>` element gets `data-theme="blue"` or `data-theme="green"`.
- CSS in `styles.css` defines base variables in `:root` and overrides inside `[data-theme="blue"]` and `[data-theme="green"]` blocks.
- Gradients, buttons, hero overlays and accents use `var(--color-accent)` and `var(--color-accent-2)` so they change automatically.

## Adding Another Theme
1. Add a new block:
```css
[data-theme="purple"] {
  --color-bg: #f8f6fb;
  --color-accent: #6d28d9;
  --color-accent-2: #4c1d95;
  --color-border: #e4ddf4;
  --focus-ring: 3px solid rgba(109,40,217,0.28);
}
```
2. Extend `ThemeContext.jsx` to cycle through the new theme or create a select component to call `setThemeExplicit('purple')`.

## Accessibility
- Focus ring color adapts per theme for visibility.
- Animations respect `prefers-reduced-motion` and are disabled for users who choose reduced motion.

## Performance Tips
- Keep only semantic colors in variables; avoid repeating raw hex codes elsewhere.
- Use CSS variables for future dark mode (e.g. redefine `--color-bg`, `--color-surface`, `--color-text`).

## Troubleshooting
- If theme toggle stops working, ensure `document.documentElement.dataset.theme` is not overwritten by other scripts.
- Clear storage: open DevTools Console and run `localStorage.removeItem('skl_theme')`.

## Current Variable Summary
- `--color-accent`: Primary brand color.
- `--color-accent-2`: Secondary gradient companion.
- `--color-bg`: Page background tint.
- `--color-surface`: Card & component surfaces.
- `--color-border`: Border and subtle divider color.
- `--color-muted`: Secondary text.

Feel free to request a dark mode or additional theme and I can scaffold it quickly.
