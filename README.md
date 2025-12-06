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

### Phase 2: Sprite & Animation (Planned)
- [ ] Sprite sheet animation system
- [ ] Multiple animation states (idle, walk, sleep, happy, talk)
- [ ] Skin system for different pets

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
│   ├── services/          # Business logic
│   │   └── PetBehavior.ts # Pet state machine
│   └── types/             # TypeScript types
├── src-tauri/             # Rust backend
│   ├── src/
│   │   └── lib.rs         # Tauri commands
│   └── tauri.conf.json    # Window config
└── public/                # Static assets
```

## License

MIT
