# SkillLink Frontend

SkillLink is a responsive React + Vite frontend that connects local community members with skilled workers offering only physical, hand-made services (e.g. plumbing, carpentry, electrician, tailoring, painting, masonry, home repairs, gardening, tutoring). Digital services are intentionally excluded.

## Features
- Role support: Service Receiver (User) & Service Provider (Worker)
- Pages: Home, About, Login, Signup, User Dashboard, Worker Dashboard, Browse Services, Service Details, Post Job, Contact
- Category & city filtering, keyword search
- Worker profile cards: name, skill, city, rating, description
- Theme toggle: Blue/White or Green/White
- Responsive layout (mobile-first)
- Accessible semantics (labels, roles, sensible hierarchy)
- Placeholder data only (no backend integration)
- Add Service form for workers (local state only)
- Inline client-side validation with accessible error messages
- Skip link & focus outlines for keyboard navigation
- ESLint configuration for code quality
- CSS microinteractions & reduced-motion support

## Tech Stack
- React 18
- React Router DOM 6
- Vite build tooling
- Plain CSS with design tokens (CSS variables)

## Getting Started

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build production assets
npm run build

# Preview production build
npm run preview
```

Then open the local dev URL shown (usually http://localhost:5173).

## Project Structure
```
src/
  components/      # Reusable UI components
  context/         # Theme & role contexts
  data/            # Static placeholder datasets
  pages/           # Route-level page components
  styles.css       # Global styles & tokens
  App.jsx          # Routes mapping
  main.jsx         # App entry
```

## Customization
- Update `src/data/workers.js` and `src/data/services.js` for more placeholder content.
- Adjust color themes via CSS variables in `styles.css`.
- Modify animations or disable them by removing keyframes in `styles.css`.
- Change validation rules in page components (e.g., `Signup.jsx`, `PostJob.jsx`).

## Notes
This is a frontend-only prototype: forms do not persist data; actions (login, signup, post job) simply simulate behavior. Add real backend endpoints later under the `Backend/` folder and integrate with fetch/axios.

For accessibility:
- Use Tab to navigate; a skip link appears on focus.
- Error messages are associated with inputs via `aria-describedby`.
- Animations are disabled automatically with `prefers-reduced-motion`.

## License
Internal / Prototype. Add a proper license before distribution.
