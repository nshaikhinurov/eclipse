import { describe, it, expect } from "vitest";
import {
  getNextValue,
  getLineBalance,
  generateAllValidBoards,
  isValidSolution,
  generateBoard,
  solve,
  findHint,
} from "./model";
import type { Board } from "./model";
import { splitStringEvery } from "~/fsd/shared/lib/utils";
import { validBoardsSerialized } from "./consts";

// Test cycling values
describe("getNextValue", () => {
  it("cycles null -> 0 -> 1 -> null", () => {
    expect(getNextValue(null)).toBe(0);
    expect(getNextValue(0)).toBe(1);
    expect(getNextValue(1)).toBe(null);
  });
});

// Test sun/moon counting per row and column
describe("getLineBalance", () => {
  it("counts suns and moons in every row and column, ignoring empty cells", () => {
    const board: Board = [
      [1, 0, null],
      [1, null, null],
      [0, 0, 1],
    ];
    expect(getLineBalance(board)).toEqual({
      rows: [
        { suns: 1, moons: 1 },
        { suns: 1, moons: 0 },
        { suns: 1, moons: 2 },
      ],
      cols: [
        { suns: 2, moons: 1 },
        { suns: 0, moons: 2 },
        { suns: 1, moons: 0 },
      ],
    });
  });
});

// Test generation of small boards
describe("generateAllValidBoards", () => {
  it("returns 2 valid solutions for size 2", () => {
    const boards = generateAllValidBoards(2) as Board[];
    expect(boards).toHaveLength(2);
    const expected: Board[] = [
      [
        [0, 1],
        [1, 0],
      ],
      [
        [1, 0],
        [0, 1],
      ],
    ];
    expect(boards).toEqual(expect.arrayContaining(expected));
    boards.forEach((b) => expect(isValidSolution(b)).toBe(true));
  });

  it("returns 72 valid solutions for size 4", () => {
    const boards4 = generateAllValidBoards(4) as Board[];
    expect(boards4).toHaveLength(72);
    boards4.forEach((b) => expect(isValidSolution(b)).toBe(true));
  });

  it("returns 4140 valid solutions for size 6", { timeout: 10000 }, () => {
    const boards6 = generateAllValidBoards(6) as Board[];
    expect(boards6).toHaveLength(4140);
    boards6.forEach((b) => expect(isValidSolution(b)).toBe(true));
  });
});

// Test puzzle generation
describe("generateBoard", () => {
  it("returns a 6x6 board structure with valid cell values", () => {
    const puzzle = generateBoard();
    expect(puzzle).toHaveLength(6);
    puzzle.forEach((row) => {
      expect(row).toHaveLength(6);
      row.forEach((cell) => {
        expect([0, 1, null]).toContain(cell);
      });
    });
  });

  it("returns a puzzle with exactly one solution", () => {
    for (let i = 0; i < 50; i++) {
      expect(solve(generateBoard())).toHaveLength(1);
    }
  });
});

// Test solving on known solution
describe("solve on known solution", () => {
  it("solves a fully filled valid board correctly", () => {
    const serialized = validBoardsSerialized[0];
    const solution = splitStringEvery(6, serialized).map(
      (line) => splitStringEvery(1, line).map(Number) as (0 | 1)[],
    );
    const solutions = solve(solution as Board);
    expect(solutions).toEqual([solution]);
  });
});

describe("findHint", () => {
  it("leads every step to the solution until the board is full", () => {
    for (const puzzleNumber of [1, 2, 3]) {
      const board = generateBoard(puzzleNumber);
      const [solution] = solve(board);
      let hint = findHint(board, solution);
      while (hint) {
        expect(hint.rule).not.toBe("mistake");
        expect(hint.targets.length).toBeGreaterThan(0);
        for (const {
          cell: [row, col],
          value,
        } of hint.targets) {
          expect(board[row][col]).toBe(null);
          expect(value).toBe(solution[row][col]);
          board[row][col] = value;
        }
        hint = findHint(board, solution);
      }
      expect(board).toEqual(solution);
    }
  });

  it("explains a pair with the two cells next to the target", () => {
    const solution = solve(generateBoard(1))[0];
    // Оставляем на пустой доске только первую пару одинаковых соседей в строке
    const row = solution.findIndex((line) =>
      line.some((value, col) => value === line[col + 1]),
    );
    const col = solution[row].findIndex(
      (value, c) => value === solution[row][c + 1],
    );
    const board: Board = solution.map((line) => line.map(() => null));
    board[row][col] = solution[row][col];
    board[row][col + 1] = solution[row][col + 1];

    const hint = findHint(board, solution);
    const value = solution[row][col] === 0 ? 1 : 0;
    const targetCol = col > 0 ? col - 1 : col + 2;
    expect(hint).toEqual({
      rule: "pair",
      line: "row",
      value,
      targets: [{ cell: [row, targetCol], value }],
      clues: [
        [row, col],
        [row, col + 1],
      ],
    });
  });

  it("points at wrong cells before anything else", () => {
    const board = generateBoard(1);
    const [solution] = solve(board);
    const [row, col] = [0, 1, 2, 3, 4, 5]
      .flatMap((r) => [0, 1, 2, 3, 4, 5].map((c) => [r, c]))
      .find(([r, c]) => board[r][c] === null)!;
    board[row][col] = solution[row][col] === 0 ? 1 : 0;
    expect(findHint(board, solution)).toEqual({
      rule: "mistake",
      targets: [{ cell: [row, col], value: solution[row][col] }],
      clues: [],
    });
  });
});
