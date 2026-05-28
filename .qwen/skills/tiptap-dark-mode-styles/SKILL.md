---
name: tiptap-dark-mode-styles
description: Fix TipTap HTML inline styles overriding dark mode CSS by stripping inline color/background styles with useLayoutEffect
source: auto-skill
extracted_at: '2026-05-28T00:15:00.000Z'
---

## Problem
TipTap-generated HTML contains inline `style="color: rgb(...)"` and `style="background-color: rgb(...)"` attributes that override Tailwind CSS classes and `!important` rules, making dark mode text appear dim or invisible on dark backgrounds.

## Solution

### Step 1: Add `useLayoutEffect` to strip inline styles
```tsx
import { useLayoutEffect, useRef } from "react";

const contentRef = useRef<HTMLDivElement>(null);

// Strip inline color/background styles synchronously after DOM updates
useLayoutEffect(() => {
  if (!contentRef.current) return;
  const all = contentRef.current.querySelectorAll('*');
  all.forEach(el => {
    const s = (el as HTMLElement).style;
    if (s.color) s.color = '';
    if (s.backgroundColor) s.backgroundColor = '';
    if (s.background) s.background = '';
    if (s.borderLeftColor) s.borderLeftColor = '';
  });
}, [doc?.content, doc?._id]);
```

### Step 2: Use `key` prop to force clean re-render
```tsx
<div ref={contentRef} key={doc?._id} className="doc-content">
  <div dangerouslySetInnerHTML={{ __html: doc.content }} />
</div>
```

### Step 3: Add CSS with `!important` for text colors
```tsx
<style>{`
  .doc-content * { color: #18181b !important; }
  .doc-content a { color: #059669 !important; }
  .doc-content pre { background-color: #111827 !important; color: #e5e7eb !important; }
  
  .dark .doc-content * { color: #ffffff !important; }
  .dark .doc-content a { color: #34d399 !important; }
  .dark .doc-content pre { background-color: #09090b !important; }
`}</style>
```

## Why useLayoutEffect
`useLayoutEffect` runs synchronously after DOM mutations but before paint, ensuring inline styles are stripped before the user sees the content. This prevents the flash of incorrect colors that would occur with `useEffect`.

## How to apply
Any page rendering TipTap HTML content (or any rich text with inline color styles) needs this pattern:
1. `useLayoutEffect` to strip inline color/background-color/background properties
2. `key` prop on the container to force clean re-render on content change
3. CSS with `!important` selectors targeting the container class for both light and dark modes
