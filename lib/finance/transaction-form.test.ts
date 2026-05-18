import assert from "node:assert/strict";
import {
  parseIdrInput,
  parseTagsInput,
  tagsToInput,
} from "./transaction-form";

assert.equal(parseIdrInput("1.500.000"), 1500000);
assert.equal(parseIdrInput(""), 0);
assert.deepEqual(parseTagsInput("food, steam, "), ["food", "steam"]);
assert.equal(tagsToInput(["a", "b"]), "a, b");

console.log("transaction-form tests passed");
