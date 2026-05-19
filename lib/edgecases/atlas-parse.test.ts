import assert from "node:assert/strict";
import {
  buildQaUrlFromEpisodeId,
  parseEpisodeIdFromQaInput,
} from "./atlas-parse";

assert.equal(
  parseEpisodeIdFromQaInput("https://qa.atlascapture.io/review/ep-abc-123"),
  "ep-abc-123",
);
assert.equal(parseEpisodeIdFromQaInput("ep-abc-123"), "ep-abc-123");
assert.equal(
  buildQaUrlFromEpisodeId("ep-abc-123"),
  "https://qa.atlascapture.io/review/ep-abc-123",
);

console.log("atlas-parse tests passed");
