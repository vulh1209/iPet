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
        ├── drag.png         # 2 frames (256×128)
        ├── reject.png       # 4 frames (512×128)
        └── angry.png        # 4 frames (512×128)
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
| 8 | `reject.png` | 4 | 512×128 | Pouting, shaking head |
| 9 | `angry.png` | 4 | 512×128 | Grumpy/hangry idle |

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

### 8. reject.png

**File:** `reject.png`
**Path:** `public/sprites/slime/reject.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character showing REJECT/REFUSING/POUTING expression.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, puffed up with annoyance
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Annoyed/pouty expression - either (>_<) squeezed shut OR flat unhappy eyes (−_−)
- Mouth: Pouty frown, small upset line, or wavy dissatisfied mouth
- Cheeks: Extra pink blush marks (embarrassed/annoyed pink!)
- Character facing RIGHT
- Floating effects: Small anger vein mark (💢), puff clouds, or cross symbol

=== FRAME SEQUENCE (left to right) ===
Frame 1: Body puffed up bigger than normal, eyes closed tight (>_<), small pout mouth, tiny anger vein (💢) appears, "hmph!" pose
Frame 2: Shaking/wobbling LEFT, eyes still squeezed (><), bigger pout, cheeks puffed out with air, rejecting gesture
Frame 3: Shaking/wobbling RIGHT, flat annoyed eyes (−_−), turning head away slightly, "no way!" expression, puff cloud effect
Frame 4: Settling back to center, still pouty but slightly deflated, eyes half-closed with attitude (¬_¬), lingering small pout

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- ADORABLE pouting - must still look huggable even when upset!
- "Tsundere" style rejection - cute angry, not scary
- Emphasize the puffed cheeks and wobbling motion
- Soft pastel colors throughout
- Add tiny comedy effects (anger vein 💢, puff clouds)
- This should make users go "aww so cute when angry!"
```

---

### 9. angry.png

**File:** `angry.png`
**Path:** `public/sprites/slime/angry.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character showing ANGRY/GRUMPY/LOW ENERGY expression.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, slightly deflated/droopy (tired angry)
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7 (slightly desaturated)
- Eyes: Grumpy/irritated expression - furrowed brow lines, half-lidded annoyed eyes (−_−) or (¬_¬)
- Mouth: Grumpy frown, small dissatisfied line, or pouty "hmph" shape
- Cheeks: Pink blush marks but with small anger vein (💢)
- Character facing RIGHT
- Floating effects: Small storm cloud ⛈️, anger vein 💢, or tired sweat drop
- Overall vibe: "I'm tired AND annoyed, feed me!"

=== FRAME SEQUENCE (left to right) ===
Frame 1: Slightly deflated/droopy body, grumpy half-lidded eyes (−_−), small frown, tiny storm cloud forming above
Frame 2: Body puffs up slightly with irritation, eyes narrow more (¬_¬), anger vein 💢 appears, "hmph" mouth
Frame 3: Wobbles grumpily, eyes still annoyed, storm cloud bigger, maybe tiny lightning bolt, extra pouty
Frame 4: Settles back to deflated droopy pose, tired angry eyes, small sigh effect, waiting to be fed

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- ADORABLE grumpy - like a hungry child, must still be huggable!
- "Hangry" (hungry + angry) vibe
- Mix of tiredness and mild irritation
- Soft pastel colors but with grumpy expression
- Add tiny comedy effects (storm cloud, 💢, sweat drop)
- This should make users feel "aww poor baby needs energy!"
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
| `reject.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, REJECT/POUTING animation. Pastel blue #7EC8E3, squeezed annoyed eyes (>_<), pouty frown, puffed cheeks, pink blush, facing right. Frames: puffed up "hmph"→shake left→shake right turning away→settling pouty. Tiny anger vein 💢, puff clouds. Transparent PNG, tsundere cute style.` |
| `angry.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, ANGRY/GRUMPY/LOW ENERGY expression. Pastel blue #7EC8E3, half-lidded annoyed eyes (−_−), grumpy frown, pink blush with anger vein 💢, facing right. Frames: droopy grumpy→puffed irritated→wobble pouty with storm cloud→deflated sigh. Transparent PNG, hangry cute style.` |

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
    },
    "reject": {
      "file": "reject.png",
      "frames": 4,
      "frameDuration": 150,
      "loop": false
    },
    "angry": {
      "file": "angry.png",
      "frames": 4,
      "frameDuration": 250,
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

## 🆕 New Animations (Phase 2-5)

Các animation mới để pet sống động hơn, theo thứ tự ưu tiên.

---

### 10. sad.png

**File:** `sad.png`
**Path:** `public/sprites/slime/sad.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character showing SAD/LONELY/NEGLECTED expression.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, slightly deflated/droopy (feeling down)
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7 (slightly desaturated/muted)
- Eyes: Sad droopy eyes, looking down or to the side, shiny with tears welling up
- Mouth: Small downturned frown, quivering lip, or (´;ω;`) expression
- Cheeks: Soft pink blush marks but with a single teardrop
- Character facing RIGHT
- Floating effects: Small dark cloud ☁️, single teardrop 💧, wilted sparkle
- Overall vibe: "I miss you... please come back and play with me"

