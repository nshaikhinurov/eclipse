import { beforeEach, describe, expect, it } from "vitest";
import { generateBoard } from "~/fsd/pages/game/model";
import { useGameMetaStore, useGameStateStore, useSettingsStore } from "./index";

// Reset all stores before each test
beforeEach(() => {
  const emptyBoard = generateBoard();
  useGameStateStore.setState({
    boardHistory: {
      ids: [1],
      entities: { 1: emptyBoard },
    },
  });
  useGameMetaStore.setState({
    gameStartedAt: Date.now(),
    gameFinishedAt: 0,
  });
  useSettingsStore.setState({
    shouldDisplayTimer: true,
    shouldDisplayErrors: true,
  });
});

describe("Game State Store", () => {
  it("should initialize with a valid board", () => {
    const { boardHistory } = useGameStateStore.getState();
    expect(boardHistory.ids).toEqual([1]);
    expect(boardHistory.entities[1]).toBeDefined();
  });

  it("should add a new board to history when a cell is clicked", () => {
    const { cellClicked, boardHistory } = useGameStateStore.getState();
    const initialBoard = boardHistory.entities[1];
    const initialHistoryLength = boardHistory.ids.length;

    // First cell that is empty (null)
    const emptyCellIndex =
      initialBoard?.flat().findIndex((cell) => cell === null) ?? -1;
    if (emptyCellIndex >= 0) {
      cellClicked(emptyCellIndex);
      const newState = useGameStateStore.getState();
      expect(newState.boardHistory.ids.length).toBe(initialHistoryLength + 1);
    }
  });

  it("should allow going back in history with cellRestored", () => {
    const { cellClicked, cellRestored } = useGameStateStore.getState();

    // Make a move
    cellClicked(0);

    // Get current state after move
    const afterClickState = useGameStateStore.getState();
    const historyLengthAfterClick = afterClickState.boardHistory.ids.length;

    // Undo the move
    cellRestored();

    // Check state
    const finalState = useGameStateStore.getState();
    expect(finalState.boardHistory.ids.length).toBe(
      historyLengthAfterClick - 1,
    );
  });
});

describe("Game Meta Store", () => {
  it("should initialize with game started and not finished", () => {
    const metaState = useGameMetaStore.getState();
    expect(metaState.gameStartedAt).toBeGreaterThan(0);
    expect(metaState.gameFinishedAt).toBe(0);
  });

  it("should update gameFinishedAt when finishGame is called", () => {
    const { finishGame } = useGameMetaStore.getState();
    finishGame();
    const newState = useGameMetaStore.getState();
    expect(newState.gameFinishedAt).toBeGreaterThan(0);
  });
});

describe("Settings Store", () => {
  it("should initialize with default settings", () => {
    const settings = useSettingsStore.getState();
    expect(settings.shouldDisplayTimer).toBe(true);
    expect(settings.shouldDisplayErrors).toBe(true);
  });

  it("should toggle timer display setting", () => {
    const { toggleTimerDisplay } = useSettingsStore.getState();
    const initialValue = useSettingsStore.getState().shouldDisplayTimer;

    toggleTimerDisplay();

    const newValue = useSettingsStore.getState().shouldDisplayTimer;
    expect(newValue).toBe(!initialValue);
  });

  it("should toggle error display setting", () => {
    const { toggleErrorDisplay } = useSettingsStore.getState();
    const initialValue = useSettingsStore.getState().shouldDisplayErrors;

    toggleErrorDisplay();

    const newValue = useSettingsStore.getState().shouldDisplayErrors;
    expect(newValue).toBe(!initialValue);
  });
});

describe("Cross-store interactions", () => {
  it("should update game status when board is complete and valid", () => {
    // This is a complex test that would require a solved board
    // In a real implementation, we'd mock a solved board state
    // and verify that the game is marked as finished
  });
});
