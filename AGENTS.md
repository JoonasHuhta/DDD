# Dopamine Dealer Dan — Agent Instructions

> Read this file **before touching any code**. It is the authoritative reference
> for architecture, protected zones, and contribution rules.

---

## Project overview

**Dopamine Dealer Dan** is a satirical idle/incremental mobile game about Big Tech,
surveillance capitalism, and the attention economy. The player runs a social media
empire, lures users, sells their data, fights regulators, and eventually dominates
the globe — all framed as darkly humorous corporate satire.

Built solo by Joonas Huhta. Target platform: Android (via Capacitor). Also playable
in browser (itch.io).

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 + TypeScript (strict) |
| Build tool | Vite |
| Styling | TailwindCSS (custom comic/pop-art theme) |
| UI primitives | Radix UI + Lucide React icons |
| Animations | Framer Motion |
| State management | **Zustand** with `subscribeWithSelector` middleware |
| Mobile wrapper | Capacitor (Android) |
| Fonts | `@fontsource/inter` |
| No backend | All state is in-memory + localStorage (SaveSystem) |

---

## Project structure

```
client/src/
  App.tsx                          # Root: boot sequence → game
  components/
    Game.tsx                       # GameCanvas + GameUI wrapper
    GameUI.tsx                     # Main HUD, panels, bottom menu (858 lines)
    GameCanvas.tsx                 # Canvas render: city/basement view + Metaman
    BootSequence.tsx               # EULA / splash screen (triggers audio unlock)
    MobileOptimizer.tsx            # Android safe-area, gesture, orientation fixes
    CrisisManager.tsx              # Shitstorm crisis mode — throttled update loop
    CharacterDialogue.tsx          # Boss encounter dialogue system
    GlobalDominanceContent.tsx     # World domination world map panel
    ResearchLabPanel.tsx           # R&D tech tree UI
    LawsuitPanel.tsx               # Lawsuit handling UI
    SuitcasePanel.tsx              # Legal + Rewards combined panel
    MansionPanel.tsx               # Dan's mansion / upgrade shop
    DataMarketPanel.tsx            # Data selling market
    SinisterLab.tsx                # Orb breaking → gems
    DepartmentPanel.tsx            # Department buying (incremental buildings)
    CampaignPanel.tsx              # Lure campaign selector
    minigames/
      ForgeSandbox.tsx             # The Forge: merge evidence artifacts
      EspionageMinigame.tsx        # Corporate espionage hack minigame
      ServerDefense.tsx            # Server defense tower minigame
      SenateHearing.tsx            # Senate hearing boss fight
  lib/
    stores/
      useMetamanGame.tsx           # ⭐ MAIN GAME STORE (4347 lines, Zustand)
      useAudio.tsx                 # Audio store: sprite system, track switching
      useGame.tsx                  # Thin wrapper (legacy, mostly unused)
    utils/
      stageSystem.ts               # Stage 1–10 definitions, pure functions
      SaveSystem.ts                # localStorage save/load
      numberFormatter.ts           # formatLargeNumber, formatCurrency
    progression/
      prestige.ts                  # Prestige / Influence Points system
      achievements.ts              # Achievement definitions + logic
      offlineProgress.ts           # Offline progress calculation
      researchData.ts              # R&D tech tree definitions (3 branches)
    gameEngine/
      EliteRegistry.ts             # Elite NPC definitions
      CharacterLogic.ts            # Dialogue node graph
      MarketLogic.ts               # Data market price fluctuation
    content/
      departments.ts               # Department definitions (12 types, Stage 1–10)
    automation/
      AutomationSystem.ts          # Auto-clicker, auto-buyer logic
    upgrades/
      SynergySystem.ts             # Building synergy bonuses
  hooks/
    usePanelState.ts               # ONE panel open at a time — use this always
    useResponsiveUI.tsx            # Mobile/desktop responsive sizes
    useMobileTouch.ts              # Touch handling helpers
  data/
    randomLawsuits.ts              # Random lawsuit pool + RandomLawsuitManager
    lawyers.ts                     # Lawyer roster (hire + equip to slots)
    dominanceEvents.ts             # World domination event pool
```

---

## Game progression (Stage system)

Stage is **auto-calculated** from `users` count. Never hardcode stage numbers in UI.
Always use `getStage(users)` from `lib/utils/stageSystem.ts`.

| Stage | Name | Users needed |
|-------|------|-------------|
| 1 | Bootstrap | 0 |
| 2 | Street Hustle | 100 |
| 3 | Going Viral | 1,000 |
| 4 | Media Attention | 5,000 |
| 5 | Scandal Era | 25,000 |
| 6 | Dominance | 100,000 |
| 7 | National Monopoly | 500,000 |
| 8 | Global Markets | 1,000,000 |
| 9 | Mega Platform Wars | 5,000,000 |
| 10 | Deus Ex Platform | 10,000,000 |

---

## Core systems — overview

