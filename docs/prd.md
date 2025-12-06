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

### Phase 3: AI Integration
Pet talks with user via voice
- [ ] AudioService (mic recording)
- [ ] Double-click → listening
- [ ] Gemini API (gemini-2.0-flash)
- [ ] Personality system prompts
- [ ] EmojiBubble component
- [ ] Conversation memory
- [ ] System Tray + Settings panel

### Phase 4: Polish & Distribution
- [ ] Error handling
- [ ] macOS code signing
- [ ] DMG packaging
- [ ] GitHub releases

---

## Confirmed Decisions
- **Gemini model**: gemini-2.0-flash
- **Response style**: Emoji + Animation + Short text (3-4 words)
- **Settings**: System tray icon → Settings panel
- **Sprite style**: Cartoon/Vector
- **Tech stack**: Tauri 2.0 + React + TypeScript
