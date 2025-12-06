# 🎮 iPet Sprite Assets Guide

> Documentation cho việc tạo sprite assets bằng AI Image Generation (Google Gemini/Imagen)

---

## 📋 Tổng Quan

### Thông Tin Project
| Property | Value |
|----------|-------|
| Project | iPet - macOS Desktop Pet |
| Style | **Chibi Cute / Kawaii** |
| Character | Slime blob dễ thương |
| Target Path | `/public/sprites/slime/` |

### Cấu Trúc Files

```
public/
└── sprites/
    └── slime/
        ├── config.json      # Sprite configuration
        ├── idle.png         # 4 frames (512×128)
        ├── walk.png         # 4 frames (512×128)
        ├── sleep.png        # 2 frames (256×128)
        ├── happy.png        # 4 frames (512×128)
        ├── talk.png         # 4 frames (512×128)
        ├── curious.png      # 2 frames (256×128)
        └── drag.png         # 2 frames (256×128)
```

---

## 🎨 Art Style Specification

### Chibi Cute Style Guidelines

```yaml
Style: Chibi Cute / Kawaii Japanese
Character Type: Slime blob (no limbs, moves by bouncing)

Body:
  - Shape: Round, soft, squishy blob
  - Proportion: Head/body ratio ~1:1 (very chibi)
  - Size: Fills ~70-80% of frame
  - Texture: Slightly glossy, translucent gel look

Colors:
  Main Body: "#7EC8E3" (soft pastel blue)
  Highlight: "#B5E4F7" (light blue shine)
  Shadow: "#5BA3C0" (subtle darker blue)
  Outline: "rgba(74, 144, 176, 0.6)" (soft blue-tinted outline, ~2px)
  Blush: "#FFB6C1" (light pink)
  Eyes: "#FFFFFF" white with "#2D2D2D" pupils

Face Features:
  - Eyes: VERY large (40-50% of face), round, shiny
  - Eye Highlights: 2 white dots (large + small)
  - Mouth: Simple, small, expressive
  - Blush: Soft pink ovals on cheeks
  - No nose

Effects:
  - Sparkles: Small 4-point stars "#FFFFFF"
  - Hearts: Pink "#FF6B9D"
  - Question mark: Light gray "#9CA3AF"
  - Zzz: Light blue "#A8D8EA"
```

### Technical Requirements

| Property | Value |
|----------|-------|
| Frame Size | 128×128 pixels |
| Format | PNG with transparency |
| Background | Fully transparent (alpha) |
| Direction | Character facing **RIGHT** |
| Color Depth | 32-bit RGBA |
| Style | Flat 2D vector, clean lines |

---

## 📊 Sprite Assets Table

| # | Filename | Frames | Dimensions | Animation |
|---|----------|--------|------------|-----------|
| 1 | `idle.png` | 4 | 512×128 | Breathing, blinking |
| 2 | `walk.png` | 4 | 512×128 | Bouncing movement |
| 3 | `sleep.png` | 2 | 256×128 | Sleeping with Zzz |
| 4 | `happy.png` | 4 | 512×128 | Joyful bouncing |
| 5 | `talk.png` | 4 | 512×128 | Mouth animation |
| 6 | `curious.png` | 2 | 256×128 | Head tilt with ? |
| 7 | `drag.png` | 2 | 256×128 | Stretched surprised |

---

## 🖼️ Prompts Chi Tiết

### 1. idle.png

**File:** `idle.png`  
**Path:** `public/sprites/slime/idle.png`  
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character in IDLE animation.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, no arms or legs
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: VERY large round eyes (50% of face), white with small black pupils
- Eye shine: Two white highlight dots in each eye (big + small)
- Mouth: Tiny cute smile
- Cheeks: Soft pink blush marks
- Outline: Soft rounded edges, no harsh lines
- Character facing RIGHT
- Chibi proportions: big head-to-body ratio

