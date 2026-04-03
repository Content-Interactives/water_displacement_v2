# Water Displacement Interactive (v2)

React (JSX) SPA for volume and water displacement (drag-and-drop). Curriculum, placement, and standards: [Standards.md](Standards.md).

**Live site:** [https://content-interactives.github.io/water_displacement_v2/](https://content-interactives.github.io/water_displacement_v2/)

---

## Stack

| Layer | Notes |
|--------|--------|
| Build | Vite 7, `@vitejs/plugin-react` |
| UI | React 19 |
| Styling | Tailwind CSS 3 |
| Interaction | `@dnd-kit/core` |
| Deploy | `gh-pages -d dist` (`predeploy` → `vite build`) |

---

## Layout

```
vite.config.js          # base: '/water_displacement_v2/'
src/
  main.jsx → App.jsx → components/WaterDisplacementV2.jsx
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview `dist/` |
| `npm run lint` | ESLint |
| `npm run deploy` | Build + publish to GitHub Pages |

---

## Configuration

`base` in `vite.config.js` must match the GitHub Pages project path (`/water_displacement_v2/`).
