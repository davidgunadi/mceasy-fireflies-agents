---
name: fireflies
description: Fetch and summarize a Fireflies.ai meeting transcript by ID, or list recent transcripts to pick from when no ID is given. Use when the user runs /fireflies, asks for a meeting summary, or wants to review a Fireflies recording.
---

# Fireflies meeting summary

## Step 1 — Resolve a transcript ID

Use the appropriate path below to arrive at a confirmed transcript ID.

A Fireflies transcript ID is a 26-character alphanumeric string (e.g. `01KWH8BVRB8Q6GMCAJM70ANHFS`). If `$ARGUMENTS` matches this pattern, treat it as a direct transcript ID; otherwise treat it as a partial meeting name.

### If `$ARGUMENTS` contains a transcript ID

The transcript ID is already known. Proceed directly to Step 2.

### If `$ARGUMENTS` matches a partial meeting name (not a transcript ID)

1. Search transcripts from today back to at most 2 weeks ago — do not search
   further back than that window.
2. Match `$ARGUMENTS` against meeting titles within that window and take up
   to the 3 most recent matches, newest first.
3. Present the matches as a markdown table:

   ```
   | # | Title | Date (GMT+7) | Time (GMT+7) | Duration | Transcript ID |
   |---|-------|--------------|--------------|----------|----------------|
   | 1 | ...   | ...          | ...          | ...      | ...            |
   ```

4. If no matches are found in the 2-week window, say so and stop.
5. Stop here and wait for the user's reply. Do not proceed further in this
   turn.
6. Once the user replies with a pick (by index or by name), use that
   transcript's ID and proceed to Step 2.

### If `$ARGUMENTS` is empty

1. Find the available tool whose name ends with `fireflies_get_transcripts`
   (it will be prefixed with an MCP namespace UUID) and call it with `limit=5`,
   `format="json"`.
2. Convert each transcript's date/time to GMT+7 and present them as a
   markdown table:

   ```
   | # | Title | Date (GMT+7) | Time (GMT+7) | Duration | Transcript ID |
   |---|-------|--------------|--------------|----------|----------------|
   | 1 | ...   | ...          | ...          | ...      | ...            |
   ```

3. After the table, add a line offering to show more, e.g.
   `Type "more" to see 10 more meetings.`
4. Stop here and wait for the user's reply. Do not proceed further in this
   turn.
5. If the user replies with "more" (or an equivalent request for
   additional meetings): re-call the same `fireflies_get_transcripts` tool
   with `limit` increased by 10 over the previous call (5 → 15 → 25 → 35 → ...),
   re-present the full table from the newest meeting, and repeat
   the "type more" offer in step 3. The user can keep requesting "more"
   indefinitely, each time growing the limit by another 10.
6. Once the user replies with a pick (by index or by name) instead of
   "more", use that transcript's ID and proceed to Step 2.

---

## Step 2 — Ask what type of summary is needed

Once a transcript ID is confirmed (from any path above), present this menu
exactly as shown and stop:

```
What type of summary do you need?
a. Default — full write-up per topic/team. Use this if you missed the
   meeting and want to understand everything that was actually discussed.
b. MoM — tight recap: one line per topic, decisions, and an action-item
   table. Use this if you were there (or just need the outcomes) and
   want a fast read.
```

Stop here and wait for the user's reply. Do not proceed further in this turn.

---

## Step 3 — Delegate to the appropriate subagent

Based on the user's answer:

- **a** (or "default", "all details", or equivalent) → delegate to the
  `default-summary` subagent
- **b** (or "MoM", "mom", "minutes", or equivalent) → delegate to the
  `mom` subagent

## Delegation rules (critical)

When spawning either subagent:

- Pass **only the transcript ID** in the prompt — do not write a custom
  prompt that describes the output format or sections. Each agent's own
  definition owns the output structure.
- A custom inline prompt will silently override the agent definition and
  drop sections (e.g. Claude Observations). Never do this.
- Minimal prompt example: `"Summarize transcript ID: <id>"`
- The actual fetch + full analysis always happens in the subagent, never
  inline here.
