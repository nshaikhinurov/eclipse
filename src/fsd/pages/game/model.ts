import { shuffle, transposeMatrix, uniqueArray } from "~/fsd/shared/lib/utils";

export type CellValue = 0 | 1 | null;
export type Board = CellValue[][];

export const BOARD_SIZES = [6, 8, 10] as const;
export type BoardSize = (typeof BOARD_SIZES)[number];

export function getNextValue(value: CellValue): CellValue {
  if (value === null) {
    return 0;
  }

  if (value === 0) {
    return 1;
  }

  return null;
}

export const createEmptyBoard = (size: number): Board =>
  Array.from({ length: size }, () => Array<CellValue>(size).fill(null));

export type Solution = (0 | 1)[][];

// Решение отдаём вместе с головоломкой: подсказкам и кнопке Solve не придётся искать его перебором
export const generateGame = (size: BoardSize = 6) => {
  const solution = generateSolution(size);
  return { puzzle: generatePuzzle(solution), solution };
};

// Время на подбор сложной головоломки: успеваем сравнить
// около 30 кандидатов на 10×10 и пару сотен на 6×6
export const HARD_GAME_TIME_LIMIT = 500;

/**
 * Функция generateHardGame генерирует головоломки, пока не выйдет время, и оставляет самую сложную.
 * Следующего кандидата не начинаем, если самый долгий из прошлых не уложился бы в остаток времени.
 * Первый кандидат генерируется всегда, даже если лимит меньше времени его генерации.
 *
 * @param size - сторона доски
 * @param timeLimit - сколько миллисекунд можно потратить на подбор
 * @returns самая сложная из найденных головоломок вместе с решением.
 */
export function generateHardGame(
  size: BoardSize = 6,
  timeLimit = HARD_GAME_TIME_LIMIT,
) {
  const deadline = performance.now() + timeLimit;
  let best: ReturnType<typeof generateGame> | null = null;
  let bestDifficulty = -1;
  let slowest = 0;

  while (!best || performance.now() + slowest < deadline) {
    const start = performance.now();
    const game = generateGame(size);
    const difficulty = rateDifficulty(game.puzzle, game.solution);
    if (difficulty > bestDifficulty) {
      best = game;
      bestDifficulty = difficulty;
    }
    slowest = Math.max(slowest, performance.now() - start);
  }

  return best;
}

/**
 * Функция rateDifficulty проходит головоломку по подсказкам и считает ходы,
 * на которых базовых правил (пара, сэндвич, половина) не хватило и пришлось
 * думать на всю линию вперёд. При равенстве сложнее та, где меньше открытых клеток.
 *
 * @param puzzle - головоломка без ошибок
 * @param solution - её решение
 * @returns оценка сложности: чем больше, тем сложнее.
 */
export function rateDifficulty(puzzle: Board, solution: Solution): number {
  const board = deepCopy(puzzle);
  const emptyCells = puzzle.flat().filter((value) => value === null).length;
  let thinkAheadMoves = 0;

  for (
    let hint = findHint(board, solution);
    hint;
    hint = findHint(board, solution)
  ) {
    if (hint.rule === "lookahead" || hint.rule === "twins") thinkAheadMoves++;
    for (const {
      cell: [row, col],
      value,
    } of hint.targets) {
      board[row][col] = value;
    }
  }

  // Пустых клеток меньше, чем клеток на доске, поэтому они решают только при равном числе ходов
  return thinkAheadMoves * board.length ** 2 + emptyCells;
}

/**
 * Функция generateSolution собирает случайную решённую доску:
 * перебирает допустимые строки в случайном порядке и откатывается,
 * как только столбцы нарушают правила.
 *
 * Изредка случайный порядок заводит перебор в долгий тупик. Поэтому число шагов
 * ограничено: исчерпав лимит, начинаем заново с другим порядком — это быстрее, чем выбираться.
 *
 * @param size - сторона доски
 * @returns полностью заполненная корректная доска.
 */
