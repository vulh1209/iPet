# Phase 2.2: Animation Enhancement - Implementation Plan

## Overview

Cải thiện animation timing và effects cho sprite system đã có từ Phase 2.1.

## Goals

1. **DeltaTime-based frame timing** - Frame animation chính xác theo config thay vì frame counter
2. **Squish/bounce effects** - Áp dụng squish effect lên sprites khi landing
3. **Animation time tracking** - Track thời gian animation trong state machine

---

## Current State (Phase 2.1)

### Đã có:
- Sprite loading system (`SpriteLoader.ts`, `useSprite.ts`)
- Sprite rendering trong `Pet.tsx`
- Animation config với `frameDuration` trong `config.json`
- `animationTimeRef` đã được tạo trong Pet.tsx
- `getFrameIndex()` function đã có trong SpriteLoader.ts

### Vấn đề hiện tại:
- Frame timing dùng `frameCount % 10` (không chính xác)
- Squish effect đã có code nhưng cần verify hoạt động đúng
- Animation time reset khi animation thay đổi (đã có nhưng cần verify)

---

## Implementation Steps

### Step 1: Verify Animation Time Tracking

**File:** `src/components/Pet/Pet.tsx`

Kiểm tra code hiện tại (lines 74-80):
```typescript
// Reset animation time when animation changes
if (result.animation !== lastAnimationRef.current) {
  animationTimeRef.current = 0;
  lastAnimationRef.current = result.animation;
} else {
  animationTimeRef.current += deltaTime;
}
```

**Action:** Verify này hoạt động đúng - animation time reset khi chuyển state.

---

### Step 2: Remove Old Frame Counter

**File:** `src/components/Pet/Pet.tsx`

Xóa hoặc chỉ giữ cho procedural fallback:
```typescript
// OLD - chỉ cần cho procedural fallback
frameCount++;
if (frameCount % 10 === 0) {
  setFrame(f => (f + 1) % 4);
}
```

**Action:** Giữ lại cho procedural fallback, nhưng sprite rendering dùng `animationTimeRef`.

---

### Step 3: Update Canvas Redraw Trigger

**File:** `src/components/Pet/Pet.tsx`

Hiện tại canvas redraw trigger bởi `[frame, animation, direction, squishFactor, sprite, spriteLoading]`.

Vấn đề: `frame` state chỉ update mỗi 10 game frames, không đủ smooth cho sprite animation.

**Solution:** Thêm state để force redraw hoặc dùng ref + manual redraw.

```typescript
// Option A: Thêm animationTick state
const [animationTick, setAnimationTick] = useState(0);

// Trong game loop
setAnimationTick(t => t + 1); // Force redraw mỗi frame

// useEffect dependencies
}, [animationTick, animation, direction, squishFactor, sprite, spriteLoading]);
```

```typescript
// Option B: Move drawing vào game loop (recommended)
// Không dùng useEffect cho drawing, draw trực tiếp trong gameLoop
```

**Recommended:** Option B - move sprite drawing vào game loop để có control tốt hơn.

---

### Step 4: Refactor Drawing Logic

**File:** `src/components/Pet/Pet.tsx`

Move sprite drawing từ useEffect vào game loop:

```typescript
function gameLoop(timestamp: number) {
  // ... existing logic ...

  // Draw directly in game loop
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  if (ctx && sprite) {
    drawSprite(ctx, sprite, animation, direction, squishFactor, animationTimeRef.current);
  } else if (ctx) {
    drawProceduralSlime(ctx, animation, direction, frame, squishFactor);
  }
}
```

**Extract drawing to separate function:**
```typescript
function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: LoadedSprite,
  animation: AnimationType,
  direction: Direction,
  squishFactor: number,
  animationTime: number
) {
  const animDef = sprite.config.animations[animation];
  const spriteImage = sprite.images.get(animation);
  if (!animDef || !spriteImage) return false;

  const frameIndex = getFrameIndex(animationTime, animDef);
  const frameRect = getFrameRect(spriteImage, animDef.frames, frameIndex);

  ctx.clearRect(0, 0, WINDOW_SIZE, WINDOW_SIZE);
  ctx.save();

  // Direction flip
  if (direction === 'left') {
    ctx.translate(WINDOW_SIZE, 0);
    ctx.scale(-1, 1);
  }

  // Squish effect
  const centerX = WINDOW_SIZE / 2;
  const centerY = WINDOW_SIZE / 2;
  ctx.translate(centerX, centerY);
  ctx.scale(1 / squishFactor, squishFactor);
  ctx.translate(-centerX, -centerY);

  // Draw with aspect ratio
  const aspectRatio = frameRect.width / frameRect.height;
  let destWidth, destHeight, destX, destY;

  if (aspectRatio > 1) {
    destWidth = WINDOW_SIZE;
    destHeight = WINDOW_SIZE / aspectRatio;
    destX = 0;
    destY = (WINDOW_SIZE - destHeight) / 2;
  } else {
    destHeight = WINDOW_SIZE;
    destWidth = WINDOW_SIZE * aspectRatio;
    destX = (WINDOW_SIZE - destWidth) / 2;
    destY = 0;
  }

  ctx.drawImage(
    spriteImage,
    frameRect.x, frameRect.y, frameRect.width, frameRect.height,
    destX, destY, destWidth, destHeight
  );

  ctx.restore();
  return true;
}
```

---

### Step 5: Verify Squish Effect

**Current code (lines 138-143):**
```typescript
ctx.translate(centerX, centerY);
ctx.scale(1 / squishFactor, squishFactor);
ctx.translate(-centerX, -centerY);
```

**Verify:**
- `squishFactor > 1` → sprite cao hơn, hẹp hơn (stretch up)
- `squishFactor < 1` → sprite thấp hơn, rộng hơn (squish down)
- Volume preservation: `(1/squishFactor) * squishFactor = 1`

**Test:** Drop pet và observe squish animation.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Pet/Pet.tsx` | Refactor drawing logic, move to game loop |

## Files NOT Changed

| File | Reason |
|------|--------|
| `src/services/PetBehavior.ts` | Already returns squishFactor, no changes needed |
| `src/services/SpriteLoader.ts` | getFrameIndex already works correctly |
| `public/sprites/slime/config.json` | frameDuration already configured |

---

## Testing Checklist

- [ ] Idle animation plays at correct speed (200ms per frame = 5 FPS)
- [ ] Walk animation plays at correct speed (150ms per frame ≈ 6.7 FPS)
- [ ] Happy animation plays at correct speed (120ms per frame ≈ 8.3 FPS)
- [ ] Animation resets when state changes (idle → walk → idle)
- [ ] Squish effect visible when dropping pet
- [ ] Direction flip works correctly
- [ ] Procedural fallback still works when sprites removed

---

## Quick Start Commands

```bash
# Run dev
npm run tauri dev

# Test build
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

---

## Estimated Changes

- ~50 lines refactored in Pet.tsx
- No new files needed
- No breaking changes
