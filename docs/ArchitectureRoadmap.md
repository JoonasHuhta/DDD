# Dopamine Dealer Dan: Architectural Scaling Roadmap

This document outlines the recommended technical evolution for the project as it grows in complexity and feature set.

## 1. Game State Management (Decoupling)

**Current State**: `MetamanEngine` holds the primary game state (user counts, entities, timers).
**Recommended**: Move to a dedicated State Management system.
- **Why**: Decouples the simulation logic from the rendering loop. Allows for easier state persistence (save/load) and debugging.
- **Technology**: Lightweight stores like **Zustand** or **NanoStores** are ideal for high-frequency updates in Vite-based projects.

## 2. Entity Component System (ECS)

**Current State**: Object-oriented hierarchy (`Citizen`, `RedNPC`, `Metaman`).
**Recommended**: Transition to an ECS pattern.
- **Why**: Avoids "Deep Inheritance Hell". Components (Velocity, Position, Renderable, AISensor) can be mixed and matched.
- **Benefit**: Dramatic performance improvement when handling thousands of background citizens.

## 3. Scene Graph Rendering

**Current State**: Imperative `render()` calls with hardcoded order.
**Recommended**: Implement a Scene Graph.
- **Abstraction**: `Scene -> Layer -> Node -> Renderable`.
- **Functionality**: The engine simply calls `scene.render()`. Sorting by Z-index happens automatically at the scene level, preventing "weird layering" bugs permanently.

## 4. Asset Pipeline & Sprite Rendering

**Current State**: Primitive drawing (`fillRect`, `arc`).
**Recommended**: Centralized `AssetManager`.
- **Sprites**: Move to Texture Atlases (Spritesheets) for Dan and Citizens.
- **Scaling**: Drawing primitives is resolution-independent but high-performance rendering for 100+ entities is much faster with bitmapped sprites.

## 5. UI vs. Game Canvas Decoupling

**Current State**: Buttons are HTML/React components, but some feedback is on canvas.
**Recommended**: Strict separation.
- **GameCanvas**: Only for the world simulation.
- **Overlay Layer**: A standard React/Tailwind wrapper for all HUD elements, menus, and shop interactions.
- **Communication**: Use a standard Event Bus (e.g., `mitt`) to send "Sale" or "Campaign" events from the game engine to the UI.

---

*Summary: By moving toward a data-driven, modular architecture, the "Dopamine Dealer Dan" codebase will remain maintainable and performant even as we add more floors, more cities, and more complex black market mechanics.*
