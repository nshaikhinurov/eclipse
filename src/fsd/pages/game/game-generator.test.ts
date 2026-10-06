import { describe, expect, it } from "vitest";
import { requestGame } from "./game-generator";
import { solve } from "./model";

describe("requestGame", () => {
  it("generates on the main thread when workers are unavailable", async () => {
    expect(typeof Worker).toBe("undefined");
    const { puzzle, solution } = await requestGame(6);
    expect(puzzle).toHaveLength(6);
    expect(solve(puzzle)).toEqual([solution]);
  });
});
