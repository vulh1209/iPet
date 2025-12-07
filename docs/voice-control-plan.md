# Voice Control cho iPet

## Tổng quan
Thêm tính năng điều khiển pet bằng giọng nói với các lệnh: chạy trái/phải, đi, nhảy, dừng.

## Cách tiếp cận
- Tạo `VoiceCommandService` để parse transcript thành commands
- Chặn transcript **trước khi** gửi đến Gemini nếu phát hiện command
- Thêm states mới vào `PetBehavior`: `voice_moving`, `voice_running`, `jumping`
- Jump sử dụng physics simulation (không cần sprite mới)

---

## Files cần thay đổi

### 1. NEW: `src/services/VoiceCommandService.ts`
Command parser với Vietnamese/English patterns:
```
"chạy trái/phải", "đi trái/phải" → move left/right
"chạy", "chạy nhanh" → run (current direction)
"nhảy", "jump" → jump
"dừng", "stop" → stop
```

### 2. `src/types/settings.ts`
- Thêm `voice_commands_enabled: boolean` vào `MicrophoneConfig`

### 3. `src/hooks/useVoiceInput.ts`
- Thêm `onCommandDetected?: (command) => void` callback
- Parse transcript cho commands trước khi gửi Gemini
- Return early nếu là command (không gọi Gemini)

### 4. `src/services/PetBehavior.ts`
Thêm:
- States: `'voice_moving' | 'voice_running' | 'jumping'`
- Properties: `jumpVelocity`, `jumpOffset`, jump physics constants
- Methods:
  - `onVoiceMove(direction, isRunning)` - di chuyển theo hướng
  - `onVoiceStop()` - dừng lại
  - `onVoiceJump()` - nhảy với physics
- Handlers: `handleVoiceMovingState()`, `handleJumpingState()`

### 5. `src/components/Pet/Pet.tsx`
- Import `VoiceCommandService`
- Tạo `handleVoiceCommand` callback
- Pass callback vào `useVoiceInput`

### 6. `src/components/Settings/Settings.tsx`
- Thêm toggle cho "Voice Commands"

### 7. `src-tauri/src/lib.rs`
- Thêm `voice_commands_enabled` vào `MicrophoneConfig` struct

---

## Chi tiết Implementation

### VoiceCommandService Pattern Matching
```typescript
export interface VoiceCommand {
  id: string;
  patterns: RegExp[];
  action: CommandAction;
  category: 'movement' | 'action' | 'control';
}

export type CommandAction =
  | { type: 'move'; direction: 'left' | 'right' }
  | { type: 'run'; direction?: 'left' | 'right' }
  | { type: 'stop' }
  | { type: 'jump' }
  | { type: 'dance' }
  | { type: 'eat' }
  | { type: 'sleep' };

const VOICE_COMMANDS: VoiceCommand[] = [
  {
    id: 'walk_left',
    patterns: [/đi\s*(sang\s*)?(bên\s*)?trái/i, /walk\s+left/i],
    action: { type: 'move', direction: 'left' },
    category: 'movement'
  },
  {
    id: 'walk_right',
    patterns: [/đi\s*(sang\s*)?(bên\s*)?phải/i, /walk\s+right/i],
    action: { type: 'move', direction: 'right' },
    category: 'movement'
  },
  {
    id: 'run_left',
    patterns: [/chạy\s*(sang\s*)?(bên\s*)?trái/i, /run\s+left/i],
    action: { type: 'run', direction: 'left' },
    category: 'movement'
  },
  {
    id: 'run_right',
    patterns: [/chạy\s*(sang\s*)?(bên\s*)?phải/i, /run\s+right/i],
    action: { type: 'run', direction: 'right' },
    category: 'movement'
  },
  {
    id: 'run',
    patterns: [/chạy(\s+nhanh)?/i, /^run$/i],
    action: { type: 'run' },
    category: 'movement'
  },
  {
    id: 'stop',
    patterns: [/dừng(\s+lại)?/i, /stop/i, /đứng\s*(lại|yên)/i],
    action: { type: 'stop' },
    category: 'control'
  },
  {
    id: 'jump',
    patterns: [/nhảy/i, /jump/i],
    action: { type: 'jump' },
    category: 'action'
  },
  {
    id: 'dance',
    patterns: [/nhảy\s*múa/i, /dance/i, /múa/i],
    action: { type: 'dance' },
    category: 'action'
  },
];

export class VoiceCommandService {
  static parseTranscript(transcript: string): ParseResult {
    const normalized = transcript.toLowerCase().trim();

    for (const command of VOICE_COMMANDS) {
      for (const pattern of command.patterns) {
        if (pattern.test(normalized)) {
          return {
            isCommand: true,
            command,
            originalText: transcript,
          };
        }
      }
    }

    return {
      isCommand: false,
      originalText: transcript,
    };
  }
}
```

