---
name: chat-session-persistence-hybrid
description: Hybrid localStorage + MongoDB chat persistence with fire-and-forget saves, instant UI, and session restore from cache or DB fallback
source: auto-skill
extracted_at: '2026-05-28T10:00:00.000Z'
---

## Problem
Chat messages were lost on page refresh and DeepSeek API calls had no conversation history — every message was treated as a new conversation.

## Solution: Hybrid localStorage + MongoDB

### Architecture
- **localStorage** = primary source (instant, zero latency)
  - `chat-session-id`: current session UUID
  - `chat-messages-{sessionId}`: message array
- **MongoDB `chatSessions`** = backup/persistent store
  - Saved via fire-and-forget (`navigator.sendBeacon` or `fetch(..., { keepalive: true })`)
  - Never blocks UI

### Flow

#### Page load (restore)
```
1. Check localStorage for chat-session-id
2. If found → load messages from localStorage (instant)
3. If not → fetch last session from /api/chat-session (warm restore)
4. Restore messages into React state
```

#### Send message
```
1. Create user message → append to local state (instant)
2. Save to localStorage (instant)
3. POST /api/chat with full messages history array
4. Receive AI reply → append to state + localStorage
5. Fire-and-forget save to MongoDB (non-blocking)
```

#### New chat
```
1. Save current session to MongoDB
2. Generate new sessionId
3. Clear localStorage
4. Start fresh
```

### API: /api/chat
- Accepts `{ message, messages: history[], spaceId }`
- Passes last 10 messages to classifier for context-aware intent
- Passes full history to chat intent for conversation continuity

### API: /api/chat-session
- `GET ?sessionId=xxx` → load specific session
- `GET` (no params) → load most recent session
- `POST` → upsert session with `{ sessionId, messages }`

### Key implementation details
- Trim to last 50 messages before saving to MongoDB
- `crypto.randomUUID()` for session IDs with fallback
- `navigator.sendBeacon` for background saves (survives page unload)
- Debounced saves don't block UI
