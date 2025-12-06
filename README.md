# iPet - macOS Desktop Pet

A cute slime pet that lives on your desktop, powered by Tauri + React + TypeScript.

## Features

### Phase 1: Foundation (Complete)
- [x] Transparent window always on top
- [x] Cute slime pet with idle animation
- [x] Random wandering movement
- [x] Drag and drop support
- [x] Click reactions (happy animation)
- [x] Screen boundary detection

### Phase 1.1: Kawaii Landing Effect (Complete)
- [x] Spring physics bounce when dropping pet
- [x] Squish effect (compress/stretch) on landing
- [x] Smooth settle animation (~600ms)

### Phase 1.2: Random Directional Movement (Complete)
- [x] Random direction movement (angle-based, not fixed position)
- [x] Idle duration 10-20 seconds between movements
- [x] Screen boundary protection (pet never leaves screen)
- [x] Sprite flips correctly based on movement direction

### Phase 2.1: Sprite Animation System (Complete)
- [x] Sprite sheet animation system
- [x] Multiple animation states (idle, walk, sleep, happy, drag)
- [x] Auto-detect frame size from sprite dimensions
- [x] Aspect ratio preservation when rendering

### Phase 2.2: Animation Enhancement (Complete)
- [x] DeltaTime-based frame timing (accurate to config frameDuration)
- [x] Squish/bounce effects on sprites when landing
- [x] Optimized rendering (only redraw when frame changes, ~90% less CPU)
- [x] Drawing integrated into game loop

### Phase 2.3: Skin System (Planned)
- [ ] System tray menu for skin selection
- [ ] Multiple pet skins
- [ ] Skin preference persistence

### Phase 3.1: Settings Infrastructure (Complete)
- [x] File system storage (~/.ipet/settings.json)
- [x] Settings types and service layer
- [x] useSettings React hook

### Phase 3.2: Settings UI & System Tray (Complete)
- [x] System tray icon with menu
- [x] Beautiful Settings window (glassmorphism design)
- [x] Dark/light theme (follows system preference)
- [x] Personality presets (Bubbles, Sage, Drowsy, Custom)
- [x] Microphone and storage configuration

### Phase 3.3-3.7: AI Integration (Planned)
- [ ] Voice input via microphone (double-click to activate)
- [ ] Gemini AI integration for responses
- [ ] Conversation history with retention
- [ ] Speech bubble responses

### Phase 4: Polish & Distribution (Planned)
- [ ] Error handling
- [ ] macOS code signing
- [ ] DMG packaging
- [ ] GitHub releases

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Tauri 2.0 (Rust)
- **AI**: Google Gemini API (planned)

## Development

### Prerequisites
- Node.js 18+
- Rust
- macOS 10.15+

### Setup
```bash
npm install
```

### Run Development
```bash
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

## Project Structure

```
ipet/
├── src/                    # React frontend
│   ├── components/
│   │   ├── Pet/           # Pet component
│   │   └── Settings/      # Settings panel (glassmorphism UI)
│   ├── hooks/
│   │   ├── useSprite.ts   # Sprite loading hook
│   │   └── useSettings.ts # Settings management hook
│   ├── services/
│   │   ├── PetBehavior.ts # Pet state machine
│   │   ├── SpriteLoader.ts # Sprite loading service
│   │   └── SettingsService.ts # Settings persistence
│   └── types/             # TypeScript types
├── src-tauri/             # Rust backend
│   ├── src/
│   │   └── lib.rs         # Tauri commands + settings
│   └── tauri.conf.json    # Window config (main + settings)
├── settings.html          # Settings window entry
└── public/
    └── sprites/           # Sprite assets
        └── slime/         # Slime skin sprites
```

## License

MIT
