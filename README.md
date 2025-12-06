# iPet - macOS Desktop Pet 🐾

A kawaii slime pet that lives on your desktop, powered by Tauri + React + TypeScript + Gemini AI.

![iPet Demo](docs/demo.gif)

## Features

### Desktop Pet
- Transparent window always on top
- Multiple animations (idle, walk, happy, sleep, drag, curious, reject)
- Spring physics bounce when dropped
- Random wandering movement
- Click reactions

### Mood System
- Two core stats: Happiness (0-100) and Energy (0-100)
- Time-based decay with random delays
- Sleep/wake cycles (pet gets tired and naps!)
- Visual mood indicator bars
- 10 creative interactions with cooldowns

### Voice Interaction
- Press **"V"** to activate voice input
- AI-powered responses via Google Gemini
- Short kawaii responses (3 words + emojis)
- Beautiful glassmorphism speech bubble

### Settings
- System tray menu
- Personality presets (Bubbles, Sage, Drowsy, Custom)
- Dark/light theme support
- Configurable API key

## Quick Start

### Prerequisites
- Node.js 18+
- Rust
- macOS 10.15+

### Setup
```bash
# Install dependencies
npm install

# Run development
npm run tauri dev

# Build for production
npm run tauri build
```

### Configuration
1. Open Settings from system tray
2. Enter your Gemini API key
3. Choose a personality preset
4. Enable microphone access

## Usage

| Action | Result |
|--------|--------|
| Click | Pet reacts with happy animation |
| Drag | Move pet anywhere on screen (wakes up if sleeping) |
| Press **V** | Start voice input |
| Press **D** | Dance party (+15 happiness, -15 energy) |
| Press **T** | Give treat (+8 happiness, +10 energy, 5/day) |
| Press **L** | Lullaby (puts pet to sleep) |
| System Tray | Access settings |

### Cooldown Feedback
When an action is on cooldown or pet lacks energy, it shows a rejection animation with an X icon.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Tauri 2.0 (Rust)
- **AI**: Google Gemini 2.0 Flash Lite
- **Speech**: Web Speech API

## Project Structure

```
ipet/
├── src/                      # React frontend
│   ├── components/
│   │   ├── Pet/              # Pet component + animations
│   │   └── Settings/         # Settings UI (glassmorphism)
│   ├── hooks/
│   │   ├── useSprite.ts      # Sprite loading
│   │   ├── useSettings.ts    # Settings state
│   │   └── useVoiceInput.ts  # Voice recognition
│   ├── services/
│   │   ├── PetBehavior.ts    # Pet state machine
│   │   ├── GeminiService.ts  # AI integration
│   │   └── SpeechRecognitionService.ts
│   └── types/
├── src-tauri/                # Rust backend
│   └── src/lib.rs            # Tauri commands
├── public/sprites/           # Sprite assets
└── docs/                     # Documentation
    └── PRD.md                # Product requirements
```

## Roadmap

- [x] Desktop pet with animations
- [x] Voice input + Gemini AI
- [x] Settings system
- [x] Glassmorphism speech bubble
- [x] Pet mood system (happiness, energy, sleep cycles)
- [x] Interaction cooldowns with rejection feedback
- [ ] Multiple pet skins
- [ ] macOS code signing
- [ ] Windows/Linux support

## License

MIT

---

Made with 💕 by SIPHER
