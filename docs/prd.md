# iPet - macOS Desktop Pet Application

## Overview
A macOS app displaying a cute slime pet that moves freely on the desktop, interacts with users via voice input, and responds with emojis/animations powered by Gemini AI.

---

## Tech Stack: **Tauri 2.0 + React + TypeScript**

### Why Tauri:
| Criteria | Tauri | Electron | Swift |
|----------|-------|----------|-------|
| App Size | ~3 MB | ~100 MB | ~10 MB |
| Memory | 30-50 MB | 100+ MB | 20-40 MB |
| Learning Curve | Medium | Low | High |
| Transparent Window | Good | Hacky | Native |
| App Store | Supported | Complex | Easiest |

**Advantages:**
- Reference project: [WindowPet](https://github.com/SeakMengs/WindowPet)
- Uses TypeScript/React (familiar web tech)
- Lightweight, good performance
- Supports transparent window + always-on-top

---

## Core Features

### 1. Pet Movement & Display
- Transparent window always on top of all apps
- Pet moves freely within screen bounds
- Animation states: idle, walk, sleep, happy, talk, drag
- Sprite sheet animation with Canvas 2D

### 2. User Interactions
| Action | Behavior |
|--------|----------|
| Click | Pet reacts with happy animation (happy/curious) |
| Double-click | Activate voice input, pet listens |
| Drag | Move pet to new position |
| System Tray | Click tray icon → Settings panel |

### 3. AI Integration (Gemini)
- **Voice Input**: Double-click → record mic → send audio to Gemini
- **Personality System**: Preset personalities (Cheerful, Wise, Sleepy)
- **Response**: Emotion + Animation + Emojis + Short text (3-4 words max)
- **Memory**: Conversation history, context window ~20 messages
- **NO TTS**: Visual response only

### 4. Personality Presets
- **Bubbles (Cheerful)**: Energetic, loves emojis, active
- **Sage (Wise)**: Calm, likes sharing knowledge
- **Drowsy (Sleepy)**: Sleepy, cute, slow-paced

---

## Implementation Phases

### Phase 1: Foundation
Pet appears and moves on screen
- [x] Tauri 2.0 project setup
- [x] Transparent window, always-on-top
- [x] Canvas rendering
- [x] Idle state + random wandering
- [x] Drag-and-drop
- [x] Screen boundary detection

### Phase 1.1: Kawaii Landing Effect
- [x] Spring physics bounce when dropping pet after drag
- [x] Squish effect (compress/stretch) on landing
- [x] Smooth settle animation (~600ms)

### Phase 2.1: Sprite Animation System
- [x] Sprite sheet loading and rendering
- [x] Multiple animation states (idle, walk, sleep, happy, drag)
- [x] Auto-detect frame size from sprite dimensions
- [x] Aspect ratio preservation
- [x] Direction flip based on movement

### Phase 2.2: Animation Enhancement
- [x] DeltaTime-based frame timing (accurate to config frameDuration)
- [x] Squish/bounce effects on sprites when landing
- [x] Optimized rendering (only redraw when frame changes)
- [x] Drawing integrated into game loop

### Phase 2.3: Skin System (Planned)
- [ ] SkinManager with multiple skins
- [ ] Color variations
- [ ] System tray skin selection

### Phase 3.1: Settings Infrastructure (Complete)
- [x] Tauri plugin for file system access
- [x] Settings storage at ~/.ipet/settings.json
- [x] Rust commands: load_settings, save_settings
- [x] TypeScript types and SettingsService
- [x] useSettings React hook

### Phase 3.2: Settings UI & System Tray (Complete)
- [x] System tray icon with menu (Settings, Quit)
- [x] Settings window (secondary Tauri window)
- [x] Kawaii glassmorphism UI design
- [x] Dark/light theme support (follows system)
- [x] Sections: API Key, Personality, Microphone, Storage

### Phase 3.3: Voice Recognition (Complete)
- [x] Web Speech API integration
- [x] Press "V" → listening state
- [x] Silence detection (2s timeout)
- [x] Visual indicator when listening (glowing orb)
- [x] "Curious" animation while listening

### Phase 3.4: Conversation History (Complete)
- [x] In-memory conversation history
- [x] 20-message context window
- [x] Auto-cleanup old messages

### Phase 3.5: Gemini AI Integration (Complete)
- [x] Gemini API (gemini-2.0-flash-lite)
- [x] Personality system prompts
- [x] Short responses (MAX 3 words + emojis)
- [x] Temperature 0.9 for creative responses

### Phase 3.6: Speech Bubble UI (Complete)
- [x] Magical Glass Aurora speech bubble
- [x] Glassmorphism with animated gradient border
- [x] Floating sparkle decorations
- [x] Expand pet window when showing bubble
- [x] Gentle float animation

### Phase 3.7: Full Integration (Complete)
- [x] Complete voice → AI → response flow
- [x] State machine updates (listening, processing, idle)
- [x] Error indicator for failed requests

### Phase 3.8: Pet Mood System (Complete)
- [x] Two core stats: Happiness (0-100) and Energy (0-100)
- [x] Time-based decay (random 10min-1hour delay before decay starts)
- [x] Offline decay calculation (50% rate, capped at 24 hours)
- [x] Sleep cycle (every 1-3 hours, sleeps 10-30 minutes)
- [x] Visual mood indicator (happiness/energy bars + sleep icon)
- [x] Persistence to ~/.ipet/mood.json
- [x] 10 creative interactions with cooldowns and daily limits

#### Mood Interactions
| Key | Interaction | Happiness | Energy | Notes |
|-----|-------------|-----------|--------|-------|
| Click | Petting | +7 | +2 | 2s cooldown |
| V | Voice Chat | +15 | -5 | Via Gemini |
| T | Give Treat | +8 | +10 | 5/day limit |
| Double-click | Play Catch | +12 | -10 | Requires energy ≥20 |
| Drag+release | Gentle Shake | +3 | +5 | Uses bounce physics |
| L | Lullaby | +5 | - | Triggers sleep |
| First click/day | Morning Greeting | +20 | +10 | Once per day |
| Voice w/ positive words | Compliment | +10 | - | Detects "love", "cute", etc. |
| D | Dance Party | +15 | -15 | Requires energy ≥30 |
| 5min idle | Quiet Time | +3 | +5 | Passive presence |

### Phase 4: Polish & Distribution
- [ ] Error handling
- [ ] macOS code signing
- [ ] DMG packaging
- [ ] GitHub releases

---

## Confirmed Decisions
- **Gemini model**: gemini-2.0-flash-lite
- **Response style**: MAX 3 words + 1-2 cute emojis (💕✨🌟💖🎀🌸😊🥰💫🐾)
- **Settings**: System tray icon → Settings panel
- **Sprite style**: Cartoon/Vector (kawaii slime)
- **Tech stack**: Tauri 2.0 + React + TypeScript
- **Voice activation**: Press "V" key

---

## Design System

### Speech Bubble - Magical Glass Aurora

**Visual Style:**
- Glassmorphism with animated aurora gradient border
- Colors: Pink (#ff6b9d) → Purple (#c44dff) → Blue (#6b8cff) → Teal (#4dffea) → Yellow (#ffe44d)
- Floating sparkle decorations (4 sparkles + 1 star)
- Semi-transparent content area (45% opacity)

**Typography:**
- Font: Quicksand (700 weight)
- Size: 13px
- Text shadow for visibility on transparent background
- Center aligned

**Animations:**
| Animation | Duration | Effect |
|-----------|----------|--------|
| bubble-appear | 0.5s | Bouncy scale entrance |
| aurora-shift | 4s | Gradient position shift |
| gentle-float | 3s | Subtle Y movement |
| sparkle-float | 2-3s | Sparkle bounce (staggered) |
| star-twinkle | 1.5s | Scale + rotation |
| tail-wiggle | 3s | Bubble tail movement |

### Voice Indicator

**States:**
- `listening`: Pastel gradient (#a8edea → #fed6e3) + breathe animation
- `processing`: Purple gradient (#667eea → #764ba2) + spinner
- `error`: Pink gradient (#ff9a9e → #fecfef) + shake animation

---

## AI System Prompt

```
You are a kawaii virtual pet named iPet. Personality: {traits}.

STRICT RULES:
- Reply with MAX 3 WORDS only (excluding emojis)
- ALWAYS use 1-2 cute emojis 💕✨🌟💖🎀🌸😊🥰💫🐾
- Match user's language
- Be expressive through emojis, not words
- Examples: "Yay! 💕✨" "Love you! 🥰" "Hihi~ 🌸" "Okiee 💫" "Đói quá! 🍜💕"
```

**Generation Config:**
- Temperature: 0.9
- Max Tokens: 30
- Top P: 0.9
- Top K: 40
