---
name: full-height-layout-fix
description: Fix white gap below content in full-height dark mode layouts
source: auto-skill
extracted_at: '2026-05-28T00:00:00.000Z'
---

## Problem
In dark mode, a white strip appears below the content at the bottom of the page. This happens because neither the `<body>` nor the main layout wrapper are constrained to the viewport height.

## Fix
In `app/layout.tsx`, apply `min-h-screen` to BOTH the body element AND the flex wrapper:

```tsx
<body className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
  <div className="flex min-h-screen">
    <AppSidebar />
    <div className="flex-1 min-w-0">
      <main>{children}</main>
    </div>
  </div>
</body>
```

## Key points
- **Body**: `min-h-screen` + dark mode background color (`dark:bg-zinc-950`) ensures the page background is correct even when content is short
- **Flex wrapper**: `min-h-screen` ensures the sidebar extends to the bottom
- **Content area**: `min-w-0` prevents flex child overflow issues
- Without `dark:bg-*` on `<body>`, you see the browser default (white) below content in dark mode