=== FRAME SEQUENCE (left to right) ===
Frame 1: Slightly deflated, looking down with sad eyes (;_;), small frown, tiny dark cloud forming above
Frame 2: A single teardrop appears in corner of eye, body droops more, deeper frown
Frame 3: Tear falls down cheek 💧, eyes looking up hopefully (maybe owner will come?), slight quiver
Frame 4: Wipes tear away with body wobble, still sad but hopeful, waiting patiently

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- ADORABLE sadness - must make users feel "aww poor baby, I need to pet it!"
- Not depressing, just lonely and wanting attention
- Soft muted pastel colors
- Add sympathy-inducing effects (single tear, small cloud)
- This should trigger protective instincts in users!
```

---

### 11. idle_happy.png

**File:** `idle_happy.png`
**Path:** `public/sprites/slime/idle_happy.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character in HAPPY IDLE animation (content and cheerful resting state).

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, slightly bouncier than normal idle
- Color: Soft pastel blue #7EC8E3 with brighter highlight #B5E4F7
- Eyes: Sparkling happy eyes, bigger and shinier than normal, occasional (^_^) squint
- Mouth: Gentle happy smile, content expression
- Cheeks: Extra pink rosy blush marks ✨
- Character facing RIGHT
- Floating effects: Small occasional sparkles ✦, tiny floating heart ♥
- Overall vibe: "Life is good! I'm happy and content!"

=== FRAME SEQUENCE (left to right) ===
Frame 1: Happy round shape, sparkly eyes, content smile, tiny sparkle appears ✦
Frame 2: Slight happy bounce upward, eyes close in happy squint (^_^), blush brightens
Frame 3: Back to round, eyes open with sparkle effect, small heart floats up ♥
Frame 4: Gentle wobble, dreamy happy expression, sparkles fade, peaceful joy

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- More energetic than basic idle but not as intense as "happy" reaction
- Subtle sparkles and hearts (not overwhelming)
- Brighter, more saturated colors than normal idle
- Shows pet is well-cared-for and content
```

---

### 12. idle_ecstatic.png

**File:** `idle_ecstatic.png`
**Path:** `public/sprites/slime/idle_ecstatic.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character in ECSTATIC/OVERJOYED idle animation (maximum happiness resting state).

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, extra bouncy and energetic even while "idle"
- Color: Soft pastel blue #7EC8E3 with extra bright highlight #B5E4F7, almost glowing
- Eyes: MAXIMUM sparkle! Star-shaped highlights ★, or closed in pure bliss (≧◡≦)
- Mouth: BIG beaming smile, sometimes open with joy
- Cheeks: Very pink rosy blush marks, practically glowing!
- Character facing RIGHT
- Floating effects: Multiple hearts ♥♥, stars ★✦, sparkles everywhere!
- Overall vibe: "I AM THE HAPPIEST SLIME IN THE WORLD!!!"

