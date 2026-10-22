import test from "node:test";
import assert from "node:assert/strict";
import { parseHorseInput } from "../src/horse-validation.mjs";

test("valid horse fields are normalized", () => {
  assert.deepEqual(parseHorseInput({ name: " Akýol ", code: " A-01 ", breed: "Ahalteke", sex: "At", year: 2015 }),
    { name: "Akýol", code: "A-01", breed: "Ahalteke", sex: "At", year: 2015 });
});
test("invalid and oversized horse records are rejected", () => {
  assert.equal(parseHorseInput(null), null);
  assert.equal(parseHorseInput({ name: "", code: "A" }), null);
  assert.equal(parseHorseInput({ name: "At", code: "A", year: "2015" }), null);
  assert.equal(parseHorseInput({ name: "At", code: "A", year: 1200 }), null);
  assert.equal(parseHorseInput({ name: "a".repeat(151), code: "A" }), null);
});
test("optional fields may be omitted", () => {
  assert.deepEqual(parseHorseInput({ name: "At", code: "A" }), { name: "At", code: "A", breed: null, sex: null, year: null });
});
