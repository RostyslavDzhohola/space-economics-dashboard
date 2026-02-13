# Reusability Economics — Interactive Deck

An interactive web deck for evaluating reusable first-stage economics: break-even $/kg, cadence feasibility, worked example, and ranked levers.

## Math rendering

Equations are rendered with KaTeX via `react-katex` (dependencies: `katex`, `react-katex`, plus `@types/react-katex`). The KaTeX stylesheet is imported in `src/main.tsx`.

## Local development

```bash
pnpm install
pnpm dev
```

The app will run at `http://localhost:5173` by default.

## Build

```bash
pnpm build
pnpm preview
```
