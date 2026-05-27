---
name: brain-panel-fullscreen-grid
description: When BrainPanel is expanded to fullscreen, render a hero section with 6 metrics in a row followed by a responsive 3-column card grid
source: auto-skill
extracted_at: '2026-05-28T10:00:00.000Z'
---

## Problem
The BrainPanel was a single-column stack in all modes. When expanded to fullscreen, the content looked sparse and wasted horizontal space.

## Solution
Conditional rendering based on `isFullscreen` state:

### Panel mode (narrow, ~360px)
- Single column stack with `space-y-4`
- Content rendered via shared `PanelContent` JSX variable
- Sticky header with 3-col circular metrics

### Fullscreen mode (entire screen)
- **Hero section**: Full-width gradient background with `border-b`, centered 6-column grid of `CircularProgress` widgets (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`)
- **Status badges**: Centered eye recovery / CSF status pills below metrics
- **Time simulator**: Compact centered control below border-t
- **Card grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-6 sm:px-10 py-6`
- Circadian clock spans full width: `md:col-span-full`
- Footer stats span full width: `md:col-span-full`

### Key pattern
```tsx
{isFullscreen ? (
  <div className="flex-1 overflow-y-auto">
    {/* Hero section — full width */}
    <div className="bg-gradient-to-b from-zinc-800/50 to-transparent border-b border-zinc-800 px-6 sm:px-10 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 6-col metrics grid, status badges, time sim */}
      </div>
    </div>
    {/* Card grid — 3 columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-6 sm:px-10 py-6">
      {/* Cards as grid items */}
    </div>
  </div>
) : (
  <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-6 space-y-4">
    {PanelContent}
  </div>
)}
```
