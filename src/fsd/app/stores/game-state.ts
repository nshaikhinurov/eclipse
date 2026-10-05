import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  Board,
  generateBoard,
  getNextValue,
  isValidSolution,
  solve,
} from "~/fsd/pages/game/model";

type GameState = {
  boardHistory: {
    ids: number[];
    entities: Record<number, Board | undefined>;
  };
  // Actions
  cellClicked: (cellId: number) => void;
  cellRestored: () => void;
  boardCleared: () => void;
  boardSolved: () => void;
  resetGame: (initialBoard?: Board) => void;
};

// Helper function to generate initial game state
const createInitialState = (initialBoard?: Board) => ({
  boardHistory: {
    ids: [1],
    entities: {
      1: initialBoard || generateBoard(),
    } as Record<number, Board | undefined>,
  },
});

// Create the game state store
export const useGameStateStore = create<GameState>()(
  immer((set) => ({
    ...createInitialState(),

    cellClicked: (cellId: number) => {
      set((state) => {
        // Don't perform action if game is finished
        if (isGameFinished(state)) {
          return;
        }

        const currentBoardId = state.boardHistory.ids.at(-1);
        const currentBoard = getCurrentBoard(state);

        if (!currentBoard || currentBoardId === undefined) {
          return;
        }

        const row = Math.floor(cellId / currentBoard.length);
        const col = cellId % currentBoard.length;

        const clickedCellValue = currentBoard[row][col];
        const nextCellValue = getNextValue(clickedCellValue); // With immer middleware, we can mutate the draft state directly
        state.boardHistory.ids.push(currentBoardId + 1);
        state.boardHistory.entities[currentBoardId + 1] = [...currentBoard];
        state.boardHistory.entities[currentBoardId + 1]![row][col] =
          nextCellValue;
      });
    },

    cellRestored: () => {
      set((state) => {
        // Don't perform action if game is finished
        if (isGameFinished(state)) {
          return;
        }

        const currentBoardId = state.boardHistory.ids.at(-1);

        if (currentBoardId !== undefined && currentBoardId > 1) {
          state.boardHistory.entities[currentBoardId] = undefined;
          state.boardHistory.ids.pop();
        }
      });
    },

    boardCleared: () => {
      set((state) => {
        // Don't perform action if game is finished
        if (isGameFinished(state)) {
          return;
        }

        state.boardHistory.ids = [1];
        state.boardHistory.entities = {
          1: state.boardHistory.entities[1],
        };
      });
    },

    boardSolved: () => {
      set((state) => {
        // Don't perform action if game is finished
        if (isGameFinished(state)) {
          return;
        }

        const currentBoardId = state.boardHistory.ids.at(-1);
        const initialBoard = state.boardHistory.entities[1];

        if (!initialBoard || currentBoardId === undefined) {
          return;
        }
        const [solvedBoard] = solve(initialBoard);
        state.boardHistory.ids.push(currentBoardId + 1);
        state.boardHistory.entities[currentBoardId + 1] = solvedBoard;
      });
    },

    resetGame: (initialBoard?: Board) => {
      set(createInitialState(initialBoard));
    },
  })),
);

// Selectors
export const getCurrentBoard = (state: GameState) => {
  const boardId = state.boardHistory.ids.at(-1);
  if (boardId) {
    return state.boardHistory.entities[boardId];
  }
  return undefined;
};

export const getCell = (state: GameState, cellId: number) => {
  const currentBoard = getCurrentBoard(state);
  if (!currentBoard) return null;
  const row = Math.floor(cellId / currentBoard.length);
  const col = cellId % currentBoard.length;
  return currentBoard[row][col];
};

export const isGameFinished = (state: GameState) => {
  const currentBoard = getCurrentBoard(state);
  return currentBoard
    ? currentBoard.flat().every((cell) => cell !== null) &&
        isValidSolution(currentBoard)
    : false;
};

export const canUndo = (state: GameState) => {
  return state.boardHistory.ids.length > 1;
};

// Hook selectors
export const useCurrentBoard = () => useGameStateStore(getCurrentBoard);
export const useCell = (cellId: number) =>
  useGameStateStore((state) => getCell(state, cellId));
export const useIsGameFinished = () => useGameStateStore(isGameFinished);
export const useCanUndo = () => useGameStateStore(canUndo);
