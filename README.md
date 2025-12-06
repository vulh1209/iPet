# iPet - macOS Desktop Pet 🐾

A kawaii slime pet that lives on your desktop, powered by Tauri + React + TypeScript + Gemini AI.

![iPet Demo](docs/demo.gif)

## Features

### Desktop Pet
- [x] Transparent window always on top
- [x] Multiple animations (idle, walk, happy, sleep, drag, curious, reject)
- [x] Spring physics bounce when dropped
- [x] Random wandering movement
- [x] Click reactions

### Mood System
- [x] Two core stats: Happiness (0-100) and Energy (0-100)
- [x] Time-based decay with random delays
- [x] Sleep/wake cycles (pet gets tired and naps!)
- [x] Visual mood indicator bars
- [x] 10 creative interactions with cooldowns

### Voice Interaction
- [x] Press **"V"** to activate voice input
- [x] AI-powered responses via Google Gemini
- [x] Short kawaii responses (3 words + emojis)
- [x] Beautiful glassmorphism speech bubble

### Settings
- [x] System tray menu
- [x] Personality presets (Bubbles, Sage, Drowsy, Custom)
- [x] Dark/light theme support
- [x] Configurable API key

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

## Usage Guide

### Basic Interactions

| Status | Action | Key/Mouse | Effect | Cooldown |
|--------|--------|-----------|--------|----------|
| ✅ | **Click** | Left click | Pet jumps happily | - |
| ✅ | **Drag** | Hold & drag | Move pet anywhere (wakes up if sleeping) | - |
| ✅ | **Voice** | `V` | Talk to pet via AI | - |
| ✅ | **Dance** | `D` | Pet dances (+15 😊, -15 ⚡) | 30s |
| ✅ | **Treat** | `T` | Give treat (+8 😊, +10 ⚡) | 5x/day |
| ✅ | **Lullaby** | `L` | Sing pet to sleep | - |
| ⬚ | **Tickle** | `K` | Tickle pet (+5 😊, -3 ⚡) | 10s |
| ⬚ | **Story** | `S` | Tell a story (+12 😊, -8 ⚡) | 60s |
| ⬚ | **Play** | `P` | Play together (+10 😊, -12 ⚡) | 20s |
| ⬚ | **Meditate** | `M` | Meditate (+5 😊, +15 ⚡) | 45s |
| ⬚ | **Compliment** | `C` | Give compliment (+8 😊) | 15s |

### Mood System

Your pet has 2 core stats:
- **😊 Happiness (0-100)**: Joy level - decays over time
- **⚡ Energy (0-100)**: Stamina - decreases with activities, recovers while sleeping

**Pet Behavior States:**
| Happiness | Energy | Behavior |
|-----------|--------|----------|
| > 70 | > 50 | Happy, playful, bouncy |
| 30-70 | > 30 | Normal |
| < 30 | any | Sad, moves less |
| any | < 20 | Auto-sleeps 💤 |

### Voice Chat

1. Press `V` to start recording
2. Say your question or greeting to pet
3. Wait for pet to respond with a cute speech bubble
4. Pet replies in short kawaii style (3 words + emoji)

**Note:** Configure your Gemini API key in Settings before using voice chat.

### Cooldown & Rejection

- Each interaction has its own cooldown (see table above)
- When on cooldown or low energy → shows ❌ icon and pet shakes head
- Hover over pet to see current Happiness/Energy bars

### Tips & Tricks

| Tip | Description |
|-----|-------------|
| 🌙 Auto Sleep | Pet auto-sleeps when energy < 20 - give treats for quick recovery |
| 🎵 Lullaby | Use when pet is too hyper, helps them rest |
| 🧘 Meditate | Best way to restore energy without losing happiness |
| 💬 Voice Chat | Talk frequently to keep your pet happy! |
| 🎯 Combo | Dance → Meditate → Treat to maximize both stats |

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

### Completed
- [x] Desktop pet with animations
- [x] Voice input + Gemini AI
- [x] Settings system
- [x] Glassmorphism speech bubble
- [x] Pet mood system (happiness, energy, sleep cycles)
- [x] Interaction cooldowns with rejection feedback

### In Progress
- [ ] Additional keyboard interactions (K, S, P, M, C)
- [ ] Multiple pet skins

### Planned
- [ ] macOS code signing
- [ ] Windows/Linux support

### Future Vision: Tiny Assistant 🤖
Transform your pet into a helpful desktop companion that can:

| Feature | Description |
|---------|-------------|
| 🌐 **Browser Control** | Open websites, search Google, bookmark pages |
| 🎵 **Music Player** | Play/pause Spotify, skip tracks, adjust volume |
| 📁 **File Operations** | Open apps, find files, quick launch |
| 📅 **Reminders** | Set timers, show notifications, daily briefings |
| 💬 **Smart Commands** | "Hey pet, play some music" / "Open my project" |
| 🔗 **App Integration** | Control Slack, Discord, VS Code via voice |

### Future Vision: Web3 & Blockchain ⛓️
Evolve your pet into a crypto-native companion:

| Feature | Description |
|---------|-------------|
| 💰 **Wallet Watcher** | Monitor ETH/token balances, alert on big moves |
| 📊 **Price Alerts** | "Hey pet, notify me when ETH hits $4000" |
| 🔔 **On-chain Notifications** | Track NFT sales, airdrops, contract events |
| 🎨 **NFT Pet Skins** | Own unique pet appearances as NFTs |
| 🏆 **Achievement NFTs** | Mint badges for milestones (100 conversations, etc.) |
| 💸 **Gas Tracker** | Real-time gas prices, suggest optimal tx times |
| 🤝 **Wallet Connect** | Sign transactions via pet interface |
| 🎮 **Play-to-Earn** | Earn tokens by caring for your pet daily |
| 🌐 **Multi-chain** | Support Ethereum, Polygon, Solana, etc. |

## License

MIT

---

Made with 💕 From SIPHER dev