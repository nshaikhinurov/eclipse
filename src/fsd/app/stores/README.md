# Store Refactoring Overview

This document provides a detailed overview of the store refactoring in the Eclipse game application.

## Store Structure

The application state has been divided into three interconnected stores:

1. **Game State Store** (`game-state.ts`)

   - Manages the board history and current game state
   - Handles game actions (cell clicks, undo, etc.)
   - Provides selectors for derived states (current board, isFinished, etc.)

2. **Game Meta Store** (`game-meta.ts`)

   - Manages timing information (started/finished timestamps)
   - Provides game duration calculations
   - Reacts to game state changes (e.g., game finished)

3. **Settings Store** (`settings.ts`)
   - Manages user preferences (timer display, error checking)
   - Persists settings using local storage
   - Provides toggles for settings changes

## Benefits of the New Architecture

1. **Separation of Concerns**

   - Each store is focused on a specific aspect of the application
   - Easier to understand and maintain
   - Better testability

2. **Optimized Performance**

   - More targeted state updates
   - Fewer unnecessary re-renders
   - Derived state is calculated only when needed

3. **Improved Developer Experience**
   - Clearer boundaries between state domains
   - Type-safe selectors and actions
   - More explicit dependencies

## Backward Compatibility

The original `store.ts` file has been maintained for backward compatibility, but it now serves as a facade to the new modular stores. This allows for a gradual migration of components to the new architecture.

## Future Enhancements

1. Complete migration of all components to use the new stores directly
2. Add additional features like:
   - Game statistics tracking
   - Multiple puzzle support
   - Difficulty levels
3. Implement proper error handling and recovery