=== FRAME SEQUENCE (left to right) ===
Frame 1: Normal round shape, eyes open wide, happy resting face
Frame 2: Slightly squished down (exhale), eyes still open, content
Frame 3: Back to normal, eyes CLOSED with curved lines (^_^), blinking
Frame 4: Slightly taller/stretched (inhale), eyes open, peaceful

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Soft pastel colors, no harsh shadows
- Clean vector-style artwork
- Adorable and huggable appearance
- Consistent design across ALL frames
```

---

### 2. walk.png

**File:** `walk.png`  
**Path:** `public/sprites/slime/walk.png`  
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character WALKING/BOUNCING.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, no arms or legs
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: VERY large round eyes, white with small black pupils
- Eye shine: Two white highlight dots in each eye
- Mouth: Determined small smile
- Cheeks: Soft pink blush marks
- Character facing RIGHT (moving right direction)
- Bouncing locomotion (slimes hop to move!)

=== FRAME SEQUENCE (left to right) ===
Frame 1: Squished flat against ground, preparing to hop, focused cute expression
Frame 2: Stretching upward launching into air, body elongated, excited eyes
Frame 3: Mid-air bounce, perfectly round, biggest smile, tiny motion lines
Frame 4: Landing squish, flattened on impact, happy wobble face

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Show bouncy, jiggly movement
- Add tiny motion lines for bounce effect
- Soft pastel colors throughout
- Consistent character design all frames
```

---

### 3. sleep.png

