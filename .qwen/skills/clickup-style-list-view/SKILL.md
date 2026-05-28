---
name: clickup-style-list-view
description: Task/document pages redesigned with ClickUp-like table list view and grid toggle
source: auto-skill
extracted_at: '2026-05-28T00:00:00.000Z'
---

## Pattern

Both tasks (`app/tasks/page.tsx`) and documents (`app/documents/page.tsx`) follow a consistent ClickUp-inspired layout:

### Structure
1. **Header bar** — icon + title + stats, view toggle (list/grid), new button
2. **Filter/sort bar** — search input, filter tabs, sort selector
3. **Content area** — list view (default) or grid view, full-height scrollable

### List View (default)
- **Column headers** row: sticky, uppercase, small text, border-bottom
- **Rows** with hover background, column-aligned data
- **Grouped by status/date** with colored dot + label headers
- **Expandable rows** — click to reveal details inline
- **Action icons** appear on hover (edit, delete)
- **Checkbox** on left for tasks

### Grid View
- Card grid with icon, title, preview text, metadata footer
- Hover lift effect (`hover:-translate-y-0.5 hover:shadow-md`)

### Consistent Elements
- Accent color per page (violet for tasks, emerald for documents)
- View toggle in header: `<List>` / `<Grid3X3>` icon buttons
- Empty state with icon + "Create one →" link
- Delete confirmation modal with backdrop blur
- Edit modal with form fields and save button
- Priority badges with colored backgrounds (`bg-red-50 dark:bg-red-900/20`)
- Status pills (`bg-zinc-100 dark:bg-zinc-800`)

## Key CSS patterns

```tsx
// List row with hover
<div className="group border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">

// Column header
<div className="flex items-center gap-4 px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">

// Group header
<div className="flex items-center gap-2 px-3 py-2 mt-4 mb-1">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Today (5)</span>
</div>

// Hover-only action button
<div className="w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
  <button className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700">
```

## Layout wrapper
```tsx
<div className="flex flex-col h-full bg-white dark:bg-zinc-950">
  {/* Header — fixed height */}
  <div className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">...</div>
  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto">...</div>
</div>
```