export function generateSolution(size: number): Solution {
  const validLines = getValidLines(size);

  while (true) {
    const rows: (0 | 1)[][] = [];
    let stepsLeft = SOLUTION_STEP_LIMIT;

    const fillRows = (): boolean => {
      if (rows.length === size) {
        return isValidSolution(rows);
      }
      for (const line of shuffle(validLines)) {
        if (stepsLeft-- <= 0) return false;
        if (rows.includes(line)) continue;
        rows.push(line);
        if (fitsColumns(rows, size) && fillRows()) {
          return true;
        }
        rows.pop();
      }
      return false;
    };

    if (fillRows()) {
      return rows.map((line) => [...line]);
    }
  }
}

const SOLUTION_STEP_LIMIT = 1000;

// Проверяет столбцы после добавления последней строки: не больше половины
// одного значения и без трёх одинаковых подряд
function fitsColumns(rows: (0 | 1)[][], size: number): boolean {
  const last = rows.length - 1;
  for (let c = 0; c < size; c++) {
    let ones = 0;
    for (const line of rows) ones += line[c];
    if (ones > size / 2 || rows.length - ones > size / 2) {
      return false;
    }
    if (
      last >= 2 &&
      rows[last][c] === rows[last - 1][c] &&
      rows[last][c] === rows[last - 2][c]
    ) {
      return false;
    }
  }
  return true;
}

export function isValidSolution(board: Board): boolean {
  const size = board.length;
  const transposedBoard = transposeMatrix(board);

  return (
    board.every((line) => isValidLine(line as number[], size)) &&
    transposedBoard.every((line) => isValidLine(line as number[], size)) &&
    uniqueArray(board).length === size &&
    uniqueArray(transposedBoard).length === size
  );
}

// Допустимые строки не меняются от партии к партии — считаем их один раз на размер
const validLinesCache = new Map<number, (0 | 1)[][]>();

function getValidLines(size: number): (0 | 1)[][] {
  const cached = validLinesCache.get(size);
  if (cached) {
    return cached;
  }

  // Перебираем все двоичные строки длины size как битовые маски: для 10×10 это всего 1024 варианта
  const results: (0 | 1)[][] = [];
  for (let mask = 0; mask < 1 << size; mask++) {
    const line = Array.from(
      { length: size },
      (_, i) => ((mask >> (size - 1 - i)) & 1) as 0 | 1,
    );
    if (isValidLineOptimized(line, size)) {
      results.push(line);
    }
  }

  validLinesCache.set(size, results);
  return results;
}

// Оптимизированная версия isValidLine - без преобразования в строку
function isValidLine(line: number[], size: number): boolean {
  if (line.length !== size) {
    return false;
  }

  return isValidLineOptimized(line, size);
}

// Выделяем логику проверки в отдельную функцию для оптимизации
function isValidLineOptimized(line: number[], size: number): boolean {
  // Проверка на три подряд без преобразования в строку
  for (let i = 0; i < size - 2; i++) {
    if (line[i] === line[i + 1] && line[i] === line[i + 2]) {
      return false;
    }
  }

  // Подсчет суммы напрямую
  let sum = 0;
  for (let i = 0; i < size; i++) {
    sum += line[i];
  }

  return sum === size / 2;
}

/**
 * Функция isValid проверяет корректность доски Takuzo по правилам:
 * 1. В строке и столбце нулей и единиц не больше половины. Если строка/столбец полностью заполнены,
 *    нулей и единиц должно быть поровну.
 * 2. Нельзя иметь три одинаковых числа подряд.
 * 3. Если строка или столбец полностью заполнены, они должны быть уникальными.
 *
 * @param board - квадратная доска, где ячейки могут быть 0, 1 или null.
 * @param row - индекс строки, в которой произошло последнее изменение.
 * @param col - индекс столбца, в котором произошло последнее изменение.
 * @returns true, если доска не нарушает правила, иначе false.
 */
