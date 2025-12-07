# iPet - macOS Desktop Pet 🐾

A kawaii slime pet that lives on your desktop, powered by Tauri + React + TypeScript + Gemini AI.

![iPet Demo](docs/demo.gif)

## Features

### Desktop Pet
- [x] Transparent window always on top
- [x] 19 animations with mood-based variations
- [x] Spring physics bounce when dropped
- [x] Random wandering movement
- [x] Click reactions

### Mood System
- [x] Two core stats: Happiness (0-100) and Energy (0-100)
- [x] Time-based decay with random delays
- [x] Sleep/wake cycles with yawn/wake transitions
- [x] Visual mood indicator bars
- [x] Happiness bar + Energy bar below pet (toggleable in Settings)
- [x] Mood-based idle animations (ecstatic, happy, sad, angry)
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
- [x] Toggle energy bar & happiness bar visibility

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
| ✅ | **Click** | Left click | Pet jumps happily (+5 😊, +1 ⚡) | 3s |
| ✅ | **Drag** | Hold & drag | Move pet (-5 😊, -5 ⚡) | - |
| ✅ | **Voice** | `V` | Talk to pet via AI (+15 😊, -5 ⚡) | 5s |
| ✅ | **Dance** | `D` | Pet dances with music notes (+15 😊, -15 ⚡) | 60s |
| ✅ | **Treat** | `T` | Give treat with eating animation (+10 😊, +8 ⚡) | 10s, 10x/day |
| ✅ | **Lullaby** | `L` | Sing pet to sleep (+5 😊) | 60s |
| ✅ | **Play Catch** | `C` | Play catch with bouncy animation (+12 😊, -10 ⚡) | 30s |
| ✅ | **Shake** | `S` | Gentle shake wiggle (+5 😊, +3 ⚡) | 3s |
| ✅ | **Quiet Time** | - | Let pet rest (+8 😊, +10 ⚡) | 3m |

### Mood System

Your pet has 2 core stats:
- **😊 Happiness (0-100)**: Joy level - decays over time
- **⚡ Energy (0-100)**: Stamina - decreases with activities, recovers while sleeping

**Pet Behavior & Animations:**
| Happiness | Energy | Idle Animation |
|-----------|--------|----------------|
| 80+ | any | Ecstatic (sparkles) |
| 60-79 | any | Happy (smiling) |
| 40-59 | any | Normal |
| < 40 | any | Sad |
| any | < 20 | Angry (exhausted) |
| any | auto-sleep | Yawn → Sleep → Wake |

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

### Balance Philosophy

The interaction system is designed with these principles:

| Principle | Description |
|-----------|-------------|
| 🎯 **Diversify** | Use multiple interaction types, not just spam one |
| ⚖️ **Risk-Reward** | Fun activities (dance, play) cost energy → need rest/treat balance |
| 🧘 **Patience Pays** | Quiet time gives good rewards for letting pet rest |
| 🚫 **Gentle Care** | Dragging pet too much hurts their mood significantly |

**Energy Levels:**
| Level | Range | Pet Behavior |
|-------|-------|--------------|
| Hyperactive | 75-100 | Full of energy, ready for anything! |
| Energetic | 55-74 | Happy and playful |
| Normal | 30-54 | Content, may need a snack |
| Tired | 10-29 | Sluggish, prefers rest |
| Exhausted | 0-9 | Forced sleep triggered |

### Tips & Tricks

| Tip | Description |
|-----|-------------|
| 🌙 Auto Sleep | Pet auto-sleeps when energy < 10 - give treats for quick recovery |
| 🎵 Lullaby | Use when pet is too hyper, helps them rest |
| 🧘 Quiet Time | Best way to restore energy without losing happiness |
| 💬 Voice Chat | Talk frequently to keep your pet happy! |
| 🎯 Combo | Dance → Quiet Time → Treat to maximize both stats |
| ⚠️ Don't Spam | Each interaction has diminishing returns if overused |

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
│   │   ├── EnergyBar/        # Energy bar UI
│   │   ├── HappinessBar/     # Happiness bar UI
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
- [x] Desktop pet with 19 animations
- [x] Voice input + Gemini AI
- [x] Settings system
- [x] Glassmorphism speech bubble
- [x] Pet mood system (happiness, energy, sleep cycles)
- [x] Interaction cooldowns with rejection feedback
- [x] Mood-based idle animations (ecstatic, happy, sad, angry)
- [x] Interaction animations (eat, dance, yawn, wake, talk)
- [x] Happiness & Energy bar UI

### In Progress
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