---
name: tailwind-v4-dark-mode-fix
description: Tailwind v4 requires @custom-variant directive for dark mode to work
source: auto-skill
extracted_at: '2026-05-28T00:00:00.000Z'
---

## Problem
In a Next.js + Tailwind v4 project, `dark:` variant classes (e.g., `dark:bg-zinc-900`, `dark:text-white`) don't work — the app stays in light mode regardless of the `dark` class on `<html>`.

## Root Cause
Tailwind v4 removed the built-in dark mode configuration from `tailwind.config.ts`. You must now explicitly declare the dark variant in CSS.

## Fix
Add this line immediately after the Tailwind import in `globals.css` (or equivalent CSS entry):

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));
```

## How it works
- `@custom-variant` is Tailwind v4's replacement for the `darkMode: 'class'` config option
- `(&:is(.dark *))` means: apply `dark:` styles when any ancestor has the `.dark` class
- Without this, `dark:` classes are silently ignored at build time

## Common symptoms this fixes
- White background below dark content (body lacks `dark:bg-*`)
- Sidebar shows light colors in dark mode
- Theme toggle appears to do nothing
