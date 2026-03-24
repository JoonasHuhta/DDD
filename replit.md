# METAMAN - Corporate Empire Game

## Overview
METAMAN is a React-based web game focused on building and managing a corporate empire within a futuristic city tower. It features a full-stack TypeScript architecture, incorporating incremental game mechanics such as prestige systems, achievements, and offline progression. The project aims to deliver an engaging simulation experience with a strong business vision and market potential in the incremental game genre.

## Recent Updates (2025-08-12) - ANDROID APK OPTIMIZATION COMPLETED ✅
- ✅ **COMPREHENSIVE MOBILE OPTIMIZATION**: Complete Android APK optimization implemented
- ✅ **Fullscreen Experience**: True fullscreen mode with hidden system UI (status bar, navigation bar)
- ✅ **Portrait Mode Lock**: Forced portrait orientation with multiple fallback methods for all Android versions
- ✅ **System Gesture Prevention**: Blocked accidental system gestures while preserving all game interactions
- ✅ **Enhanced Touch Controls**: Mobile-optimized touch handling with 44px minimum targets and visual feedback
- ✅ **Smart Touch Detection**: Intelligent detection of game elements vs system elements for gesture prevention
- ✅ **MobileOptimizer Component**: React component handling all Android-specific optimizations
- ✅ **Dynamic Viewport Management**: CSS custom properties for perfect mobile browser compatibility
- ✅ **Android Back Button Handling**: Prevention of accidental app exit with confirmation dialogs
- ✅ **Capacitor Configuration**: Enhanced Android-specific settings for professional app behavior
- ✅ **Game Functionality Preserved**: All existing game features work perfectly on mobile devices

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS (custom theme)
- **UI Primitives**: Radix UI (accessible, unstyled)
- **Game Rendering**: Custom Canvas-based engine for 2D pixel art
- **State Management**: Zustand (game state, audio, user data)
- **Server State**: TanStack Query (API calls)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API (`/api` prefix)
- **Data Storage**: In-memory storage (interface-based for future database migration)
- **Authentication**: Session-based architecture (ready for user authentication)
- **Middleware**: Request logging and error handling

### Game Engine
- **Core**: Custom 2D canvas engine built with TypeScript classes
- **Design**: Component-based game objects (City, Metaman, Citizens, DayNightCycle)
- **Rendering**: Real-time rendering with delta-time updates
- **Audio**: Integrated audio system with background music and sound effects
- **Responsiveness**: Adapts to various screen sizes

### Key Features & Design Patterns
- **Comprehensive 5-System Overhaul**: Unified achievement and statistics UI, streamlined bottom menu, passive user generation framework, campaign-basement connection system, and influence points as a secondary currency.
- **Dynamic Theming System**: 5 complete game themes (METAMAN, Social Tycoon, Tech Empire, Viral Kingdom, Corporate Climber) with different names, art styles, colors, and gameplay focus. Switchable through Options panel.
- **Incremental Mechanics**: Prestige system (Influence Points), comprehensive achievement system with permanent bonuses, large number formatting, and offline progression (up to 4 hours).
- **Automation Systems**: Auto-clicker, auto-buyer (cheapest/smart/bulk options), and auto-upgrade system.
- **Synergy & Upgrade Systems**: Buildings boost each other, conditional upgrades, milestone-based powerful rewards, and prestige upgrades.
- **Quality-of-Life**: Statistics panel, export/import save system, options menu, and offline progress popup.
- **Contextual Help**: Smart, non-intrusive guidance (Tutorial, Suggestions, Milestones) with dismiss functionality.
- **UI/UX Decisions**: Adaptive UI system with touch-friendly targets, responsive UI hook, dual-action click system, and pixel art styling.

## External Dependencies

### Core Framework
- React 18 (TypeScript)
- Express.js

### Database & ORM
- Drizzle ORM (PostgreSQL dialect)
- Neon Database (cloud PostgreSQL)

### UI & Styling
- TailwindCSS
- Radix UI
- Lucide React (icons)

### State & Data
- Zustand
- TanStack Query
- Zod (runtime type validation)

### Audio & Assets
- HTML5 Audio API (MP3, OGG, WAV support)
- GLSL shader support (via Vite plugin)
```