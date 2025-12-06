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

### Phase 3: AI Integration (Planned)
- [ ] Voice input via microphone (double-click to activate)
- [ ] Gemini AI integration for responses
- [ ] Personality system
- [ ] Emoji bubble responses
- [ ] System tray + settings panel

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
│   │   └── Pet/           # Pet component
│   ├── hooks/
│   │   └── useSprite.ts   # Sprite loading hook
│   ├── services/
│   │   ├── PetBehavior.ts # Pet state machine
│   │   └── SpriteLoader.ts # Sprite loading service
│   └── types/             # TypeScript types
├── src-tauri/             # Rust backend
│   ├── src/
│   │   └── lib.rs         # Tauri commands
│   └── tauri.conf.json    # Window config
└── public/
    └── sprites/           # Sprite assets
        └── slime/         # Slime skin sprites
```

## License

MIT