export function isValid(b: Board, row: number, col: number): boolean {
  const size = b.length;
  const half = size / 2;
  // Проверка строки
  const currentRow = b[row];
  let count0 = 0,
    count1 = 0;
  for (let i = 0; i < size; i++) {
    const cell = currentRow[i];
    if (cell === 0) count0++;
    if (cell === 1) count1++;
    // Если три подряд одинаковых (и не null), то правило нарушается
    if (
      i >= 2 &&
      cell !== null &&
      currentRow[i - 1] === cell &&
      currentRow[i - 2] === cell
    ) {
      return false;
    }
  }
  // Если в строке уже больше половины нулей или единиц, правило нарушается
  if (count0 > half || count1 > half) return false;
  // Если строка полностью заполнена, нулей и единиц должно быть поровну
  if (!currentRow.includes(null)) {
    if (count0 !== half || count1 !== half) return false;
    // Проверка уникальности: не должно существовать другой полностью заполненной строки, идентичной данной
    for (let r = 0; r < size; r++) {
      if (r === row) continue;
      const otherRow = b[r];
      if (!otherRow.includes(null)) {
        let identical = true;
        for (let j = 0; j < size; j++) {
          if (currentRow[j] !== otherRow[j]) {
            identical = false;
            break;
          }
        }
        if (identical) return false;
      }
    }
  }

  // Проверка столбца
  let colCount0 = 0,
    colCount1 = 0;
  for (let r = 0; r < size; r++) {
    const cell = b[r][col];
    if (cell === 0) colCount0++;
    if (cell === 1) colCount1++;
    // Проверка трёх подряд одинаковых значений в столбце
    if (
      r >= 2 &&
      cell !== null &&
      b[r - 1][col] === cell &&
      b[r - 2][col] === cell
    ) {
      return false;
    }
  }
  if (colCount0 > half || colCount1 > half) return false;
  // Определяем, заполнен ли столбец полностью
  let colComplete = true;
  for (let r = 0; r < size; r++) {
    if (b[r][col] === null) {
      colComplete = false;
      break;
    }
  }
  if (colComplete) {
    // Если столбец полностью заполнен, нулей и единиц должно быть поровну
    if (colCount0 !== half || colCount1 !== half) return false;
    // Проверка уникальности столбца: среди полностью заполненных столбцов не должно быть столбца, идентичного текущему
    for (let c = 0; c < size; c++) {
      if (c === col) continue;
      let otherColComplete = true;
      for (let r = 0; r < size; r++) {
        if (b[r][c] === null) {
          otherColComplete = false;
          break;
        }
      }
      if (!otherColComplete) continue;
      let identical = true;
      for (let r = 0; r < size; r++) {
        if (b[r][c] !== b[r][col]) {
          identical = false;
          break;
        }
      }
      if (identical) return false;
    }
  }
  return true;
}

/**
 * Функция deepCopy создает глубокую копию доски Takuzo.
 * @param b Доска Takuzo, представленная в виде массива массивов.
 * @returns Глубокая копия доски.
 */
const deepCopy = (b: Board): Board => b.map((row) => row.slice());

/**
 * Функция solve принимает частично заполненную доску Takuzo,
 * где каждая ячейка может содержать null, 0 или 1, и возвращает массив
 * всех возможных корректных решений (полностью заполненных досок), удовлетворяющих правилам:
 *   1. В каждой строке и столбце нулей и единиц поровну.
 *   2. Нельзя иметь три одинаковых числа подряд в строке или столбце.
 *   3. Все заполненные строки и столбцы должны быть уникальными.
 *
 * Решение реализовано итеративно (без рекурсии) с использованием явного стека (индекса и массива state).
 */
