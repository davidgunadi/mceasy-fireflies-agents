---
name: fireflies
description: Fetch and summarize a Fireflies.ai meeting transcript by ID, or list recent transcripts to pick from when no ID is given. Use when the user runs /fireflies, asks for a meeting summary, or wants to review a Fireflies recording.
---

# Fireflies meeting summary

## If `$ARGUMENTS` contains a transcript ID

Delegate immediately to the `fireflies-summarizer` subagent, passing the
transcript ID from `$ARGUMENTS`. Do not fetch or analyze the transcript
yourself in this context — the subagent owns that work.

## If `$ARGUMENTS` is empty

1. Call `fireflies_get_transcripts` with `limit=10`, `format="json"`.
2. Convert each transcript's date/time to GMT+7 and present a numbered list:

   ```
   1. <title> — <date, GMT+7> <time, GMT+7> — <duration>
   2. ...
   ```

3. Stop here and wait for the user's reply. Do not proceed further in this
   turn.
4. Once the user replies with a pick (by index or by name), take that
   transcript's ID and delegate to the `fireflies-summarizer` subagent with
   that ID.

In both cases, the actual fetch + full analysis always happens in the
`fireflies-summarizer` subagent, never inline here.

---

**Note:** `fireflies_get_transcripts` is a placeholder tool name. Confirm the
exact tool name your Fireflies MCP server exposes (it may be namespaced,
e.g. `mcp__fireflies__get_transcripts`) and update both this file and the
subagent's `tools` list to match before this will work.
