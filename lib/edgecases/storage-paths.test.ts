import assert from "node:assert/strict";
import {
  edgeCaseStoragePublicUrl,
  edgeCaseThumbnailPath,
  edgeCaseVideoPath,
} from "./storage-paths";

const ID = "11111111-1111-1111-1111-111111111111";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

assert.equal(edgeCaseVideoPath(ID), `edgecases/${ID}/video.mp4`);
assert.equal(edgeCaseVideoPath(ID, "webm"), `edgecases/${ID}/video.webm`);
assert.equal(edgeCaseThumbnailPath(ID), `edgecases/${ID}/thumbnail.jpg`);

const url = edgeCaseStoragePublicUrl(edgeCaseVideoPath(ID));
assert.ok(url?.includes("edgecases-videos"));
assert.ok(url?.includes("video.mp4"));

console.log("storage-paths tests passed");
