import { describe, it, expect } from "vitest";
import {
  BOARD_SIZES,
  getNextValue,
  generateSolution,
  isValidSolution,
  generateGame,
  generateHardGame,
  rateDifficulty,
  solve,
  findHint,
  flipValue,
  hasCell,
} from "./model";
import type { Board, Hint, HintRule } from "./model";

// Test cycling values
describe("getNextValue", () => {
  it("cycles null -> 0 -> 1 -> null", () => {
    expect(getNextValue(null)).toBe(0);
    expect(getNextValue(0)).toBe(1);
    expect(getNextValue(1)).toBe(null);
  });
});

describe("generateSolution", () => {
  it.each([2, 4, 6, 8])("returns a valid %ix%i solution", (size) => {
    for (let i = 0; i < 20; i++) {
      const solution = generateSolution(size);
      expect(solution).toHaveLength(size);
      expect(isValidSolution(solution)).toBe(true);
    }
  });
});

describe.each(BOARD_SIZES)("generateGame(%i)", (size) => {
  it("returns a board structure with valid cell values", () => {
    const { puzzle } = generateGame(size);
    expect(puzzle).toHaveLength(size);
    puzzle.forEach((row) => {
      expect(row).toHaveLength(size);
      row.forEach((cell) => {
        expect([0, 1, null]).toContain(cell);
      });
    });
  });

  it("returns a puzzle with exactly one solution", () => {
    for (let i = 0; i < 20; i++) {
      const { puzzle, solution } = generateGame(size);
      expect(solve(puzzle)).toEqual([solution]);
    }
  });
});

describe("rateDifficulty", () => {
  it("rates a solved board as zero", () => {
    const solution = generateSolution(6);
    expect(rateDifficulty(solution, solution)).toBe(0);
  });

  it("counts only empty cells when basic rules are enough", () => {
    // Одна пустая клетка выводится «половиной» — думать вперёд не нужно
    const solution = generateSolution(6);
    const puzzle: Board = solution.map((line) => [...line]);
    puzzle[0][0] = null;
    expect(rateDifficulty(puzzle, solution)).toBe(1);
  });
});

describe.each(BOARD_SIZES)("generateHardGame(%i)", (size) => {
  it("returns a puzzle with exactly one solution", () => {
    const { puzzle, solution } = generateHardGame(size, 50);
    expect(solve(puzzle)).toEqual([solution]);
  });

  it("stays within the time limit", () => {
    const start = performance.now();
    generateHardGame(size, 100);
    expect(performance.now() - start).toBeLessThan(100);
  });

  it("returns a puzzle even when the limit is zero", () => {
    const { puzzle, solution } = generateHardGame(size, 0);
    expect(solve(puzzle)).toEqual([solution]);
  });
});

describe("solve on known solution", () => {
  it("solves a fully filled valid board correctly", () => {
    const solution = generateSolution(6);
    expect(solve(solution)).toEqual([solution]);
  });
});