=== FRAME SEQUENCE (left to right) ===
Frame 1: Bouncy round shape, eyes with star sparkles ★, huge smile, hearts floating ♥♥
Frame 2: Small excited hop, eyes closed in bliss (≧◡≦), sparkles burst outward ✦✦
Frame 3: Peak of mini-bounce, eyes wide with joy, multiple hearts and stars orbiting
Frame 4: Landing with joyful wobble, starry eyes, continuous sparkle aura, maximum happiness

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- MAXIMUM adorable energy - this pet is LOVED!
- Lots of floating effects (hearts, stars, sparkles) but balanced
- Brightest, most vibrant colors
- Shows pet has been extremely well-cared-for
- Should make users feel proud of taking good care of their pet!
```

---

### 13. walk_tired.png

**File:** `walk_tired.png`
**Path:** `public/sprites/slime/walk_tired.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character WALKING/BOUNCING while TIRED/LOW ENERGY.

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, slightly droopy and slower-looking
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7 (slightly desaturated)
- Eyes: Half-lidded tired eyes (−_−), droopy eyelids, occasional blink
- Mouth: Small tired frown or neutral line, maybe tiny yawn
- Cheeks: Soft pink blush marks with small sweat drop
- Character facing RIGHT (moving right but slowly)
- Floating effects: Small sweat drop 💧, tired puff clouds, maybe tiny "..."
- Overall vibe: "I'm so tired but I'm still trying my best..."

=== FRAME SEQUENCE (left to right) ===
Frame 1: Low squish preparing to hop, tired droopy eyes, small sweat drop, "ugh" expression
Frame 2: Slow stretch upward (less height than normal walk), eyes still tired, effort shown
Frame 3: Low mid-air, barely leaving ground, tired exhale puff, half-lidded eyes
Frame 4: Heavy landing squish, extra flat, tired wobble, small "..." appears

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- ADORABLE tiredness - should make users want to let pet rest
- Slower, heavier movement feel than normal walk
- Slightly muted colors showing low energy
- Add sympathy effects (sweat drop, tired puffs)
- Movement should feel like walking through molasses
```

---

### 14. eat.png

**File:** `eat.png`
**Path:** `public/sprites/slime/eat.png`
**Size:** 768×128px (6 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character EATING/MUNCHING animation.

=== LAYOUT ===
- Exactly 6 frames in a horizontal row
- Total image: 768×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, belly expands slightly when eating
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Happy anticipation → closed while chewing → satisfied sparkle
- Mouth: Opens WIDE to eat → chomping motion → happy satisfied smile
- Cheeks: Soft pink blush marks, cheeks puff when chewing
- Character facing RIGHT
- Floating effects: Small food sparkles, happy stars after eating
- Optional: Tiny food crumb particles

=== FRAME SEQUENCE (left to right) ===
Frame 1: Excited anticipation! Eyes wide and sparkling, mouth starting to open, "yay food!"
Frame 2: Mouth WIDE open (○), ready to nom, eyes squeezed with excitement
Frame 3: Chomping down! Mouth closed with food, eyes happy (^_^), cheeks puffed
Frame 4: Chewing motion 1 - cheeks moving left, content eyes, "nom nom" vibe
Frame 5: Chewing motion 2 - cheeks moving right, swallowing, small satisfied sound effect "♪"
Frame 6: Finished eating! Happy satisfied expression, slight belly bulge, sparkles of contentment ✦

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Focus on adorable chomping/chewing motion
- Cheeks should visibly puff and move while chewing
- Show anticipation → eating → satisfaction arc
- Add cute sound effect symbols (♪ ♫)
- Should make feeding the pet feel rewarding!
```

---

### 15. dance.png

