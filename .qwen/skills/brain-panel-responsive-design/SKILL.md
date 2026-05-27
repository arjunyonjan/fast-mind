---
name: brain-panel-responsive-design
description: BrainPanel mobile/desktop responsive behavior pattern
source: auto-skill
extracted_at: '2026-05-28T14:00:00.000Z'
---

## Responsive Layout

### Mobile (`<640px`)
- Full-screen overlay with dark backdrop (`bg-black/50`)
- Tap backdrop or X button to close
- CircularProgress grid: **1 column** on mobile, scales up
- Floating brain button: bottom-right corner (`bottom-6 right-6`)
- Full-width scrollable content, single column cards
- Resize handle hidden

### Desktop (`≥640px`)
- Right-side floating panel with shadow + border
- Resizable via drag handle (280px–600px range)
- **3-column** CircularProgress grid (`grid-cols-1 sm:grid-cols-3`)
- Floating brain button: mid-right edge (`sm:top-1/2 sm:right-4 sm:-translate-y-1/2 sm:bottom-auto`)
- Fullscreen toggle button visible

## Metric Circles (Header Section)
- 6 metrics in `grid-cols-1 sm:grid-cols-3`: Brain, Eyes, Spine, Digestion, Energy, Clearance
- Digestion tracks hours since last meal via `calcDigestionPhase()`
- Energy calculates based on circadian phase + meal timing
- Meal log button (🍽️) added in Neuro Protection section alongside Water, Pushups, Hang, Bend
- Neuro section uses `grid-cols-4 sm:grid-cols-5` for 5 action buttons

## Resize Handle — Critical Positioning
- **Must render AFTER the panel in DOM** — z-index stacking order matters: panel (z-9999), backdrop (z-9998), handle (z-9999 after panel)
- Hit area: `w-6` with `cursor-col-resize` (wider = easier to grab)
- Positioned at `right: panelWidth - 12`
- Always-visible subtle line at `left-1/2 -translate-x-1/2`
- 5 rows of 2 dots appear on hover
- Use `panelWidthRef` in resize handler to prevent stale closure — store current width in ref and sync with `useEffect`
- Hidden on mobile and when in fullscreen mode

## Fullscreen Toggle
- Use SVG expand/collapse icons instead of Unicode characters
- Expand icon (↗) fills screen, collapse icon (↙) returns to panel width
- Backdrop and resize handle hide in fullscreen mode
- When fullscreen, panel uses `inset-0 sm:rounded-none` instead of floating positioning
- Add `transition-all duration-300` for smooth expand/collapse animation

## Mood Buttons
- Each has emoji + color-coded background on active state
- happy=sky blue, neutral=emerald, sad=amber, anxious=orange, angry=red, depressed=rose/dark, lonely=violet
- Active state includes `ring-1 ring-white/10` for polish

## Lifestyle Section
- 2-column grid (`grid-cols-2 gap-1.5`) instead of vertical list
- Custom check icons replacing native checkboxes — cyan bg + white Check on active
- Title Case for all items
- Merged similar items: "Processed / Junk Food"
- Health scoring includes weights for all 13 items (Smoking=-20, Overeat=-15, Alcohol=-15, Overworking=-12, etc.)
- **Migration**: map old lowercase keys to new Title Case keys on load

## Tailwind Dynamic Classes — Gotcha
- **DO NOT use** dynamic class names like `bg-${color}-500/20` — Tailwind JIT cannot scan these
- **Use static class maps**: `const colors = { amber: "bg-amber-500/20", sky: "bg-sky-500/20" }` then `colors[item.color]`
- This affected the Daily Boosters and Neuro Protection sections

## Domain Functions
- Digestion calculations in `features/brain/domain/digestion.ts`: `calcDigestionPhase()` and `calcEnergyLevel()`
- State: `lastMeal` tracked in localStorage as `brain-last-meal`