**File:** `sleep.png`  
**Path:** `public/sprites/slime/sleep.png`  
**Size:** 256×128px (2 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character SLEEPING peacefully.

=== LAYOUT ===
- Exactly 2 frames in a horizontal row
- Total image: 256×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, slightly flattened (relaxed puddle)
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: CLOSED - shown as curved lines (∪ ∪) or (─ ─)
- Mouth: Tiny peaceful smile or small "o" (breathing)
- Cheeks: Soft pink blush marks (extra rosy when sleeping)
- Character facing RIGHT
- Floating "Z" or "Zzz" letters in light blue color

=== FRAME SEQUENCE (left to right) ===
Frame 1: Relaxed flat puddle shape, eyes closed peacefully, single small "z" floating up
Frame 2: Slightly puffed up (breathing in), eyes still closed, "Zz" floating, serene expression

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Very peaceful, cozy, adorable sleeping pose
- "Zzz" should be cute and stylized
- Soft dreamy atmosphere
- Consistent design between frames
```

---

### 4. happy.png

**File:** `happy.png`  
**Path:** `public/sprites/slime/happy.png`  
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character showing HAPPY/EXCITED emotion.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, extra bouncy and energetic
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Sparkling happy eyes! Either (^_^) squint or big shiny eyes with stars
- Mouth: BIG wide open smile showing pure joy
- Cheeks: Extra pink blush marks (very happy!)
- Character facing RIGHT
- Floating effects: tiny hearts ♥, stars ✦, sparkles around character

=== FRAME SEQUENCE (left to right) ===
Frame 1: Squished down with excitement, eyes squeezed happy (^_^), ready to celebrate
Frame 2: JUMPING up high with joy, eyes wide with sparkles, mouth open "yay!"
Frame 3: Peak of jump, perfectly round, maximum happiness, hearts and stars floating
Frame 4: Landing with happy bounce, still beaming smile, sparkle effects

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- MAXIMUM adorable energy and joy
- Lots of cute effect particles (♥ ✦ ✧)
- Soft pastel colors
- This should be the CUTEST happiest sprite!
```

---

### 5. talk.png

**File:** `talk.png`  
**Path:** `public/sprites/slime/talk.png`  
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character TALKING/CHATTING animation.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, slightly animated while talking
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Large expressive eyes, engaged and friendly
- Mouth: Changes shape for talking animation (key focus!)
- Cheeks: Soft pink blush marks
- Character facing RIGHT
- Optional: tiny speech bubble or "..." dots

=== FRAME SEQUENCE (left to right) ===
Frame 1: Mouth closed in smile, eyes bright and attentive, ready to speak
Frame 2: Mouth open small "o" shape, eyes engaged, starting to talk
Frame 3: Mouth open wider oval, animated expression, tiny "..." speech dots nearby
Frame 4: Mouth closing back to smile, eyes happy (^_^), finished speaking, slight nod

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Focus on mouth shapes for lip-sync effect
- Body can wobble slightly while talking
- Soft pastel colors
- Friendly, conversational appearance
```

---

### 6. curious.png

**File:** `curious.png`  
**Path:** `public/sprites/slime/curious.png`  
**Size:** 256×128px (2 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character showing CURIOUS/WONDERING expression.

=== LAYOUT ===
- Exactly 2 frames in a horizontal row
- Total image: 256×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, tilted to show curiosity
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: EXTRA EXTRA large eyes showing wonder and curiosity!
- Mouth: Small "o" shape (intrigued)
- Cheeks: Soft pink blush marks
- Character facing RIGHT
- Floating "?" question mark near head (light gray or blue)

=== FRAME SEQUENCE (left to right) ===
Frame 1: Body tilted to LEFT side, huge curious eyes, "?" starting to appear, "hmm?" expression
Frame 2: Body tilted to RIGHT side, eyes even BIGGER and rounder, full "?" visible, maximum curiosity

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Emphasize the adorable head tilt!
- Eyes should be comically large showing wonder
- "?" should be cute and rounded
- Soft pastel colors
```

---

### 7. drag.png

**File:** `drag.png`  
**Path:** `public/sprites/slime/drag.png`  
**Size:** 256×128px (2 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character being PICKED UP/DRAGGED.

=== LAYOUT ===
- Exactly 2 frames in a horizontal row
- Total image: 256×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, STRETCHED from being grabbed!
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Surprised/startled expression! (O_O) or dizzy (@_@)
- Mouth: Small surprised "o" or wavy worried line
- Cheeks: Soft pink blush marks
- Character facing RIGHT
- Sweat drop effect or motion lines showing distress

=== FRAME SEQUENCE (left to right) ===
Frame 1: Stretched VERTICALLY tall (being pulled up), big surprised eyes (O O), single sweat drop, "woah!" expression
Frame 2: Wobbling/jiggling from being held, slightly dizzy swirl eyes (@ @), cute worried expression but still adorable

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Show the STRETCHY squishy nature of slime!
- Still adorable even when startled
- Soft pastel colors
- Add comedy through exaggerated stretch
```

---

## 📝 Quick Reference Prompts

Bảng prompt rút gọn để copy nhanh:

| File | Short Prompt |
|------|--------------|
| `idle.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, IDLE animation: breathing & blinking. Pastel blue #7EC8E3, huge cute eyes, pink blush, facing right. Frames: normal→squished→blink→stretched. Transparent PNG, ultra cute style.` |
| `walk.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, WALKING/BOUNCING right. Pastel blue #7EC8E3, huge cute eyes, pink blush. Frames: crouch→launch→airborne→land squish. Motion lines, transparent PNG.` |
| `sleep.png` | `Chibi kawaii blue slime sprite sheet, 2 frames 256×128px, SLEEPING. Pastel blue #7EC8E3, closed eyes (─ ─), pink blush, facing right, floating "Zzz". Frames: flat with "z"→puffed with "Zz". Transparent PNG.` |
| `happy.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, HAPPY/EXCITED. Pastel blue #7EC8E3, sparkly eyes (^_^), big smile, pink blush, hearts & stars effects. Frames: crouch→jump→peak joy→land bounce. Transparent PNG.` |
| `talk.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, TALKING animation. Pastel blue #7EC8E3, expressive eyes, pink blush, facing right. Frames: closed mouth→small "o"→wide open + "..."→closing smile. Transparent PNG.` |
| `curious.png` | `Chibi kawaii blue slime sprite sheet, 2 frames 256×128px, CURIOUS expression. Pastel blue #7EC8E3, HUGE wondering eyes, small "o" mouth, floating "?", pink blush. Frames: tilt left→tilt right bigger eyes. Transparent PNG.` |
| `drag.png` | `Chibi kawaii blue slime sprite sheet, 2 frames 256×128px, being DRAGGED/PICKED UP. Pastel blue #7EC8E3, surprised eyes (O_O), sweat drop, stretched vertically. Frames: stretched surprised→wobbling dizzy (@_@). Transparent PNG.` |

---

## ⚙️ Config File

Sau khi tạo xong sprites, tạo file `config.json`:

```json
{
  "name": "Blue Slime",
  "version": "1.0.0",
  "frameSize": {
    "width": 128,
    "height": 128
  },
  "animations": {
    "idle": {
      "file": "idle.png",
      "frames": 4,
      "frameDuration": 200,
      "loop": true
    },
    "walk": {
      "file": "walk.png",
      "frames": 4,
      "frameDuration": 150,
      "loop": true
    },
    "sleep": {
      "file": "sleep.png",
      "frames": 2,
      "frameDuration": 500,
      "loop": true
    },
    "happy": {
      "file": "happy.png",
      "frames": 4,
      "frameDuration": 120,
      "loop": true
    },
    "talk": {
      "file": "talk.png",
      "frames": 4,
      "frameDuration": 150,
      "loop": true
    },
    "curious": {
      "file": "curious.png",
      "frames": 2,
      "frameDuration": 300,
      "loop": true
    },
    "drag": {
      "file": "drag.png",
      "frames": 2,
      "frameDuration": 100,
      "loop": true
    }
  },
  "defaultAnimation": "idle",
  "colors": {
    "main": "#7EC8E3",
    "highlight": "#B5E4F7",
    "shadow": "#5BA3C0",
    "blush": "#FFB6C1"
  }
}
```

---

## ✅ Checklist

### Trước khi tạo
- [ ] Đọc kỹ style guidelines
- [ ] Hiểu layout từng sprite sheet
- [ ] Chuẩn bị tool (Gemini/Imagen)

### Sau khi tạo mỗi file
- [ ] Kiểm tra đúng số frames
- [ ] Kiểm tra kích thước (128×128 mỗi frame)
- [ ] Kiểm tra transparent background
- [ ] Kiểm tra character nhìn sang PHẢI
- [ ] Kiểm tra consistent design giữa các frames

### Hoàn thành
- [ ] Copy tất cả PNG vào `public/sprites/slime/`
- [ ] Tạo `config.json`
- [ ] Test trong app

---

## 🔧 Post-Processing Tips

Nếu AI tạo không đúng kích thước:

```bash
# Resize về đúng kích thước với ImageMagick
convert idle.png -resize 512x128! idle.png
convert sleep.png -resize 256x128! sleep.png

# Hoặc dùng sips (macOS built-in)
sips -z 128 512 idle.png
sips -z 128 256 sleep.png
```

Nếu cần ghép frames riêng lẻ:

```bash
# Ghép 4 frames thành 1 strip
convert frame1.png frame2.png frame3.png frame4.png +append idle.png

# Ghép 2 frames
convert frame1.png frame2.png +append sleep.png
```

---

## 📚 References

- [WindowPet Project](https://github.com/SeakMengs/WindowPet) - Tham khảo implementation
- [Sprite Sheet Packer](https://www.codeandweb.com/texturepacker) - Tool ghép sprites
- [Kawaii Style Guide](https://design.tutsplus.com/tutorials/how-to-create-a-cute-kawaii-character--cms-25951)

---

*Generated for iPet Project - Desktop Pet Application*