export function solve(board: Board): (0 | 1)[][][] {
  const solutions: (0 | 1)[][][] = [];

  // Собираем позиции всех пустых ячеек (где значение равно null)
  const emptyCells: { row: number; col: number }[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === null) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }

  // Массив state для хранения последнего выбранного кандидата для каждой пустой ячейки.
  // Значения: -1 (не пробовали ни 0, ни 1), затем 0, затем 1.
  const state: number[] = new Array(emptyCells.length).fill(-1);

  // Создаем рабочую копию доски, которую будем заполнять в процессе перебора.
  const currentBoard = deepCopy(board);

  // Итеративный перебор (аналог рекурсивного бэктрекинга) с использованием указателя index.
  let index = 0;
  while (index >= 0) {
    // Если index равен количеству пустых ячеек, значит доска полностью заполнена – решение найдено.
    if (index === emptyCells.length) {
      solutions.push(deepCopy(currentBoard) as (0 | 1)[][]);
      // После нахождения решения делаем откат на предыдущую ячейку, чтобы попробовать альтернативные варианты.
      index--;
      continue;
    }
    const { row, col } = emptyCells[index];
    // Переходим к следующему кандидату для текущей ячейки: сначала будет 0, затем 1.
    state[index]++;
    // Если кандидат превышает 1, варианты для данной ячейки исчерпаны – делаем откат.
    if (state[index] > 1) {
      currentBoard[row][col] = null; // сбрасываем значение ячейки
      state[index] = -1; // сбрасываем состояние для текущей ячейки
      index--; // возвращаемся на предыдущую ячейку
      continue;
    }
    // Присваиваем кандидата (0 или 1) в текущей ячейке
    currentBoard[row][col] = state[index] as 0 | 1;
    // Если после присвоения доска всё ещё удовлетворяет правилам, переходим к следующей пустой ячейке
    if (isValid(currentBoard, row, col)) {
      index++;
    }
    // Если условие не выполнено, цикл вернется сюда и попробует следующий кандидат для данной ячейки
  }
  return solutions;
}

/**
 * Функция generatePuzzle принимает полностью заполненную доску Takuzo
 * и по жадному алгоритму удаляет (опустошает) клетки в случайном порядке до тех пор,
 * пока доска сохраняет уникальное решение.
 *
 * Алгоритм:
 * 1. Создаем копию полностью заполненной доски.
 * 2. Генерируем список всех позиций клеток и перемешиваем его.
 * 3. Для каждой клетки из перемешанного списка:
 *    - Сохраняем текущее значение.
 *    - Устанавливаем значение в клетке в null.
 *    - Проверяем, решается ли доска логикой по линиям (через simulateForcedSolving).
 *      Если да, оставляем клетку пустой, иначе восстанавливаем сохраненное значение.
 *      Каждый такой ход обязателен для любого решения, поэтому такая доска
 *      решается однозначно — отдельный перебор решений не нужен.
 * 4. Возвращаем полученную доску.
 *
 * @param filledBoard - полностью заполненная доска с значениями 0 и 1.
 * @returns доска с максимально опустошенными клетками, но с единственным решением.
 */
function generatePuzzle(filledBoard: (0 | 1)[][]): Board {
  // Создаем рабочую копию, в которой будем опустошать клетки
  const puzzleBoard: Board = deepCopy(filledBoard);
  const size = filledBoard.length;

  // Генерируем список всех позиций клеток
  const positions: { row: number; col: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push({ row: r, col: c });
    }
  }

  // Перемешиваем позиции клеток
  const shuffledPositions = shuffle(positions);

  // Для каждой позиции пытаемся удалить значение, если доска продолжает иметь уникальное решение
  for (const pos of shuffledPositions) {
    const { row, col } = pos;
    // Сохраняем исходное значение
    const temp = puzzleBoard[row][col];
    // Пробуем удалить значение
    puzzleBoard[row][col] = null;
    // Проверяем, что доска после удаления всё ещё решается методом последовательных очевидных ходов.
    if (!simulateForcedSolving(puzzleBoard)) {
      // Иначе восстанавливаем значение.
      puzzleBoard[row][col] = temp;
    }
  }

  return puzzleBoard;
}

export type Cell = [row: number, col: number];