### Jump Physics (không cần sprite mới)
```typescript
// Sử dụng animation 'happy' + squish effect
private readonly JUMP_VELOCITY = -400;  // Vận tốc ban đầu (lên)
private readonly JUMP_GRAVITY = 1200;   // Trọng lực
private jumpVelocity: number = 0;
private jumpOffset: number = 0;

private handleJumpingState(deltaTime: number): BehaviorResult {
  const dt = deltaTime / 1000;

  // Apply gravity
  this.jumpVelocity += this.JUMP_GRAVITY * dt;
  this.jumpOffset += this.jumpVelocity * dt;

  // Squish effect: stretch when rising, compress when falling
  const squishFactor = 1 - (this.jumpVelocity / 2000);

  // Landing when offset >= 0 and moving down
  if (this.jumpOffset >= 0 && this.jumpVelocity > 0) {
    this.jumpOffset = 0;
    this.jumpVelocity = 0;
    this.landingBaseY = this.position.y;
    this.landingOffset = 0;
    this.landingVelocity = 150; // Small bounce
    this.transitionTo('landing');
    return this.handleLandingState(deltaTime);
  }

  return {
    position: { x: this.position.x, y: this.position.y + this.jumpOffset },
    animation: 'happy',
    direction: this.direction,
    squishFactor: Math.max(0.75, Math.min(1.25, squishFactor)),
  };
}

onVoiceJump(): void {
  const canJump = ['idle', 'voice_moving', 'wandering'].includes(this.currentState);
  if (!canJump) return;

  this.jumpVelocity = this.JUMP_VELOCITY;
  this.jumpOffset = 0;
  this.transitionTo('jumping');
}
```

### useVoiceInput Integration
```typescript
// Trong handleResult callback:
const handleResult = useCallback(async (result: SpeechRecognitionResult) => {
  if (!result.isFinal) return;

  const text = result.transcript.trim();
  if (!text) {
    setState('idle');
    return;
  }

  setTranscript(text);

  // Check for voice command first
  if (settings.microphone.voice_commands_enabled) {
    const parseResult = VoiceCommandService.parseTranscript(text);
    if (parseResult.isCommand && parseResult.command) {
      onCommandDetected?.(parseResult.command);
      setState('idle');
      return;  // Don't send to Gemini
    }
  }

  // Existing: Send to Gemini for chat
  setState('processing');
  const geminiResponse = await geminiService.chat(text);
  // ...
}, [settings.microphone.voice_commands_enabled, onCommandDetected]);
```

---

## Thứ tự Implementation

1. **Types & Settings** - Thêm `voice_commands_enabled`
2. **VoiceCommandService** - Command patterns & parser
3. **PetBehavior** - States, methods, handlers cho voice control
4. **useVoiceInput** - Intercept commands
5. **Pet.tsx** - Integration
6. **Settings.tsx** - UI toggle
7. **lib.rs** - Rust backend settings

---

## Testing Checklist

- [ ] Vietnamese commands: "chạy trái", "chạy phải", "đi trái", "đi phải"
- [ ] Vietnamese run: "chạy", "chạy nhanh"
- [ ] Vietnamese stop: "dừng", "dừng lại", "đứng lại"
- [ ] Vietnamese jump: "nhảy"
- [ ] English fallbacks: "walk left", "run right", "stop", "jump"
- [ ] Command vs chat distinction (non-command text goes to Gemini)
- [ ] Jump physics and landing transition
- [ ] Voice commands disabled respects setting
- [ ] Integration with mood system (dance, eat, sleep)
