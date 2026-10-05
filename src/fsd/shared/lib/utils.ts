import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирует время в миллисекундах в строку вида "HH:MM:SS".
 * @param {number} elapsedMilliseconds - Количество миллисекунд.
 * @returns {string} Время в формате "HH:MM:SS".
 */
export const formatElapsedTime = (elapsedMilliseconds: number): string => {
  const totalSeconds = Math.floor(elapsedMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  // Часы показываем, только когда партия длится дольше часа
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Разбивает массив на подмассивы длиной `n` элементов.
 * Последний подмассив может содержать меньше `n` элементов, если элементов недостаточно.
 *
 * @template T Тип элементов массива.
 * @param {number} n Количество элементов в каждом подмассиве. Должно быть больше 0.
 * @param {T[]} a Исходный массив.
 * @returns {T[][]} Массив подмассивов длиной до `n` элементов.
 * @throws {Error} Если `n` меньше или равно 0.
 *
 * @example
 * splitEvery(2, [1, 2, 3, 4, 5]); // [[1, 2], [3, 4], [5]]
 */
export function splitEvery<T>(n: number, a: T[]): T[][] {
  if (n <= 0) throw new Error("n must be greater than 0");

  const result: T[][] = [];
  for (let i = 0; i < a.length; i += n) {
    result.push(a.slice(i, i + n));
  }
  return result;
}

/**
 * Разбивает строку на подстроки длиной `n` символов.
 * Последняя подстрока может быть короче, если символов недостаточно.
 *
 * @param {number} n Количество символов в каждой подстроке. Должно быть больше 0.
 * @param {string} s Исходная строка.
 * @returns {string[]} Массив подстрок длиной до `n` символов.
 * @throws {Error} Если `n` меньше или равно 0.
 *
 * @example
 * splitEveryString(3, "abcdefg"); // ["abc", "def", "g"]
 */
export function splitStringEvery(n: number, s: string): string[] {
  if (n <= 0) throw new Error("n must be greater than 0");

  const result: string[] = [];
  for (let i = 0; i < s.length; i += n) {
    result.push(s.slice(i, i + n));
  }
  return result;
}

/**
 * Генерирует все перестановки массива элементов в лексикографическом порядке.
 * @param arr Массив элементов
 * @returns Массив всех перестановок
 */
export function permutations<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  const tempArr = [...arr].sort();
  const n = tempArr.length;
  result.push([...tempArr]);
  while (true) {
    let i = n - 2;
    while (i >= 0 && tempArr[i] >= tempArr[i + 1]) i--;
    if (i < 0) break;
    let j = n - 1;
    while (tempArr[j] <= tempArr[i]) j--;
    [tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
    let left = i + 1,
      right = n - 1;
    while (left < right) {
      [tempArr[left], tempArr[right]] = [tempArr[right], tempArr[left]];
      left++;
      right--;
    }
    result.push([...tempArr]);
  }
  return result;
}

/**
 * Генерирует все размещения без повторений (вариации) из n элементов по k мест.
 * @param elements Массив элементов
 * @param k Размер размещения
 * @returns Массив всех размещений
 */
export function arrangements<T>(elements: T[], k: number): T[][] {
  const result: T[][] = [];
  function backtrack(current: T[], remaining: T[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      backtrack(
        [...current, remaining[i]],
        [...remaining.slice(0, i), ...remaining.slice(i + 1)],
      );
    }
  }
  if (k > 0 && k <= elements.length) backtrack([], elements);
  return result;
}

/**
 * Удаляет дубликаты из массива массивов или значений.
 * @param array Массив элементов
 * @returns Массив уникальных элементов
 */
export function uniqueArray<T>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Транспонирует матрицу (переводит строки в столбцы).
 * @param matrix Матрица
 * @returns Транспонированная матрица
 */
export function transposeMatrix<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

/**
 * Возвращает случайный элемент массива.
 * @param array Массив элементов
 * @returns Случайный элемент
 */
export function pickRandom<T>(array: T[] | readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Возвращает новый массив с элементами в случайном порядке.
 * @param array Исходный массив
 * @returns Перемешанная копия массива
 */
export function shuffle<T>(array: T[]): T[] {
  const elementsToShuffle = [...array];
  const shuffledArray: T[] = [];

  while (elementsToShuffle.length > 0) {
    const randomIndex = Math.floor(Math.random() * elementsToShuffle.length);
    const [element] = elementsToShuffle.splice(randomIndex, 1);
    shuffledArray.push(element);
  }

  return shuffledArray;
}
