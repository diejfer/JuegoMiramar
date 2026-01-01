import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyWord,
  normalizeWord,
  shouldEndGame,
  splitSyllables,
  validateWord,
} from "../game-logic.mjs";

test("normalizeWord removes accents and trims", () => {
  assert.equal(normalizeWord("  ÁrBOL "), "arbol");
  assert.equal(normalizeWord("camión"), "camion");
});

test("splitSyllables separates common consonant clusters", () => {
  assert.deepEqual(splitSyllables("casa"), ["ca", "sa"]);
  assert.deepEqual(splitSyllables("guitarra"), ["gui", "ta", "rra"]);
});

test("classifyWord tags MAGO/GOMA based on syllable count", () => {
  const goma = classifyWord("casa");
  const mago = classifyWord("computadora");
  assert.equal(goma.type, "GOMA");
  assert.equal(mago.type, "MAGO");
});

test("validateWord enforces basic rules", () => {
  assert.equal(validateWord("a").valid, false);
  assert.equal(validateWord("ca$sa").valid, false);
  const validation = validateWord("canción");
  assert.equal(validation.valid, true);
  assert.equal(validation.normalized, "cancion");
});

test("shouldEndGame returns true when no valid response exists", () => {
  assert.equal(shouldEndGame([]), true);
  assert.equal(
    shouldEndGame([
      { valid: false, word: "xx" },
      { valid: false, word: "yy" },
    ]),
    true,
  );
  assert.equal(
    shouldEndGame([
      { valid: false, word: "xx" },
      { valid: true, word: "casa" },
    ]),
    false,
  );
});
