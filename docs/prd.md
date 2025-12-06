# iPet - macOS Desktop Pet Application

## Tổng quan
App macOS hiển thị cute slime pet di chuyển tự do trên desktop, tương tác với user qua voice input và trả lời bằng emoji/animation thông qua Gemini AI.

---

## Tech Stack: **Tauri 2.0 + React + TypeScript**

### Lý do chọn Tauri:
| Tiêu chí | Tauri | Electron | Swift |
|----------|-------|----------|-------|
| App Size | ~3 MB | ~100 MB | ~10 MB |
| Memory | 30-50 MB | 100+ MB | 20-40 MB |
| Learning Curve | Medium | Low | High |
| Transparent Window | Good | Hacky | Native |
| App Store | Supported | Complex | Easiest |

**Lợi thế:**
- Project tham khảo: [WindowPet](https://github.com/SeakMengs/WindowPet)
- Dùng TypeScript/React (web tech quen thuộc)
- App nhẹ, performance tốt
- Hỗ trợ transparent window + always-on-top

---

## Core Features

### 1. Pet Movement & Display
- Transparent window luôn ở trên tất cả apps
- Pet di chuyển tự do trong screen bounds
- Animation states: idle, walk, sleep, happy, talk, drag
- Sprite sheet animation với Canvas 2D

### 2. User Interactions
| Action | Behavior |
|--------|----------|
| Click | Pet react với animation vui (happy/curious) |
| Double-click | Bật voice input, pet lắng nghe |
| Drag | Kéo pet đến vị trí mới |
| System Tray | Click tray icon → Settings panel |

### 3. AI Integration (Gemini)
- **Voice Input**: Double-click → record mic → gửi audio to Gemini
- **Personality System**: Preset personalities (Cheerful, Wise, Sleepy)
- **Response**: Emotion + Animation + Emojis + Short text (3-4 từ max)
- **Memory**: Conversation history, context window ~20 messages
- **NO TTS**: Chỉ visual response

### 4. Personality Presets
- **Bubbles (Cheerful)**: Vui vẻ, hay dùng emoji, năng động
- **Sage (Wise)**: Điềm tĩnh, thích chia sẻ kiến thức
- **Drowsy (Sleepy)**: Hay ngủ, dễ thương, chậm rãi

---

## Implementation Phases

### Phase 1: Foundation
Pet xuất hiện và di chuyển trên màn hình
- [ ] Tauri 2.0 project setup
- [ ] Transparent window, always-on-top
- [ ] Canvas rendering
- [ ] Idle state + random wandering
- [ ] Drag-and-drop
- [ ] Screen boundary detection

### Phase 2: Sprite & Animation
Slime cute với animations mượt
- [ ] Sprite sheet (Google Imagen 3.0, cartoon style)
- [ ] AnimationEngine (frame-based)
- [ ] All animation states
- [ ] SkinManager
- [ ] Color variations
- [ ] Click reaction

### Phase 3: AI Integration
Pet nói chuyện với user qua voice
- [ ] AudioService (mic recording)
- [ ] Double-click → listening
- [ ] Gemini API (gemini-2.0-flash-exp)
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

## Quyết định đã xác nhận
- **Gemini model**: gemini-2.0-flash-exp
- **Response style**: Emoji + Animation + Short text (3-4 từ)
- **Settings**: System tray icon → Settings panel
- **Sprite style**: Cartoon/Vector
- **Tech stack**: Tauri 2.0 + React + TypeScript