export const hasCell = (cells: Cell[], row: number, col: number) =>
  cells.some(([r, c]) => r === row && c === col);

export const flipValue = (value: 0 | 1): 0 | 1 => (value === 0 ? 1 : 0);

// Правило, по которому значение пустой клетки выводится однозначно.
// lookahead — другое значение не даёт заполнить линию без трёх подряд,
// twins — с другим значением линия может стать только копией уже заполненной
export type HintRule = "pair" | "sandwich" | "half" | "lookahead" | "twins";

type Deduction = {
  rule: HintRule;
  line: "row" | "col";
  value: 0 | 1;
  // Клетки, на которые опирается вывод
  clues: Cell[];
};

export type HintTarget = { cell: Cell; value: 0 | 1 };

// Почему значение игрока не подходит.
// three, half, copy — оно уже нарушает правило: три подряд, больше половины, копия заполненной линии.
// lookahead, twins — правило нарушится, когда линию станут заполнять.
// guess — строка и столбец клетку пока не определяют: ход наугад, тупик вскроется позже
export type MistakeReason =
  "three" | "half" | "copy" | "lookahead" | "twins" | "guess";

type MistakeExplanation = {
  reason: MistakeReason;
  line: "row" | "col" | null;
  clues: Cell[];
};

export type Hint =
  | ({ targets: HintTarget[] } & Deduction)
  | ({ rule: "mistake"; targets: HintTarget[] } & MistakeExplanation);

// Все клетки строки или столбца, проходящих через клетку (row, col)
const lineCells = (
  size: number,
  line: "row" | "col",
  row: number,
  col: number,
): Cell[] =>
  Array.from({ length: size }, (_, i): Cell =>
    line === "row" ? [row, i] : [i, col],
  );

/**
 * Функция findDeductions перечисляет, какие базовые правила (половина линии заполнена
 * одним значением, запрет трёх подряд) диктуют значение пустой клетки и на какие клетки они опираются.
 * На доске без ошибок все выводы для клетки дают одно и то же значение.
 */
function findDeductions(board: Board, row: number, col: number): Deduction[] {
  const deductions: Deduction[] = [];
  const valueAt = ([r, c]: Cell) => board[r][c];
  const half = board.length / 2;

  for (const line of ["row", "col"] as const) {
    const cells = lineCells(board.length, line, row, col);
    const index = line === "row" ? col : row;

    // Два одинаковых значения подряд с одной из сторон: третье такое же поставить нельзя
    const pairs = [
      [cells[index - 2], cells[index - 1]],
      [cells[index + 1], cells[index + 2]],
    ];
    for (const pair of pairs) {
      if (!pair[0] || !pair[1]) continue;
      const value = valueAt(pair[0]);
      if (value !== null && value === valueAt(pair[1])) {
        deductions.push({
          rule: "pair",
          line,
          value: flipValue(value),
          clues: pair,
        });
      }
    }

    // Клетка зажата между двумя одинаковыми значениями
    const before = cells[index - 1];
    const after = cells[index + 1];
    if (before && after) {
      const value = valueAt(before);
      if (value !== null && value === valueAt(after)) {
        deductions.push({
          rule: "sandwich",
          line,
          value: flipValue(value),
          clues: [before, after],
        });
      }
    }

    // В линии уже половина одного значения — остальные клетки получают другое
    const filled = cells.filter((cell) => valueAt(cell) !== null);
    for (const value of [0, 1] as const) {
      if (filled.filter((cell) => valueAt(cell) === value).length === half) {
        deductions.push({
          rule: "half",
          line,
          value: flipValue(value),
          clues: filled,
        });
      }
    }
  }

  return deductions;
}

// Допустимые линии как битовые маски: бит i — клетка i, 1 — солнце
const validMasksCache = new Map<number, number[]>();

function getValidMasks(size: number): number[] {
  const cached = validMasksCache.get(size);
  if (cached) {
    return cached;
  }
  const masks = getValidLines(size).map((line) =>
    line.reduce<number>((mask, value, i) => mask | (value << i), 0),
  );
  validMasksCache.set(size, masks);
  return masks;
}

