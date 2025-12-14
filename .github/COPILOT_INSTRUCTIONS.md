# Copilot Instructions for LocationSearch Project

Project: LocationSearch

Stack
- Vite
- React (TSX)
- TypeScript
- Bootstrap 5 + react-bootstrap

What this repo does
- Small location search UI component in `src/components/LocationSearch.tsx`.
- App entry: `src/main.tsx`, root UI in `src/App.tsx`.

How to run (developer machine - Windows PowerShell)
1. Install node dependencies:

```powershell
npm install
```

2. Start dev server:

```powershell
npm run dev
```

3. Build for production:

```powershell
npm run build
```

Coding style and constraints
- Use TypeScript and prefer strong typing for props and data models (see `src/types/location.ts`).
- Keep components small and focused. Create hooks for logic where helpful.
- Follow existing project formatting (Prettier/ESLint likely configured). Avoid reformatting unrelated files.
- Limit external dependencies. If adding a dependency, prefer well-maintained libraries and update `package.json` accordingly.

Testing
- No tests currently. If adding tests, prefer Vitest or Jest with React Testing Library.

Helpful prompts for Copilot suggestions
- "Add type-safe props to `LocationSearch.tsx` and export interface in `src/types/location.ts`."
- "Implement a debounced fetch hook for location autocomplete using fetch and AbortController."
- "Add unit test for `LocationSearch` that mocks fetch and verifies debounce behavior."

Project-specific notes
- Keep network calls cancellable with AbortController to avoid race conditions.
- Ensure accessibility: keyboard navigation, ARIA attributes for listbox/autocomplete.
- Use Bootstrap utility classes and `react-bootstrap` components for layout and controls.

If you're unsure
- Inspect `src/components/LocationSearch.tsx` and `src/components/types/location.ts` for current data shapes and hooks.

Contact
- Leave a GitHub issue in this repo describing larger changes or unclear requirements.