describe("findHint", () => {
  it("leads every step to the solution until the board is full", () => {
    for (const size of [...BOARD_SIZES, ...BOARD_SIZES]) {
      const { puzzle: board, solution } = generateGame(size);
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
    const solution = generateSolution(6);
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

  // Идёт по подсказкам случайных партий, пока не встретит нужное правило
  const findHintWithRule = (rule: HintRule) => {
    for (let game = 0; game < 50; game++) {
      const { puzzle: board, solution } = generateGame(10);
      let hint = findHint(board, solution);
      while (hint) {
        if (hint.rule === rule) return { board, hint };
        for (const {
          cell: [row, col],
          value,
        } of hint.targets) {
          board[row][col] = value;
        }
        hint = findHint(board, solution);
      }
    }
    throw new Error(`No "${rule}" hint found`);
  };

  // Клетки линии, проходящей через клетку, в направлении подсказки
  const lineOf = (hint: Hint, size: number) => {
    const [[row, col]] = hint.targets.map(({ cell }) => cell);
    return Array.from({ length: size }, (_, i): [number, number] =>
      hint.rule !== "mistake" && hint.line === "row" ? [row, i] : [i, col],
    );
  };

  it("explains a look-ahead with the filled cells of its line", () => {
    const { board, hint } = findHintWithRule("lookahead");
    expect(hint.targets).toHaveLength(1);
    const filled = lineOf(hint, board.length).filter(
      ([r, c]) => board[r][c] !== null,
    );
    expect(hint.clues).toEqual(filled);
  });

  it("explains twins with the line the target line would copy", () => {
    const { board, hint } = findHintWithRule("twins");
    if (hint.rule !== "twins") throw new Error("unreachable");
    const size = board.length;
    const line = lineOf(hint, size);
    const [{ cell: target }] = hint.targets;
    const position = line.findIndex(
      ([r, c]) => r === target[0] && c === target[1],
    );
    const at = ([r, c]: [number, number]) => board[r][c];

    // Среди подсказанных клеток есть целая линия, совпадающая с нашей
    // на заполненных клетках и отличающаяся в целевой
    const twins = Array.from({ length: size }, (_, k) =>
      Array.from({ length: size }, (_, i): [number, number] =>
        hint.line === "row" ? [k, i] : [i, k],
      ),
    ).filter(
      (other) =>
        other.every((cell) => hasCell(hint.clues, ...cell)) &&
        other.every((cell) => at(cell) !== null) &&
        line.every((cell, i) => at(cell) === null || at(cell) === at(other[i])),
    );
    expect(twins.length).toBeGreaterThan(0);
    for (const twin of twins) {
      expect(at(twin[position])).toBe(flipValue(hint.value));
    }
  });

  it("points at wrong cells before anything else", () => {
    const { puzzle: board, solution } = generateGame(6);
    const cells = board.flatMap((line, r) => line.map((_, c) => [r, c]));
    const [row, col] = cells.find(([r, c]) => board[r][c] === null)!;
    board[row][col] = flipValue(solution[row][col]);
    const hint = findHint(board, solution);
    expect(hint?.rule).toBe("mistake");
    expect(hint?.targets).toEqual([
      { cell: [row, col], value: solution[row][col] },
    ]);
  });

  it("explains a mistake that makes three in a row", () => {
    const solution = generateSolution(6);
    const row = solution.findIndex((line) =>
      line.some((value, col) => value === line[col + 1]),
    );
    const col = solution[row].findIndex(
      (value, c) => value === solution[row][c + 1],
    );
    const board: Board = solution.map((line) => line.map(() => null));
    board[row][col] = solution[row][col];
    board[row][col + 1] = solution[row][col + 1];
    // Рядом с парой ставим третье такое же значение
    const wrongCol = col > 0 ? col - 1 : col + 2;
    board[row][wrongCol] = solution[row][col];

    expect(findHint(board, solution)).toEqual({
      rule: "mistake",
      reason: "three",
      line: "row",
      targets: [{ cell: [row, wrongCol], value: solution[row][wrongCol] }],
      clues: [
        [row, col],
        [row, col + 1],
      ],
    });
  });

  it("calls a mistake the rules don't decide yet a guess", () => {
    const solution = generateSolution(6);
    const board: Board = solution.map((line) => line.map(() => null));
    board[0][0] = flipValue(solution[0][0]);
    board[3][3] = flipValue(solution[3][3]);

    expect(findHint(board, solution)).toEqual({
      rule: "mistake",
      reason: "guess",
      line: null,
      targets: [
        { cell: [0, 0], value: solution[0][0] },
        { cell: [3, 3], value: solution[3][3] },
      ],
      clues: [],
    });
  });

  it("backs every explained mistake with a rule", () => {
    for (let game = 0; game < 30; game++) {
      const { puzzle: board, solution } = generateGame(8);
      const empty = board
        .flatMap((line, r) => line.map((_, c): [number, number] => [r, c]))
        .filter(([r, c]) => board[r][c] === null);
      const [row, col] = empty[game % empty.length];
      board[row][col] = flipValue(solution[row][col]);

      const hint = findHint(board, solution);
      if (hint?.rule !== "mistake") throw new Error("Expected a mistake");
      expect(hint.targets).toEqual([
        { cell: [row, col], value: solution[row][col] },
      ]);
      if (hint.reason === "guess") continue;
      // Объяснение опирается на клетки линии ошибки или на её двойника
      expect(hint.line).not.toBe(null);
      expect(hint.clues.length).toBeGreaterThan(0);
      expect(hasCell(hint.clues, row, col)).toBe(false);
    }
  });
});