// Линия доски в виде масок: какие клетки заполнены и в каких из них солнце
type LineMasks = { filled: number; ones: number };

const lineCellAt = (isRow: boolean, index: number, i: number): Cell =>
  isRow ? [index, i] : [i, index];

function readLine(board: Board, isRow: boolean, index: number): LineMasks {
  let filled = 0;
  let ones = 0;
  for (let i = 0; i < board.length; i++) {
    const [r, c] = lineCellAt(isRow, index, i);
    const value = board[r][c];
    if (value === null) continue;
    filled |= 1 << i;
    if (value === 1) ones |= 1 << i;
  }
  return { filled, ones };
}

// Маски заполненных линий того же направления, кроме линии index: повторять их нельзя
const completedMasks = (lines: LineMasks[], index: number, full: number) =>
  lines
    .filter((line, i) => i !== index && line.filled === full)
    .map((line) => line.ones);

/**
 * Функция analyzeLine перебирает все допустимые заполнения линии, совместимые с её клетками,
 * и находит пустые клетки, значение которых во всех заполнениях одинаково.
 * Это покрывает и базовые правила, и выводы на несколько ходов вперёд в пределах линии.
 *
 * @param size - длина линии
 * @param line - текущее состояние линии
 * @param twins - заполненные линии, которые нельзя повторить
 * @returns маски клеток, которые обязаны быть солнцем и луной, или null, если заполнить линию нельзя.
 */
function analyzeLine(
  size: number,
  line: LineMasks,
  twins: number[],
): { ones: number; zeros: number } | null {
  const full = (1 << size) - 1;
  let ones = full;
  let zeros = full;
  let found = false;
  for (const mask of getValidMasks(size)) {
    if ((mask & line.filled) !== line.ones || twins.includes(mask)) continue;
    ones &= mask;
    zeros &= ~mask;
    found = true;
  }
  if (!found) return null;
  return { ones: ones & ~line.filled, zeros: zeros & full & ~line.filled };
}

/**
 * Функция findLineDeductions находит выводы, которых нет в базовых правилах:
 * клетку, где другое значение не даёт заполнить линию без трёх подряд (lookahead)
 * или оставляет линии только путь в копию уже заполненной (twins).
 * Сначала идут линии с меньшим числом пустых клеток — в них вывод заметить проще.
 */
function findLineDeductions(
  board: Board,
): { cell: Cell; deduction: Deduction }[] {
  const size = board.length;
  const full = (1 << size) - 1;
  const found: { cell: Cell; deduction: Deduction; empty: number }[] = [];

  for (const isRow of [true, false]) {
    const lines = Array.from({ length: size }, (_, k) =>
      readLine(board, isRow, k),
    );
    lines.forEach((line, k) => {
      if (line.filled === full) return;
      const plain = analyzeLine(size, line, []);
      const strict = analyzeLine(size, line, completedMasks(lines, k, full));
      if (!plain || !strict) return;

      const filledCells: Cell[] = [];
      for (let i = 0; i < size; i++) {
        if ((line.filled >> i) & 1) filledCells.push(lineCellAt(isRow, k, i));
      }
      const empty = size - filledCells.length;

      for (let i = 0; i < size; i++) {
        const bit = 1 << i;
        if (!((strict.ones | strict.zeros) & bit)) continue;
        const value: 0 | 1 = strict.ones & bit ? 1 : 0;
        const isLookahead = Boolean((plain.ones | plain.zeros) & bit);
        // Для twins подсвечиваем линии, в копию которых превратилась бы эта при другом значении
        const copied = isLookahead
          ? []
          : lines.flatMap((other, j) =>
              j !== k &&
              other.filled === full &&
              (other.ones & line.filled) === line.ones &&
              ((other.ones >> i) & 1) !== value
                ? Array.from({ length: size }, (_, n) =>
                    lineCellAt(isRow, j, n),
                  )
                : [],
            );
        found.push({
          cell: lineCellAt(isRow, k, i),
          deduction: {
            rule: isLookahead ? "lookahead" : "twins",
            line: isRow ? "row" : "col",
            value,
            clues: [...copied, ...filledCells],
          },
          empty,
        });
      }
    });
  }

  return found.sort((a, b) => a.empty - b.empty);
}

