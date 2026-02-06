# Drum Pattern Workstation — Development Plan

## 1. Pattern Architecture

- Expand from 32 steps to **128‑step full patterns** per instrument.
- Treat each 32‑step block as a bar within a 4‑bar phrase.
- UI shows 32 steps at a time with bar navigation.
- **Resolution‑adaptive grid**:
  - 8th‑note resolution → 16 visible rows
  - 16th‑note resolution → 32 visible rows
  - 32nd‑note resolution → 64 visible rows
- Grid auto‑scales visually based on resolution.
- Style engines adapt to resolution.

---

## 2. Editing & Workflow

- Replace Shift Mode with **Page‑Button Grid Menus**:
  - Tap page button (Kick/Snare/Hat/Synth/Bass) when already on that page → open Grid Menu.
  - Tap again → close.
  - Tap outside → close.
- **Grid Menu actions**:
  - Copy bar
  - Paste bar
  - Delete bar
  - Clear bar
  - Duplicate bar
  - Invert pattern
  - Randomize bar
  - Apply Rise (bar 1)
  - Apply Break (bar 4)
  - Change resolution
  - Toggle overlays
  - Open tracker sub‑menus

---

## 3. Multi‑Press Menu Logic

- **Single press** → temporary action.
- **Double press** → persistent preference for that page.
- **Third press** → off.
- Works for:
  - Overlays
  - Timing labels
  - Rolls
  - Chance
  - Style‑specific options

---

## 4. Musical Shape

- **Rises (bar 1)**:
  - Pickup kicks
  - Ghost snares
  - Hat density ramps
- **Breaks (bar 4)**:
  - Fills
  - Syncopation
  - Stutters
  - Displaced kicks
- Optional **auto‑shape** mode.

---

## 5. Micro‑Timing Annotations

- Text labels on steps (descriptive only):
  - “late”
  - “push”
  - “drag”
  - “swing +”
  - “laid‑back”
- Style‑defined annotation rules.
- Toggle via Grid Menu.

---

## 6. Style Engine Expansion

### Hip‑Hop / Electronic Styles

- Phonk
- Memphis 90s
- NY modern
- Detroit trap
- Jersey club
- Footwork
- Neo‑soul variants
- Jungle / breakbeat refinements

### Signature 4/4 Styles

- Afrobeats
- Dancehall
- Reggaeton
- UK Garage
- House
- Techno

### Breakbeat Essential

- **Amen Break pattern**:
  - Kick/snare placements
  - Ghost‑note logic
  - Shuffle feel
  - 4‑bar amen variations

---

## 7. Synth Page

- **Chord Engine**:
  - Style‑specific progressions
  - Substitutions
  - Extensions (7ths/9ths/11ths)
  - Inversions & voice‑leading
- **Arpeggio Engine**:
  - Direction rules
  - Density (8ths/16ths/32nds)
  - Syncopation
  - Octave jumps
- **Bassline Engine**:
  - Root vs. passing tone logic
  - Chromatic approaches
  - Syncopation
  - Octave behavior
- 32‑step grid
- Grid Menu editing
- Bar navigation

---

## 8. Tracker Layer (Per‑Step Commands)

- Per‑step command storage.
- Commands include:
  - Rolls (2x, 3x, 4x)
  - Timing labels (push, drag, late, early)
  - Chance/probability
  - Velocity tags (future)
- Commands applied via Grid Menu → sub‑menus.
- Multi‑press behavior applies.
- Audio engine supports rolls via multiple scheduled triggers.

---

## 9. Stacked Grid + Tracker Columns View

- Optional view mode.
- Stacks all 4 bars vertically.
- Adds tracker columns beside grid:
  - Timing
  - Rolls
  - Chance
  - Velocity (future)
- Tap tracker cell → selector opens.
- Menu items activate tracker modes.
- Fully mobile‑friendly.

---

## 10. Built‑In Audio Engine (HTML/CSS/JS Only)

- Load kick/snare/hat WAV files.
- Use Web Audio API for sample playback.
- Tempo system.
- Look‑ahead scheduler for tight timing.
- Trigger sounds based on pattern arrays.
- Ghost‑note volume differences.
- Play/Stop/Tempo UI.
- Optional bar‑looping.

---

## 11. App Conversion

- Wrap existing JS app using **Capacitor**.
- iOS‑ready build.
- Native‑feeling UI.
- Fastest path to App Store.
- No rewrite required.
