# FIBONACCI: THE HIDDEN CODE OF GROWTH — Explorica Cinematic & Auto-Scroll Edition

This plan introduces two show-stopping exhibition capabilities tailored for your **Explorica** presentation: a scroll-locked **Cinematic Movie Opening Sequence** (*"CLASS 10 PRESENTS"* $\rightarrow$ *"FIBONACCI IN NATURE"*) that replays whenever the experience restarts, and a **60fps Adjustable-Speed Auto-Scroll Controller** for hands-free live presenting.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions incorporate your confirmed answers from the clarification step and preserve your Arial title typography and bubblegum pink (`#ff69b4`) contrast buttons across all stages.

- **Confirmed Decision 1 — Scroll-Locked Cinematic Movie Intro**: When the website loads—and every time `[RESTART THE EXPERIENCE]` is clicked at the end—the page locks scrolling (`overflow: hidden`) and plays a theatrical movie intro:
  1. **Title Card 1**: `"CLASS 10 PRESENTS"` fades in over a dark cinema stage with subtle golden particles, holds, and fades out into darkness.
  2. **Title Card 2**: A monumental `"FIBONACCI IN NATURE"` title fades in with an expanding golden spiral light ring and harmonic chord, holds, and then fades away.
  3. **Reveal & Scroll Unlock**: The cinema curtains retract, unlocking page scroll and revealing the interactive Fibonacci laboratory from the top.
- **Confirmed Decision 2 — Adjustable-Speed Auto-Scroll Director**: A dedicated **Auto-Scroll Bar** allows you to toggle continuous, silky-smooth 60fps page scrolling with an adjustable speed slider (`0.5×` Slow Walk to `4.0×` Fast Tour) and quick presets (`1×`, `2×`, `3×`), so you can present hands-free at the Explorica booth.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the arrival and restart flow into a true theatrical premiere for Class 10 at Explorica, followed by a self-gliding interactive mathematics exhibition whose scroll speed can be tuned on the fly.
- **Target Audience / Persona**: Explorica science & mathematics exhibition judges, visiting students, teachers, and live booth presenters.
- **Key Value**: Creates an unforgettable theatrical first impression while giving the presenter effortless, adjustable hands-free scrolling during live explanations.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Theatrical Movie Prologue (Scroll-Locked)**:
     - **0.0s – 3.0s**: Screen starts pitch-black (`#010205`) with cinema letterbox bars. `"CLASS 10 PRESENTS"` fades in smoothly in crisp `Arial` display typography, then fades out completely.
     - **3.2s – 6.6s**: A giant `"FIBONACCI IN NATURE"` title card emerges with an animated golden-ratio spiral halo, then fades away.
     - **6.8s+**: The movie overlay dissolves, unlocking vertical scrolling on the main laboratory screen (`OpeningExperience` $\rightarrow$ Stages 01–09).
     - **Restart Loop**: Clicking `[RESTART THE EXPERIENCE]` in the final section scrolls immediately to the top, locks scrolling again, and replays the full `"CLASS 10 PRESENTS"` $\rightarrow$ `"FIBONACCI IN NATURE"` movie sequence.
  2. **Adjustable-Speed Auto-Scroll HUD**:
     - A compact floating control dock lets you click **Auto-Scroll Play/Pause** and drag a **Speed Slider (`0.5×` – `4.0×`)** (with `1×`, `2×`, `3×` quick-select buttons).
     - While active, a `requestAnimationFrame` loop advances `window.scrollY` smoothly at the chosen velocity. Touching or wheel-scrolling pauses auto-scroll gracefully, or you can enable **Kiosk Auto-Restart** so when it reaches the bottom of the page, it triggers the movie intro again automatically.