// Сначала показываем самые наглядные правила
const HINT_RULE_PRIORITY: HintRule[] = [
  "pair",
  "sandwich",
  "half",
  "lookahead",
  "twins",
];

/**
 * Функция findConflict проверяет, нарушает ли значение клетки правило уже сейчас:
 * три одинаковых подряд, больше половины одного значения в линии или копия другой заполненной линии.
 *
 * @param board - текущая доска игрока
 * @param cell - заполненная клетка
 * @returns объяснение с клетками, вместе с которыми нарушено правило, или null.
 */
function findConflict(
  board: Board,
  [row, col]: Cell,
): MistakeExplanation | null {
  const size = board.length;
  const value = board[row][col];
  const valueAt = ([r, c]: Cell) => board[r][c];
  const lines = (["row", "col"] as const).map((line) => ({
    line,
    cells: lineCells(size, line, row, col),
    index: line === "row" ? col : row,
  }));

  for (const { line, cells, index } of lines) {
    // Серия одинаковых значений, в которую входит клетка
    let start = index;
    while (start > 0 && valueAt(cells[start - 1]) === value) start--;
    let end = index;
    while (end < size - 1 && valueAt(cells[end + 1]) === value) end++;
    if (end - start >= 2) {
      const run = cells.slice(start, end + 1);
      return {
        reason: "three",
        line,
        clues: run.filter((_, i) => start + i !== index),
      };
    }
  }

  for (const { line, cells, index } of lines) {
    const same = cells.filter((cell) => valueAt(cell) === value);
    if (same.length > size / 2) {
      return {
        reason: "half",
        line,
        clues: same.filter((cell) => cell !== cells[index]),
      };
    }
  }

  for (const { line, cells } of lines) {
    if (cells.some((cell) => valueAt(cell) === null)) continue;
    for (let k = 0; k < size; k++) {
      if (k === (line === "row" ? row : col)) continue;
      const other = cells.map(([r, c]): Cell =>
        line === "row" ? [k, c] : [r, k],
      );
      if (other.every((cell, i) => valueAt(cell) === valueAt(cells[i]))) {
        return { reason: "copy", line, clues: other };
      }
    }
  }

  return null;
}

/**
 * Функция explainMistakes объясняет, почему клетки игрока не подходят.
 * Сначала ищет клетку, которая уже нарушает правило, затем — клетку, значение которой
 * выводится по её строке или столбцу, если убрать с доски все ошибки.
 * Такие клетки показываем по одной. Остальные ошибки — ходы наугад: правила их пока
 * не определяют, поэтому показываем их все сразу.
 *
 * @param board - текущая доска игрока
 * @param solution - решение головоломки
 * @param mistakes - неверные клетки с правильными значениями
 * @returns подсказка об ошибке.
 */
function explainMistakes(
  board: Board,
  solution: Solution,
  mistakes: HintTarget[],
): Hint {
  for (const target of mistakes) {
    const conflict = findConflict(board, target.cell);
    if (conflict) {
      return { rule: "mistake", ...conflict, targets: [target] };
    }
  }

  // Выводы «три подряд» и «половина» на доске без ошибок означали бы конфликт выше,
  // поэтому остаётся проверить только выводы по линии целиком
  const clean = board.map((line, r) =>
    line.map((value, c) => (value === solution[r][c] ? value : null)),
  );
  const lineDeductions = findLineDeductions(clean);
  for (const target of mistakes) {
    const found = lineDeductions.find(
      ({ cell: [r, c] }) => r === target.cell[0] && c === target.cell[1],
    );
    if (found) {
      const { rule, line, clues } = found.deduction;
      return {
        rule: "mistake",
        reason: rule as "lookahead" | "twins",
        line,
        clues,
        targets: [target],
      };
    }
  }

  return {
    rule: "mistake",
    reason: "guess",
    line: null,
    clues: [],
    targets: mistakes,
  };
}