**File:** `dance.png`
**Path:** `public/sprites/slime/dance.png`
**Size:** 1024×128px (8 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character DANCING animation.

=== LAYOUT ===
- Exactly 8 frames in a horizontal row
- Total image: 1024×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, bouncing and grooving rhythmically
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Joyful dancing eyes! Alternating between (^_^) and excited open eyes
- Mouth: Big happy smile, sometimes open singing along
- Cheeks: Extra pink blush marks from dancing excitement
- Character facing RIGHT but body sways left-right
- Floating effects: Musical notes ♪ ♫, sparkles, rhythm lines

=== FRAME SEQUENCE (left to right) ===
Frame 1: Bounce down preparing, excited eyes, musical note appears ♪
Frame 2: Bounce UP and lean LEFT, eyes closed happy (^_^), body tilts left
Frame 3: Peak of bounce, arms up motion (body stretched slightly), "woohoo!" expression
Frame 4: Bounce down and lean RIGHT, swaying motion, ♫ note floats
Frame 5: Bounce UP again, lean right this time, spinning sparkles
Frame 6: Wiggle wiggle! Body squishes side to side rapidly, dizzy happy eyes
Frame 7: Big bounce with twist, body rotates slightly, maximum joy expression
Frame 8: Landing pose, victorious/proud stance, sparkles and notes surround ♪♫✦

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Rhythmic bouncing motion - should feel like dancing to music!
- Lots of musical notes and rhythm effects
- Dynamic poses showing movement and energy
- This is a celebration animation - maximum fun!
- Should loop smoothly for extended dance parties
```

---

### 16. yawn.png

**File:** `yawn.png`
**Path:** `public/sprites/slime/yawn.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character YAWNING (pre-sleep transition).

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, stretching and settling down
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Getting droopy and sleepy, watering slightly from yawn
- Mouth: Big YAWN opening wide → closing peacefully
- Cheeks: Soft pink blush marks
- Character facing RIGHT
- Floating effects: Small "z" starting to appear, maybe tiny tear from yawn

=== FRAME SEQUENCE (left to right) ===
Frame 1: Starting to feel sleepy, eyes getting heavy, mouth starting to open for yawn
Frame 2: BIG YAWN! Mouth wide open (○), eyes squeezed shut, body stretches up slightly, tiny tear from yawning
Frame 3: Yawn continues, mouth still open but closing, eyes still shut, body starting to settle
Frame 4: Yawn finished, eyes half-lidded and sleepy, peaceful tired smile, small "z" appears, ready for sleep

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- ADORABLE sleepy yawn - contagiously cute!
- Big exaggerated yawn motion
- Transition from awake to sleepy state
- Soft, cozy feeling
- Should make users go "aww sleepy baby"
```

---

### 17. wake.png

**File:** `wake.png`
**Path:** `public/sprites/slime/wake.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character WAKING UP (post-sleep transition).

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, stretching and perking up
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Gradually opening from closed to fully awake and bright
- Mouth: Sleepy neutral → small stretch → happy awakened smile
- Cheeks: Soft pink blush marks
- Character facing RIGHT
- Floating effects: "Zzz" fading away, small morning sparkle appearing

=== FRAME SEQUENCE (left to right) ===
Frame 1: Still sleepy, eyes barely open as slits (−_−), "Zzz" still floating but fading, flat relaxed body
Frame 2: Stretching! Body elongates upward, eyes still closed in stretch, "Zz" almost gone, tiny yawn
Frame 3: Eyes opening! Looking around with slightly confused/groggy expression (o_o), body returning to round
Frame 4: Fully awake! Eyes bright and alert, happy refreshed smile, small morning sparkle ✦, ready for the day!

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- ADORABLE morning stretch and wake up
- Gradual transition from sleepy to energized
- Show the refreshed feeling after good sleep
- Bright, fresh morning vibe
- Should make waking the pet feel satisfying
```

---

### 18. idle_blink.png

**File:** `idle_blink.png`
**Path:** `public/sprites/slime/idle_blink.png`
**Size:** 384×128px (3 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character doing a BLINK animation (idle variation).

=== LAYOUT ===
- Exactly 3 frames in a horizontal row
- Total image: 384×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, completely still (only eyes move)
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Focus on the blink animation - open → closed → open
- Mouth: Neutral small smile, unchanged
- Cheeks: Soft pink blush marks
- Character facing RIGHT

=== FRAME SEQUENCE (left to right) ===
Frame 1: Eyes fully open, normal idle expression, about to blink
Frame 2: Eyes CLOSED - shown as curved lines (− −) or (∪ ∪), blink moment
Frame 3: Eyes fully open again, same as frame 1, blink complete

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Simple blink animation for natural idle variation
- Only eyes change, body stays still
- Quick blink timing (use fast frameDuration)
- Adds life and natural movement to idle state
```

---

### 19. idle_look.png

**File:** `idle_look.png`
**Path:** `public/sprites/slime/idle_look.png`
**Size:** 512×128px (4 frames)

```
Create a horizontal sprite sheet of a super cute chibi slime character LOOKING AROUND animation (idle variation).

=== LAYOUT ===
- Exactly 4 frames in a horizontal row
- Total image: 512×128 pixels
- Each frame: 128×128 pixels
- Transparent PNG background

=== CHARACTER DESIGN (Chibi Cute Style) ===
- Body: Round squishy blob/slime, slight head tilt movements
- Color: Soft pastel blue #7EC8E3 with lighter highlight #B5E4F7
- Eyes: Large curious eyes that look in different directions
- Mouth: Neutral or slightly curious expression
- Cheeks: Soft pink blush marks
- Character facing RIGHT but eyes wander

=== FRAME SEQUENCE (left to right) ===
Frame 1: Eyes looking LEFT (curious about something on the left?), slight body tilt left
Frame 2: Eyes moving to center, returning to neutral, small blink
Frame 3: Eyes looking RIGHT (what's over there?), slight body tilt right
Frame 4: Eyes back to center, satisfied expression, done looking around, slight nod

=== STYLE ===
- Ultra cute Japanese chibi/kawaii aesthetic
- Shows pet is aware of surroundings
- Curious, attentive personality
- Subtle body movements following eye direction
- Adds personality and life to idle state
- Should trigger randomly during long idle periods
```

---

## 📊 New Animations Summary Table

| # | Filename | Frames | Dimensions | Tier | Trigger |
|---|----------|--------|------------|------|---------|
| 10 | `sad.png` | 4 | 512×128 | 1 | Happiness < 40 |
| 11 | `idle_happy.png` | 4 | 512×128 | 2 | Happiness 60-80 |
| 12 | `idle_ecstatic.png` | 4 | 512×128 | 2 | Happiness 80+ |
| 13 | `walk_tired.png` | 4 | 512×128 | 2 | Energy 15-35 |
| 14 | `eat.png` | 6 | 768×128 | 3 | Treat interaction |
| 15 | `dance.png` | 8 | 1024×128 | 3 | Dance party |
| 16 | `yawn.png` | 4 | 512×128 | 4 | Pre-sleep transition |
| 17 | `wake.png` | 4 | 512×128 | 4 | Post-sleep transition |
| 18 | `idle_blink.png` | 3 | 384×128 | 5 | Random during idle |
| 19 | `idle_look.png` | 4 | 512×128 | 5 | Random during long idle |

---

## ⚙️ New Config Entries

Add these to `config.json` after creating the sprites:

```json
{
  "sad": {
    "file": "sad.png",
    "frames": 4,
    "frameDuration": 300,
    "loop": true
  },
  "idle_happy": {
    "file": "idle_happy.png",
    "frames": 4,
    "frameDuration": 180,
    "loop": true
  },
  "idle_ecstatic": {
    "file": "idle_ecstatic.png",
    "frames": 4,
    "frameDuration": 150,
    "loop": true
  },
  "walk_tired": {
    "file": "walk_tired.png",
    "frames": 4,
    "frameDuration": 200,
    "loop": true
  },
  "eat": {
    "file": "eat.png",
    "frames": 6,
    "frameDuration": 150,
    "loop": false
  },
  "dance": {
    "file": "dance.png",
    "frames": 8,
    "frameDuration": 120,
    "loop": true
  },
  "yawn": {
    "file": "yawn.png",
    "frames": 4,
    "frameDuration": 250,
    "loop": false
  },
  "wake": {
    "file": "wake.png",
    "frames": 4,
    "frameDuration": 200,
    "loop": false
  },
  "idle_blink": {
    "file": "idle_blink.png",
    "frames": 3,
    "frameDuration": 80,
    "loop": false
  },
  "idle_look": {
    "file": "idle_look.png",
    "frames": 4,
    "frameDuration": 300,
    "loop": false
  }
}
```

---

## 📝 Quick Reference Prompts (New Animations)

| File | Short Prompt |
|------|--------------|
| `sad.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, SAD/LONELY expression. Pastel blue #7EC8E3, droopy sad eyes with tear, downturned frown, small dark cloud. Frames: deflated sad→tear forming→tear falls→wipes tear hopeful. Transparent PNG, adorable sadness.` |
| `idle_happy.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, HAPPY IDLE resting state. Pastel blue #7EC8E3, sparkly content eyes, gentle smile, pink blush. Frames: sparkle→happy squint→floating heart→peaceful joy. Transparent PNG, content vibes.` |
| `idle_ecstatic.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, ECSTATIC IDLE maximum happiness. Pastel blue #7EC8E3, star-sparkle eyes ★, beaming smile, lots of hearts and sparkles. Frames: bouncy hearts→blissful eyes→orbiting stars→joyful landing. Transparent PNG, maximum cute energy.` |
| `walk_tired.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, TIRED WALKING slow movement. Pastel blue #7EC8E3 slightly muted, half-lidded tired eyes (−_−), sweat drop. Frames: low tired crouch→slow stretch→low hop→heavy landing "...". Transparent PNG, adorable exhaustion.` |
| `eat.png` | `Chibi kawaii blue slime sprite sheet, 6 frames 768×128px, EATING/MUNCHING animation. Pastel blue #7EC8E3, eyes go excited→closed chomping→satisfied. Frames: anticipation→mouth wide open→chomping→chewing left→chewing right→satisfied sparkle. Transparent PNG, adorable nomming.` |
| `dance.png` | `Chibi kawaii blue slime sprite sheet, 8 frames 1024×128px, DANCING rhythmic animation. Pastel blue #7EC8E3, joyful eyes alternating (^_^) and excited, musical notes ♪♫. Frames: bounce down→lean left→peak→lean right→up again→wiggle wiggle→twist→victory pose. Transparent PNG, party vibes.` |
| `yawn.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, YAWNING pre-sleep. Pastel blue #7EC8E3, droopy sleepy eyes, big yawn. Frames: getting sleepy→BIG YAWN mouth open→yawn closing→sleepy smile with "z". Transparent PNG, contagiously cute yawn.` |
| `wake.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, WAKING UP post-sleep. Pastel blue #7EC8E3, eyes gradually opening. Frames: barely open "Zzz"→stretching→groggy eyes open→fully awake sparkle. Transparent PNG, refreshed morning vibe.` |
| `idle_blink.png` | `Chibi kawaii blue slime sprite sheet, 3 frames 384×128px, simple BLINK. Pastel blue #7EC8E3, only eyes change. Frames: eyes open→eyes closed (− −)→eyes open. Transparent PNG, natural blink.` |
| `idle_look.png` | `Chibi kawaii blue slime sprite sheet, 4 frames 512×128px, LOOKING AROUND. Pastel blue #7EC8E3, curious eyes. Frames: look left→center blink→look right→satisfied nod. Transparent PNG, aware and curious.` |

---

*Generated for iPet Project - Desktop Pet Application*