### useMetamanGame (the store)
The single source of truth. ~4350 lines. Contains:
- **Resources**: `income`, `users`, `dataInventory`, `orbsInventory`, `dopaCoin`, `influencePoints`
- **Departments**: 12 building types, bought with `buyDepartment(id)`
- **Campaigns**: Lure campaigns with cooldowns and charges (`campaignCharges`, `campaignCooldowns`)
- **Heat system**: `heat` (0–100), `heatLevel`, `modifyHeat()`, `updateHeat()` — 🔥 critical
- **Lawsuits**: Full lawsuit state machine (`lawsuitState`), milestones, random lawsuits
- **Research Lab**: `researchState` — 3 branches (Addiction, Data, Legal), queue system
- **Global Dominance**: `globalDominance` — 15 countries, stage 0–5 each, buildings per country
- **Forge**: Merge-based minigame, `forgeGrid`, `forgeTray`, `forgeArtifacts`
- **Sinister Lab**: Orb breaking → gem slots (`sinisterLab`)
- **Prestige**: `performPrestige()` → resets income/users, keeps InfluencePoints
- **Auto-systems**: `AutomationSystem`, `SynergySystem`
- **Save**: `saveGame()` / `loadGame()` via `SaveSystem` (localStorage)

### Audio system (useAudio)
- Single-file audio sprite approach for Android WebView compatibility
- **DO NOT** change audio initialization or priming logic without explicit instruction
- Track switching: menu → Forgo1.mp3, game → Forgo2.mp3
- Mobile audio unlock happens in `App.tsx` `handleStartGame` and `GameUI.tsx`

### Panel system (usePanelState)
- Only ONE panel can be open at a time
- Always use `openPanel(name)` / `closePanel(name)` / `isPanelOpen(name)` from the hook
- Never manage panel open/close state directly in local `useState` for new panels
- Exception: `showCampaignPanel`, `showDataMarket`, `showEspionage`, `showServerDefense`,
  `showForgeSandbox` are stored in Zustand (legacy pattern — do not add new ones this way)

---

## Protected zones — DO NOT modify without explicit instruction

| Zone | Why |
|------|-----|
| `useAudio.tsx` — priming + init logic | Android WebView gesture policy workaround in place |
| `CrisisManager.tsx` — update loop | Carefully throttled to prevent "Maximum update depth" crash |
| `useMetamanGame.tsx` — prestige calculations | `performPrestige()` balance is intentional |
| `useMetamanGame.tsx` — heat decay rate | `-2/s` decay is tuned for game balance |
| `GameCanvas.tsx` — canvas render loop | Delta-time based, fragile to async state changes |
| `MobileOptimizer.tsx` | Android safe-area + orientation lock in specific order |
| `SaveSystem.ts` | Save format must stay backward-compatible |

---

## Editable zones — safe to change

| Zone | Notes |
|------|-------|
| Any UI component's visual styling | Colors, layouts, animations |
| Balance constants (`COSTS`, `DURATIONS` in researchData.ts) | Tweak freely |
| New panel components | Create in `components/`, add to `usePanelState` |
| `data/` files | New lawsuits, lawyers, events |
| New minigames | Create in `components/minigames/`, wire to store flag |
| Achievement definitions | `lib/progression/achievements.ts` |
| Dialogue nodes | `lib/gameEngine/CharacterLogic.ts` |

---

## Code style rules

- **TypeScript strict** — no `any` unless there is a cast comment explaining why
- **Functional components only** — no class components
- **Comments in English**
- Use `useShallow` from `zustand/react/shallow` for all multi-property store reads in components
- Never call `set()` inside a `useEffect` cleanup — causes React update loops
- All new features go in **separate components first**, then wire to GameUI.tsx
- Number display always goes through `formatNumber()` from the store

---

## Current development status (as of April 2026)

**Implemented and working:**
- Full 10-stage progression
- 12 department types (Corner Ops → Consciousness Harvesters)
- Lure campaigns (14 types), cooldown + charge system
- Heat system (0–100) with heatLevel gates
- Lawsuit system: delivery, fight/settle/evade, lawyer roster, random lawsuits
- R&D tech tree: 3 branches, 14 nodes, queue system, leak events
- Global Dominance: world map, 15 countries, buildings, rival influence, events
- The Forge: merge minigame, artifacts, Auto-Merger
- Sinister Lab: orb breaking, gem slots, bonuses
- Data Market: 4 data types, price fluctuation, history graph
- Corporate Espionage, Server Defense, Senate Hearing minigames
- Mansion: upgrade shop, ironic badges
- Prestige system (Influence Points)
- Offline progress (up to 4 hours)
- Save/load (localStorage)
- Boot sequence with EULA
- Android APK (Capacitor), fullscreen + portrait lock + gesture prevention
- Auto music track cycling (Forgo1 / Forgo2)

**Known issues / in progress:**
- Occasional 5-second input freeze when Dan smiles after reward claim (state update timing)
- GlobalDominancePanel is currently commented out in GameUI.tsx (content exists, import removed)

---

## Working with this codebase

### Before every task
1. Read this file (AGENTS.md)
2. Identify which files you need to touch
3. Check if any touched file is in the Protected Zones list

### Task boundaries
- Work on **one feature or bug at a time**
- If a task touches more than 3 files, split it into subtasks
- State changes go in `useMetamanGame.tsx` — UI rendering stays in components

### When uncertain
- Ask, do not guess
- Do not invent new Zustand state fields without confirming the naming convention
- Do not add new global `useEffect` loops without confirming they belong in `GameUI.tsx`

---

## Typical task examples

**Good (specific, scoped):**
> "In `ResearchLabPanel.tsx`, add a visual progress bar below the active research node
> that reads from `researchState.progressPercent`. No new state needed."

**Bad (too broad):**
> "Make the research lab better"

**Good:**
> "Add a `LuringLab` panel component that shows current users by cohort
> (teens/pros/seniors/addicts from `cohorts` in store). Read-only display, no new actions."

**Bad:**
> "Implement cohort management"