/**
 * Функция findHint подбирает подсказку для текущей доски:
 * если игрок ошибся, указывает на неверные клетки, иначе — на клетку,
 * значение которой следует из правил, вместе с клетками-причинами.
 * Выводы по линиям ищем, только когда базовые правила ничего не дают.
 *
 * @param board - текущая доска игрока
 * @param solution - решение головоломки
 * @returns подсказка или null, если подсказать нечего.
 */
export function findHint(board: Board, solution: Solution): Hint | null {
  const mistakes: HintTarget[] = [];
  const deductions: { cell: Cell; deduction: Deduction }[] = [];

  board.forEach((line, row) =>
    line.forEach((value, col) => {
      if (value === null) {
        for (const deduction of findDeductions(board, row, col)) {
          deductions.push({ cell: [row, col], deduction });
        }
      } else if (value !== solution[row][col]) {
        mistakes.push({ cell: [row, col], value: solution[row][col] });
      }
    }),
  );

  // Пока на доске есть ошибки, выводы из правил могут быть ложными
  if (mistakes.length > 0) {
    return explainMistakes(board, solution, mistakes);
  }

  if (deductions.length === 0) {
    deductions.push(...findLineDeductions(board));
  }

  for (const rule of HINT_RULE_PRIORITY) {
    const found = deductions.find(({ deduction }) => deduction.rule === rule);
    if (!found) continue;
    const { cell, deduction } = found;
    // Половина линии набрана — все её пустые клетки заполняются одним значением
    const targetCells =
      rule === "half"
        ? lineCells(board.length, deduction.line, ...cell).filter(
            ([r, c]) => board[r][c] === null,
          )
        : [cell];
    return {
      ...deduction,
      targets: targetCells.map((target) => ({
        cell: target,
        value: deduction.value,
      })),
    };
  }

  return null;
}

/**
 * Функция simulateForcedSolving имитирует процесс решения головоломки:
 * проходами по строкам и столбцам ставит клетки, которые выводит analyzeLine, пока они находятся.
 * Если в итоге доска заполнена, головоломка решается без догадок, и каждый ход
 * можно объяснить подсказкой — findHint знает те же выводы.
 * Порядок ходов на итог не влияет: каждый такой ход обязателен для любого решения.
 *
 * @param board - исходная доска Takuzo (с ячейками 0, 1 или null)
 * @returns true, если доска полностью решается логикой по линиям, иначе false.
 */
function simulateForcedSolving(board: Board): boolean {
  const simulated = deepCopy(board);
  const size = simulated.length;
  const full = (1 << size) - 1;

  let hasMoved = true;
  while (hasMoved) {
    hasMoved = false;
    for (const isRow of [true, false]) {
      const lines = Array.from({ length: size }, (_, k) =>
        readLine(simulated, isRow, k),
      );
      for (let k = 0; k < size; k++) {
        const line = lines[k];
        if (line.filled === full) continue;
        const forced = analyzeLine(size, line, completedMasks(lines, k, full));
        if (!forced) return false;
        const placed = forced.ones | forced.zeros;
        if (!placed) continue;
        for (let i = 0; i < size; i++) {
          if (!((placed >> i) & 1)) continue;
          const [r, c] = lineCellAt(isRow, k, i);
          simulated[r][c] = ((forced.ones >> i) & 1) as 0 | 1;
        }
        // Заполненная линия сразу становится запретной копией для соседних
        lines[k] = {
          filled: line.filled | placed,
          ones: line.ones | forced.ones,
        };
        hasMoved = true;
      }
    }
  }

  return simulated.every((row) => !row.includes(null));
}