- **Visual Identity & Theme**:
  - **Aesthetic Direction**: Futuristic mathematics museum and cinema-grade science exhibition.
  - **Color Palette & Mood**:
    - `--background`: Deep obsidian (`#010205` / `#020408`)
    - `--primary`: Warm Fibonacci Gold (`#fbbf24`)
    - `--accent`: Bubblegum Pink (`#ff69b4`) for high-contrast action buttons and active states, paired with Electric Cyan (`#22d3ee`) for interactive telemetry.
  - **Typography & Hierarchy**:
    - **Titles & Movie Cards**: `Arial` (`font-['Arial',sans-serif]`) across all page/section headings and movie title cards.
    - **Mathematical Telemetry**: `JetBrains Mono` with `tabular-nums`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Sub-Pixel `requestAnimationFrame` Auto-Scroll with CSS Snap Bypass**:
  - *Chosen Approach*: Temporarily switch `html` scroll-snap from `y proximity` to `none` while Auto-Scroll is actively running, using a floating-point accumulator in `requestAnimationFrame`.
  - *Why*: Browser `scroll-snap-type: y proximity` fights slow continuous programmatic scrolling and causes jitter. Disabling snap during active auto-scroll guarantees buttery 60fps motion at any speed from `0.5×` to `4.0×`, while restoring proximity snap as soon as auto-scroll is paused.
- **Decision 2 — Body Scroll Lock During the Movie Prologue**:
  - *Chosen Approach*: Apply `overflow: hidden` to `document.body` and `window.scrollTo(0, 0)` while `CinematicMovieIntro` is active, releasing it once `"FIBONACCI IN NATURE"` finishes fading out.
  - *Why*: Guarantees the visitor experiences the opening movie cards without accidentally scrolling past the first screen prematurely.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        App Root (Experience Controller)                    │
│  • experienceKey (increments on Restart)                                   │
│  • showMovieIntro (true on initial load & on every Restart)                │
│  • autoScrollState (isPlaying, speedMultiplier: 0.5x..4.0x, loopAtEnd)     │
└───────────────┬────────────────────────────────────────┬───────────────────┘
                │                                        │
                ▼                                        ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│      CinematicMovieIntro Overlay      │  │     AutoScrollController HUD    │
│  • Locks document.body scroll         │  │  • Play / Pause toggle button   │
│  • Phase 1: "CLASS 10 PRESENTS"       │  │  • Speed slider (0.5x to 4.0x)  │
│    (fade in → hold → fade out)        │  │  • Quick presets (1x, 2x, 3x)   │
│  • Phase 2: "FIBONACCI IN NATURE"     │  │  • Auto-Loop on/off toggle      │
│    (big title fade in → fade out)     │  │  • 60fps rAF scroll engine      │
│  • Phase 3: Unlock scroll & reveal    │  └─────────────────────────────────┘
└───────────────┬───────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────────────────────┐
│         Main Laboratory Journey (Stages 00–09 + FinalExperience)           │
│  • OpeningExperience ("CAN YOU FIND THE RULE?" — unlocked after intro)     │
│  • Stages 01–09 Interactive Exhibits (Arial titles + Bubblegum Pink CTAs)  │
│  • FinalExperience ("[RESTART THE EXPERIENCE]" → triggers Movie Intro)     │
└────────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
- **`CinematicMovieIntro` State Machine**:
  - `phase: 'presenter' | 'gap' | 'main-title' | 'fade-out' | 'done'`
  - Locks `document.body.style.overflow = 'hidden'` on mount; restores `document.body.style.overflow = ''` when transitioning to `'done'` or when the user clicks the discrete `Skip Intro` button.
- **`AutoScrollController` Engine**:
  - Maintains `isAutoScrolling: boolean`, `speed: number` (`0.5` to `4.0`, default `1.2`), and `loopOnFinish: boolean`.
  - Uses a `useRef` fractional scroll accumulator so even slow speeds (`0.5×`) advance smoothly every frame without rounding stalls.
  - Detects when `window.innerHeight + window.scrollY >= document.body.offsetHeight - 8` to either pause cleanly at the bottom or trigger `onRestart()` if `loopOnFinish` is enabled.
- **`FinalExperience` Restart Flow**:
  - Clicking `[RESTART THE EXPERIENCE]` calls `handleRestart()` in `App`, which resets `window.scrollTo({ top: 0, behavior: 'instant' })`, increments `experienceKey`, and sets `showMovieIntro(true)` so the full `"CLASS 10 PRESENTS"` $\rightarrow$ `"FIBONACCI IN NATURE"` sequence plays from the start.
