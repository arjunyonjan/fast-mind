# FastMind Feature Roadmap & Buddha Engine Enhancements

## 🔴 Critical Fixes
1. Uncomment Sidebar Navigation – layout.tsx nav commented out
2. Fix Duplicate CSS Animations – globals.css slide-in/modal-pop keyframes defined twice
3. Add SVG Diagram Files – DiagramViewer needs 3 SVGs in /public/docs/
4. Wire DiagramViewer into Sidebar – Component exists but not rendered

## 🟡 High-Impact Features
5. Connect AI Chat to Real LLM – /api/chat route.ts echoes only; wire to DeepSeek/HuggingFace
6. Add Document Slug Support – API accepts slug; frontend never sends
7. Add Search to Documents Page – UI missing filtering logic
8. Add Task Management Pages – /tasks routes missing

## 🟢 Polish & DX
9. Loading Skeletons – Replace RingLoader with inline skeletons
10. Keyboard Shortcuts – Ctrl+N new doc, Ctrl+/ search
11. Dark Mode Toggle – Theme infra exists, no button
12. Document Word Count – Editor footer metric
13. Toast Auto-Dismiss Progress Bar
14. Error Boundary – Catch TipTap crashes
15. SEO Metadata per Document – Dynamic title/description

## 🔵 Architecture / Backend
16. Rate Limiting on AI Chat
17. Document Version History – MongoDB
18. User Auth – NextAuth/Clerk
19. Image Upload Endpoint – URL-only currently
20. Export to Markdown/PDF

## 🧘 Buddha Engine – Wake Time & Circadian Tracking
- Sleeping → Awake toggle captures wake hour, resets hours-awake counter
- Eye strain, waste accumulation, brain health recalc from actual wake moment
- Wake time persists in localStorage
- Fixes 5 AM brain-at-10% bug

## 🍽️ Nutrition Tracker & Intermittent Fasting
- Food logging with fasting windows
- Math effect: metabolic score, autophagy timer, insulin sensitivity
- Icons: moon (fasting), apple (meal), timer (window), fire (metabolism)

## 🧠 Meditation States & AI Doc Reformatter
- Meditation timer with state tracking (calm, focused, open)
- AI reformat button with diff/confirmation (old vs new)

## 🎵 Music & Kindness Module
- Music listening focus/relaxation toggle
- Act of kindness random service – daily random prompt + log

## 🏆 Buddha 5 Colors Panel
- Energy (red), Purity (white), Knowledge (blue), Peace (green), Balance (yellow)
- SVG flag strip or card distribution
- Explanations per color on hover/click

## 🧘 Spine-to-Brain Movement Module
- 100 toe touches/day (seated forward bends, standing hangs, crossed-leg twists)
- 20 push-ups every 2 hours
- Streak counter: "340 toe touches / 60 push-ups this week"
- Stress -1 per 10 reps, Glymphatic +3% per micro-session

## ⏰ Move-or-Freeze Nudge
- 90-min inactivity alert
- Animated spine icon compresses then decompresses on movement log
- Posture check every 30 min

## 📊 Brain Dashboard Enhancements
- Weekly movement vs focus chart
- Hydration + stretch + push-up composite score
- Daily movement log with rep counts

## 💾 Storage Strategy
- localStorage for instant logging
- MongoDB for weekly trends
