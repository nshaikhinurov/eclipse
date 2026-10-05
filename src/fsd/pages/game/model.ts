import { pickRandom, shuffle, splitStringEvery } from "~/fsd/shared/lib/utils";
import { validBoardsSerialized } from "./consts";
import {
  arrangements,
  uniqueArray,
  transposeMatrix,
} from "~/fsd/shared/lib/utils";

export type CellValue = 0 | 1 | null;
export type Board = CellValue[][];

export function getNextValue(value: CellValue): CellValue {
  if (value === null) {
    return 0;
  }

  if (value === 0) {
    return 1;
  }

  return null;
}

// Сколько солнц (1) и лун (0) уже стоит в линии
export type LineBalance = { suns: number; moons: number };

const countLine = (line: CellValue[]): LineBalance => ({
  suns: line.filter((cell) => cell === 1).length,
  moons: line.filter((cell) => cell === 0).length,
});

export function getLineBalance(board: Board): {
  rows: LineBalance[];
  cols: LineBalance[];
} {
  return {
    rows: board.map(countLine),
    cols: board.length ? transposeMatrix(board).map(countLine) : [],
  };
}

export const generateBoard = () => {
  const randomSerializedBoard = pickRandom(validBoardsSerialized);
  const randomSolution = splitStringEvery(6, randomSerializedBoard).map(
    (serializedLine) => {
      return splitStringEvery(1, serializedLine).map(Number);
    },
  ) as (0 | 1)[][];
  const randomPuzzle = generatePuzzle(randomSolution);

  return randomPuzzle;
};

