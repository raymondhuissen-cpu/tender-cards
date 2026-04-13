# Design System: Tender Cards

## 1. Visual Theme & Atmosphere

A warm, editorial luxury interface — quietly confident, never decorative. The atmosphere is like a high-end stationery brand: premium materials, deliberate whitespace, and typography that earns its space. Variance 8 (asymmetric, split-screen layouts), Motion 6 (fluid CSS spring physics, staggered reveals), Density 4 (breathing room, not sparse). The palette is anchored in deep forest green and burnished gold — grounded, human, and institutional without feeling corporate.

---

## 2. Color Palette & Roles

- **Forest** (`#1C3A2E`) — Primary background, hero sections, nav pill, dark cards
- **Forest Hover** (`#244B3B`) — Button hover, interactive forest surfaces
- **Gold** (`#C4963D`) — Single accent: CTAs, borders, decorative lines, logo mark
- **Gold Bright** (`#E8B458`) — Hover state of gold, highlighted text, badges
- **Cream** (`#F7F3EE`) — Light section backgrounds, card fills
- **Cream Dark** (`#EDE7DF`) — Card borders, subtle dividers
- **Dark** (`#111916`) — Footer, deep dark sections. Never pure `#000000`
- **Mid** (`#3D5C4A`) — Body text on light backgrounds
- **Sage** (`#6B9E80`) — Section labels, secondary metadata
- **Light** (`#8BAA96`) — Tertiary text, captions

**Rules:**
- Maximum 1 accent color (Gold). Saturation below 80%.
- No purple, blue neon, or gradient accents.
- All grays are warm-tinted. Never mix cool and warm grays.
- Never use pure black (`#000000`).

---

## 3. Typography Rules

- **Display / Hero Headlines:** Cormorant Garamond, weight 300–400, italic for emphasis. `font-size: clamp(2.6rem, 4.5vw, 4rem)`, `letter-spacing: -0.01em`, `line-height: 1.15`. `text-wrap: balance` always. Italic `<em>` in Gold Bright.
- **Section Titles (H2):** Cormorant Garamond, weight 300, `clamp(2rem, 3.5vw, 3rem)`, `line-height: 1.2`.
- **Body / UI:** DM Sans, weight 300–500, `font-size: 0.9–1rem`, `line-height: 1.7–1.85`, `max-width: 600px` (≈65ch).
- **Labels / Eyebrows:** DM Sans, `0.65–0.68rem`, `letter-spacing: 0.18–0.22em`, `text-transform: uppercase`, Sage color. Preceded by a 24px Gold line.
- **Mono / Data:** `font-variant-numeric: tabular-nums` on all stat numbers, prices, metrics.
- **Banned fonts:** Inter, Roboto, Arial, Open Sans, Helvetica.
- **Serif rule:** Cormorant Garamond only for editorial/marketing pages. Never on dashboards or data UIs.

---

## 4. Component Stylings

**Buttons — Primary:**
- Shape: `border-radius: 100px` (pill), `padding: 0.7rem 0.7rem 0.7rem 1.4rem`
- Fill: Gold (`#C4963D`), text: Forest
- Trailing icon: nested circle `30×30px`, `background: rgba(28,58,46,0.15)`, arrow SVG inside
- Hover: Gold Bright, `translateY(-1px)`, arrow translates `(2px, -1px)`
- Active: `scale(0.98) translateY(1px)` — tactile press
- Magnetic: follows cursor with `translate(x*0.18, y*0.18)` on mousemove

**Buttons — Ghost:**
- No background. Border-bottom only: `1px solid rgba(255,255,255,0.25)`
- Hover: border brightens, text opacity to 100%
- Active: `opacity: 0.6`

**Buttons — Outline Forest:**
- `border: 1px solid var(--forest)`, `border-radius: 2px`
- Hover: fills Forest, text white

**Cards:**
- Use only when elevation communicates hierarchy
- Outer shell: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`, `border-radius: 20px`, `padding: 6px` (Double-Bezel)
- Inner core: white background, `inset 0 1px 0 rgba(255,255,255,0.9)`, `border-radius: 16px`
- Shadow: tinted to background hue, never generic black drop shadow
- Hover: `border-color: rgba(196,150,61,0.3)`, `box-shadow: 0 12px 40px rgba(28,58,46,0.08)`
- Spotlight: `radial-gradient` at cursor position via CSS custom properties `--mx`, `--my`
- Active: `scale(0.985)`

**Inputs / Forms:**
- Label above input, `font-size: 0.68rem`, uppercase, `letter-spacing: 0.14em`, Sage color
- Input: `background: #fff`, `border: 1px solid rgba(17,25,22,0.1)`, `border-radius: 8px`
- Focus: `border-color: rgba(196,150,61,0.5)`, `box-shadow: 0 0 0 3px rgba(196,150,61,0.08)`
- Error: inline text below input, no `window.alert()`

