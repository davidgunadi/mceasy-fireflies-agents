#!/usr/bin/env node
// Compacts an oversized Fireflies transcript JSON into a small text file.
//
// When `fireflies_get_transcript` returns a large result (~60-70K chars for a
// typical meeting), the Claude Code harness spills it to a file instead of
// returning it inline. Reading that raw file in ~100-line chunks takes 10+
// sequential reads and exhausts a subagent's execution budget before it can
// produce a summary.
//
// This script parses the spilled JSON once and writes a compact transcript
// (metadata block + `Speaker: text` lines, with the bulky per-word timing
// stripped) that a subagent can read in a single pass.
//
// Usage:  node scripts/compact-transcript.js <SAVED_FILE> [OUT_FILE]
//   <SAVED_FILE>  path to the raw JSON the harness saved
//   [OUT_FILE]    optional output path; defaults to a temp file
//
// Prints the output path on the first line and a size summary on the second.
// Node is used (not Python) because Node is guaranteed present wherever Claude
// Code runs, whereas `python3` is not — especially on Windows/Git Bash.

const fs = require("fs");
const os = require("os");
const path = require("path");

const savedFile = process.argv[2];
if (!savedFile) {
  console.error("usage: node scripts/compact-transcript.js <SAVED_FILE> [OUT_FILE]");
  process.exit(2);
}

const raw = fs.readFileSync(savedFile, "utf8");

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  // The tool can return plain text or "toon" format instead of JSON
  // (depends on the `format` param / server default) — pass it through
  // unchanged rather than failing, since it's already readable as-is.
  const outFile = process.argv[3] ||
    path.join(os.tmpdir(), `fireflies-${Date.now()}-transcript.txt`);
  fs.writeFileSync(outFile, raw, "utf8");
  console.log(outFile);
  console.log(`not JSON (${err.message}) — passed through unchanged, ${raw.length} chars`);
  process.exit(0);
}

// Unwrap common envelopes to reach the transcript object.
function dig(d) {
  if (d && typeof d === "object" && !Array.isArray(d)) {
    for (const k of ["transcript", "data", "result", "get_transcript"]) {
      if (d[k] && typeof d[k] === "object" && !Array.isArray(d[k])) return dig(d[k]);
    }
  }
  return d;
}

const obj = dig(data);
const sentences = (obj && Array.isArray(obj.sentences)) ? obj.sentences : [];

const lines = [];
for (const s of sentences) {
  if (!s || typeof s !== "object") continue;
  const speaker = s.speaker_name || s.speaker || s.speaker_id || "Unknown";
  const text = s.text || s.raw_text || "";
  if (text) lines.push(`${speaker}: ${text}`);
}

// Everything except the bulky `sentences` array is small — keep it as metadata
// so the header (title, date, duration, organizer, attendees) survives.
const meta = {};
if (obj && typeof obj === "object" && !Array.isArray(obj)) {
  for (const k of Object.keys(obj)) {
    if (k !== "sentences") meta[k] = obj[k];
  }
}

const outFile = process.argv[3] ||
  path.join(os.tmpdir(), `fireflies-${Date.now()}-transcript.txt`);

const body =
  "=== METADATA ===\n" +
  JSON.stringify(meta, null, 2) +
  "\n\n=== TRANSCRIPT ===\n" +
  lines.join("\n") +
  "\n";

fs.writeFileSync(outFile, body, "utf8");

const chars = lines.reduce((acc, l) => acc + l.length, 0);
console.log(outFile);
console.log(`${lines.length} transcript lines, ${chars} transcript chars`);

if (lines.length === 0) {
  // Signal to the caller that the JSON shape didn't match expectations.
  console.error(
    "warning: 0 transcript lines extracted — top-level keys were: " +
    (obj && typeof obj === "object" ? Object.keys(obj).join(", ") : typeof obj)
  );
}