export function generateAllValidBoards(size: number): Board[] {
  const validLines = getValidLines(size);
  const allBoards = arrangements(validLines, size);
  const validBoards = allBoards.filter((board) => {
    const transposedBoard = transposeMatrix(board);

    return (
      uniqueArray(board).length === size &&
      uniqueArray(transposedBoard).length === size &&
      board.every((line) => isValidLine(line, size)) &&
      transposedBoard.every((line) => isValidLine(line, size))
    );
  });

  return validBoards as Board[];
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

function getValidLines(size: number): number[][] {
  // Создаем базовый массив с равным количеством нулей и единиц
  const items = Array.from({ length: size }, (_, i) => (i < size / 2 ? 0 : 1));

  // Кэшируем результаты для повторяющихся линий
  const seen = new Set<string>();
  const results: number[][] = [];

  // Используем оптимизированную функцию генерации перестановок вместо полного перебора
  const permute = (arr: number[], start: number) => {
    if (start === arr.length - 1) {
      // Проверяем валидность линии без преобразования в строку
      if (isValidLineOptimized(arr, size)) {
        const key = arr.join(""); // Для уникальности используем строку
        if (!seen.has(key)) {
          seen.add(key);
          results.push([...arr]);
        }
      }
      return;
    }

    // Оптимизированный перебор: генерируем только те перестановки,
    // которые не нарушают правило "трех подряд"
    for (let i = start; i < arr.length; i++) {
      // Избегаем лишних перестановок с одинаковыми значениями
      if (i !== start && arr[i] === arr[start]) continue;

      [arr[start], arr[i]] = [arr[i], arr[start]]; // Swap
      permute(arr, start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]]; // Swap back
    }
  };

  permute(items, 0);
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
 * 1. В строке и столбце не более 3 нулей и 3 единиц. Если строка/столбец полностью заполнены,
 *    должно быть ровно 3 нуля и 3 единицы.
 * 2. Нельзя иметь три одинаковых числа подряд.
 * 3. Если строка или столбец полностью заполнены, они должны быть уникальными.
 *
 * @param board - доска 6×6, где ячейки могут быть 0, 1 или null.
 * @param row - индекс строки, в которой произошло последнее изменение.
 * @param col - индекс столбца, в котором произошло последнее изменение.
 * @returns true, если доска не нарушает правила, иначе false.
 */
export function isValid(b: Board, row: number, col: number): boolean {
  // Проверка строки
  const currentRow = b[row];
  let count0 = 0,
    count1 = 0;
  for (let i = 0; i < 6; i++) {
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
  // Если в строке уже больше 3 нулей или единиц, правило нарушается
  if (count0 > 3 || count1 > 3) return false;
  // Если строка полностью заполнена, должны быть ровно 3 нуля и 3 единицы
  if (!currentRow.includes(null)) {
    if (count0 !== 3 || count1 !== 3) return false;
    // Проверка уникальности: не должно существовать другой полностью заполненной строки, идентичной данной
    for (let r = 0; r < 6; r++) {
      if (r === row) continue;
      const otherRow = b[r];
      if (!otherRow.includes(null)) {
        let identical = true;
        for (let j = 0; j < 6; j++) {
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
  for (let r = 0; r < 6; r++) {
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
  if (colCount0 > 3 || colCount1 > 3) return false;
  // Определяем, заполнен ли столбец полностью
  let colComplete = true;
  for (let r = 0; r < 6; r++) {
    if (b[r][col] === null) {
      colComplete = false;
      break;
    }
  }
  if (colComplete) {
    // Если столбец полностью заполнен, должны быть ровно 3 нуля и 3 единицы
    if (colCount0 !== 3 || colCount1 !== 3) return false;
    // Проверка уникальности столбца: среди полностью заполненных столбцов не должно быть столбца, идентичного текущему
    for (let c = 0; c < 6; c++) {
      if (c === col) continue;
      let otherColComplete = true;
      for (let r = 0; r < 6; r++) {
        if (b[r][c] === null) {
          otherColComplete = false;
          break;
        }
      }
      if (!otherColComplete) continue;
      let identical = true;
      for (let r = 0; r < 6; r++) {
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
 * Функция deepCopy создает глубокую копию доски Takuzo (6×6).
 * @param b Доска Takuzo, представленная в виде массива массивов.
 * @returns Глубокая копия доски.
 */
const deepCopy = (b: Board): Board => b.map((row) => row.slice());

/**
 * Функция solve принимает частично заполненную доску Takuzo (6×6),
 * где каждая ячейка может содержать null, 0 или 1, и возвращает массив
 * всех возможных корректных решений (полностью заполненных досок), удовлетворяющих правилам:
 *   1. В каждой строке и столбце ровно 3 нуля и 3 единицы.
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
 * Функция checkUniqueSolution проверяет, что данная доска Takuzo имеет ровно одно решение.
 * Используется итеративный перебор с бэктрекингом и ранним прерыванием при нахождении второго решения.
 *
 * @param board - доска 6×6 с ячейками типа 0, 1 или null.
 * @returns true, если решение уникально, иначе false.
 */
function checkUniqueSolution(board: (0 | 1 | null)[][]): boolean {
  let solutionsCount = 0;

  // Собираем позиции всех пустых ячеек
  const emptyCells: { row: number; col: number }[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] === null) {
        emptyCells.push({ row: r, col: c });
      }
    }
  }

  // Массив для хранения состояния перебора для каждой пустой ячейки.
  const state: number[] = new Array(emptyCells.length).fill(-1);
  const currentBoard = deepCopy(board);
  let index = 0;

  // Итеративный перебор с ранним выходом, если найдено более одного решения
  while (index >= 0) {
    if (index === emptyCells.length) {
      solutionsCount++;
      // Если найдено более одного решения, можно сразу вернуть false.
      if (solutionsCount > 1) return false;
      index--;
      continue;
    }
    const { row, col } = emptyCells[index];
    state[index]++;
    if (state[index] > 1) {
      currentBoard[row][col] = null; // сбрасываем значение
      state[index] = -1;
      index--;
      continue;
    }
    currentBoard[row][col] = state[index] as 0 | 1;
    if (isValid(currentBoard, row, col)) {
      index++;
    }
  }
  // Если перебор завершён, возвращаем true только если найдено ровно одно решение.
  return solutionsCount === 1;
}

/**
 * Функция generatePuzzle принимает полностью заполненную доску Takuzo (6×6)
 * и по жадному алгоритму удаляет (опустошает) клетки в случайном порядке до тех пор,
 * пока доска сохраняет уникальное решение.
 *
 * Алгоритм:
 * 1. Создаем копию полностью заполненной доски.
 * 2. Генерируем список всех позиций клеток и перемешиваем его.
 * 3. Для каждой клетки из перемешанного списка:
 *    - Сохраняем текущее значение.
 *    - Устанавливаем значение в клетке в null.
 *    - Проверяем, имеет ли доска уникальное решение (через checkUniqueSolution).
 *      Если да, оставляем клетку пустой, иначе восстанавливаем сохраненное значение.
 * 4. Возвращаем полученную доску.
 *
 * @param filledBoard - полностью заполненная доска (6×6) с значениями 0 и 1.
 * @returns доска с максимально опустошенными клетками, но с единственным решением.
 */
function generatePuzzle(filledBoard: (0 | 1)[][]): Board {
  // Создаем рабочую копию, в которой будем опустошать клетки
  const puzzleBoard: Board = deepCopy(filledBoard);

  // Генерируем список всех позиций клеток
  const positions: { row: number; col: number }[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
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
    // Проверяем, что доска после удаления всё ещё имеет единственное решение
    // и решается методом последовательных очевидных ходов.
    if (
      !checkUniqueSolution(puzzleBoard) ||
      !simulateForcedSolving(puzzleBoard)
    ) {
      // Если хотя бы одно условие нарушается, восстанавливаем значение.
      puzzleBoard[row][col] = temp;
    }
  }

  return puzzleBoard;
}

/**
 * Тип, описывающий очевидный ход (подсказку):
 * - row, col – позиция клетки;
 * - value – единственно возможное значение (0 или 1);
 * - hints – список строк с описанием применённых правил.
 */
type ObviousMove = {
  row: number;
  col: number;
  value: 0 | 1;
  hints: string[];
};

/**
 * Функция findObviousMove ищет среди пустых клеток доски ту,
 * для которой по базовым правилам (подсчёт значений в строке/столбце,
 * правило трёх подряд) можно однозначно вывести значение.
 * Если обнаруживается такая клетка, возвращается объект с позицией, значением и подсказками.
 *
 * @param board - доска Takuzo (с ячейками 0, 1 или null)
 * @returns ObviousMove или null, если ни для одной клетки явного хода не найдено.
 */
function findObviousMove(board: Board): ObviousMove | null {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] !== null) continue;
      const candidateSet = new Set<0 | 1>();
      const ruleHints: string[] = [];

      // Правило: если в строке уже 3 нуля/единицы, то оставшиеся клетки обязаны принять противоположное значение.
      const rowZeros = board[r].filter((cell) => cell === 0).length;
      const rowOnes = board[r].filter((cell) => cell === 1).length;
      if (rowZeros === 3) {
        candidateSet.add(1);
        ruleHints.push(`В строке уже 3 нуля, значит эта клетка должна быть 1`);
      }
      if (rowOnes === 3) {
        candidateSet.add(0);
        ruleHints.push(
          `В строке уже 3 единицы, значит эта клетка должна быть 0`,
        );
      }

      // Правило: аналогично для столбца.
      let colZeros = 0,
        colOnes = 0;
      for (let i = 0; i < 6; i++) {
        if (board[i][c] === 0) colZeros++;
        if (board[i][c] === 1) colOnes++;
      }
      if (colZeros === 3) {
        candidateSet.add(1);
        ruleHints.push(`В столбце уже 3 нуля, значит эта клетка должна быть 1`);
      }
      if (colOnes === 3) {
        candidateSet.add(0);
        ruleHints.push(
          `В столбце уже 3 единицы, значит эта клетка должна быть 0`,
        );
      }

      // Правила для трёх подряд (горизонтально)
      // Если слева два одинаковых числа, то текущая клетка должна быть противоположной.
      if (
        c >= 2 &&
        board[r][c - 1] !== null &&
        board[r][c - 2] === board[r][c - 1]
      ) {
        const forced = board[r][c - 1] === 0 ? 1 : 0;
        candidateSet.add(forced);
        ruleHints.push(
          `Два одинаковых числа слева, значит эта клетка должна быть ${forced}`,
        );
      }
      // Если справа два одинаковых числа.
      if (
        c <= 3 &&
        board[r][c + 1] !== null &&
        board[r][c + 2] === board[r][c + 1]
      ) {
        const forced = board[r][c + 1] === 0 ? 1 : 0;
        candidateSet.add(forced);
        ruleHints.push(
          `Два одинаковых числа справа, значит эта клетка должна быть ${forced}`,
        );
      }
      // Если по бокам одинаковые числа (сэндвич).
      if (
        c >= 1 &&
        c <= 4 &&
        board[r][c - 1] !== null &&
        board[r][c + 1] !== null &&
        board[r][c - 1] === board[r][c + 1]
      ) {
        const forced = board[r][c - 1] === 0 ? 1 : 0;
        candidateSet.add(forced);
        ruleHints.push(
          `Два одинаковых числа по бокам, значит эта клетка должна быть ${forced}`,
        );
      }

      // Правила для трёх подряд (вертикально)
      if (
        r >= 2 &&
        board[r - 1][c] !== null &&
        board[r - 2][c] === board[r - 1][c]
      ) {
        const forced = board[r - 1][c] === 0 ? 1 : 0;
        candidateSet.add(forced);
        ruleHints.push(
          `Два одинаковых числа сверху, значит эта клетка должна быть ${forced}`,
        );
      }
      if (
        r <= 3 &&
        board[r + 1][c] !== null &&
        board[r + 2][c] === board[r + 1][c]
      ) {
        const forced = board[r + 1][c] === 0 ? 1 : 0;
        candidateSet.add(forced);
        ruleHints.push(
          `Два одинаковых числа снизу, значит эта клетка должна быть ${forced}`,
        );
      }
      if (
        r >= 1 &&
        r <= 4 &&
        board[r - 1][c] !== null &&
        board[r + 1][c] !== null &&
        board[r - 1][c] === board[r + 1][c]
      ) {
        const forced = board[r - 1][c] === 0 ? 1 : 0;
        candidateSet.add(forced);
        ruleHints.push(
          `Два одинаковых числа сверху и снизу, значит эта клетка должна быть ${forced}`,
        );
      }

      // Если по явным правилам кандидат не найден, попробуем методом исключения
      if (candidateSet.size === 0) {
        const validCandidates: (0 | 1)[] = [];
        for (const candidate of [0, 1] as (0 | 1)[]) {
          board[r][c] = candidate;
          if (isValid(board, r, c)) {
            validCandidates.push(candidate);
          }
        }
        board[r][c] = null; // восстановление
        if (validCandidates.length === 1) {
          candidateSet.add(validCandidates[0]);
          ruleHints.push(
            `Единственная возможная цифра по проверке допустимости`,
          );
        }
      }

      if (candidateSet.size === 1) {
        // Если для клетки найден единственный кандидат, возвращаем её позицию, значение и подсказки.
        const forcedCandidate = candidateSet.values().next().value as 0 | 1;
        return { row: r, col: c, value: forcedCandidate, hints: ruleHints };
      }
    }
  }
  return null;
}

/**
 * Функция simulateForcedSolving имитирует процесс решения головоломки,
 * последовательно применяя очевидный ход (findObviousMove).
 * Если после последовательного заполнения все клетки заполнены, возвращается true,
 * что означает — головоломка решается без догадок.
 *
 * @param board - исходная доска Takuzo (с ячейками 0, 1 или null)
 * @returns true, если доска полностью решается последовательными очевидными ходами, иначе false.
 */
function simulateForcedSolving(board: Board): boolean {
  const deepCopy = (b: Board): Board => b.map((row) => row.slice());
  const simulated = deepCopy(board);
  let move = findObviousMove(simulated);
  while (move) {
    simulated[move.row][move.col] = move.value;
    move = findObviousMove(simulated);
  }
  // Если на доске не осталось пустых клеток — решение найдено.
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (simulated[r][c] === null) return false;
    }
  }
  return true;
}