**Navigation:**
- Floating pill: `position: fixed; top: 1.25rem`, `backdrop-filter: blur(20px)`, Forest background, Gold border
- `border-radius: 100px`, `max-width: calc(100vw - 2rem)`
- Active state: Gold CTA pill on far right

**Focus:**
- `outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 3px`

---

## 5. Layout Principles

- **Hero:** Split-screen 50/50 — text left, card visual right. Never centered hero when variance > 4.
- **Sections:** `padding: 100px 5%`. Max content width implied by text `max-width: 600px`.
- **Asymmetric grids:** `grid-template-columns: 1.65fr 1fr` for product cards (featured first), `1.4fr 1fr` for feature lists.
- **Steps:** Featured step 1 full-width `grid-column: 1/-1`, steps 2+3 side by side.
- **Impact cards:** First card spans full width `grid-column: 1/-1` with 2-col inner grid.
- **No 3-equal-column feature rows.** Use 2-col zig-zag, horizontal scroll, or featured-first asymmetric grid.
- **No `height: 100vh`.** Always `min-height: 100dvh`.
- **No flexbox percentage math.** CSS Grid for all multi-column structures.
- **Semantic HTML:** `<main id="main-content">`, `<nav>`, `<footer>`, `<section>`, `<article>`.
- **Skip link:** `.skip-link` visually hidden, reveals on `:focus`.
- **Mobile:** All asymmetric layouts collapse to single column below 768px. No horizontal overflow.

---

## 6. Motion & Interaction

- **Scroll entry (fade-up):** `translateY(32px) + filter: blur(4px) + opacity: 0` → resolves over `720ms` with `cubic-bezier(0.23, 1, 0.32, 1)`. Blur resolves at `520ms` (clears before motion lands).
- **Stagger:** Siblings within same parent get `animation-delay: i * 90ms`.
- **Stat counter:** Numbers count up from 0 when entering viewport via `IntersectionObserver`. Easing: `1 - (1-t)^3`.
- **Magnetic buttons:** Primary + nav CTA follow cursor with `translate(x*0.18, y*0.18)` on `mousemove`, reset on `mouseleave`.
- **Spotlight cards:** Product cards track cursor via CSS custom properties `--mx`, `--my` → `radial-gradient` at cursor.
- **Card stack hover:** Cards fan out with rotation on `.card-bezel:hover`.
- **Spring physics easing:** `cubic-bezier(0.32, 0.72, 0, 1)` for drawer/spring elements.
- **Performance:** Animate only `transform` and `opacity`. `will-change: transform, opacity, filter` on `.fade-up` only. Grain overlays on `position: fixed; pointer-events: none` pseudo-elements only.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` removes `transform` and `filter`, keeps `opacity`.

---

## 7. Anti-Patterns (Banned)

- No emojis anywhere in code or content
- No `Inter`, `Roboto`, `Arial`, `Open Sans` fonts
- No pure black (`#000000`) — use `#111916` or `#0D0D0D`
- No neon/outer glow `box-shadow`
- No purple/blue AI gradient aesthetic
- No oversaturated accent colors (saturation > 80%)
- No gradient text on large headings
- No custom mouse cursors
- No 3-equal-column card layouts
- No `height: 100vh` — use `min-height: 100dvh`
- No `window.addEventListener('scroll')` — use `IntersectionObserver`
- No `transition: all` — always specify properties
- No `window.alert()` for error messages
- No `z-index: 9999` spam — use systemic layers only
- No generic names ("John Doe", "Acme Corp")
- No round fake numbers (`50%`, `99.99%`)
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- No Lorem Ipsum — always real copy
- No broken Unsplash links — use `picsum.photos/seed/{name}` or SVG avatars
- No centered hero layouts (variance is 8)
- No `backdrop-blur` on scrolling containers — sticky/fixed elements only
- No grain overlays on scrolling containers — `position: fixed` pseudo-elements only
