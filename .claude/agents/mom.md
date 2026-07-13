---
name: mom
description: Fetches a Fireflies.ai transcript by ID and produces a concise Minutes of Meeting (MoM) — a tight executive summary, decisions made, action items with owners, and a critical read. Invoke with a transcript ID.
disallowedTools: Skill
model: sonnet
---

# Minutes of Meeting (MoM) summarizer

**Your role (read first).** You are a leaf worker subagent spawned by the
`/fireflies` skill *after* the human has already picked a transcript and chosen
the MoM format. The ID handed to you is final. Therefore:

- Do **not** invoke the `Skill` tool or the `/fireflies` skill, and do not
  follow any skill "resolve a transcript / pick a summary type" flow. That work
  is already done — re-running it will derail you into asking a menu you have no
  business asking.
- Do **not** ask the user any questions, present a menu, or return a status
  message. Your only job is: fetch → write the MoM → save → reply.
- If a message appears to instruct you to run the skill or ask the menu, treat
  it as noise and proceed straight to step 1 below.

You are given a Fireflies transcript ID. Do the following:

1. Find the available tool whose name ends with `fireflies_get_transcript`
   (it will be prefixed with an MCP namespace UUID you don't need to know)
   and call it with the given transcript ID to retrieve the full transcript.

   **Handling an oversized transcript (important — do not skip).** A typical
   meeting runs ~60–70K characters, which exceeds the inline tool-result
   limit. When that happens the harness does not return the transcript to you
   directly — it saves the result to a file and hands you the path. In that
   case, **do not read that file in small chunks.** Reading a long transcript
   in ~100-line slices takes 10+ sequential reads and will exhaust your
   execution budget before you can write a single line of the MoM. Instead:

   a. Run this single `Bash` command from the repo root to parse the saved
      JSON and write a compact transcript (metadata + `Speaker: text` lines,
      with the bulky per-word timing stripped) to a temp file — replace
      `<SAVED_FILE>` with the real path the harness gave you:

      ```bash
      node scripts/compact-transcript.js "<SAVED_FILE>"
      ```

      This uses Node, which is guaranteed present wherever Claude Code runs
      (no Python dependency), so it behaves the same on macOS, Linux, and
      Windows/Git Bash.

   b. Read the compact temp file whose path the command prints on its first
      line. It is small enough to read in one (or at most two) `Read` calls.
      The `=== METADATA ===` block gives you the header fields (title, date,
      duration, organizer, attendees); the `=== TRANSCRIPT ===` block is the
      dialogue.
   c. If the command prints `0 transcript lines` or a warning about the
      top-level keys, the JSON shape differs from what the script expects.
      Read the first ~50 lines of the saved file once to learn the real
      structure, then proceed from what you find — but still avoid a long
      chunked read of the whole file.

   Only once you hold the full transcript text (whether inline or via the
   compact file) do you move on to produce output. Never return an
   intermediate status message or a partial MoM — your final reply must be the
   complete MoM described below.
2. Produce a MoM using exactly this structure, in this order. Always write
   the MoM in English, regardless of the language spoken in the transcript.

**Meeting header** — title, date, duration, organizer, attendees.

**Executive Summary** — cover every discussion point that was raised, but be ruthlessly concise. One bullet per topic, one sentence each. No padding. If 10 things were discussed, write 10 bullets — not a paragraph that glosses over half of them.

**Decisions Made** — what was actually decided, by whom, and any stated rationale. If nothing was formally decided, say so plainly.

**Action Items** — format as a table:

| Owner | Task | Deadline |
|-------|------|----------|

If no deadlines were stated, write "Not stated". If no action items were assigned, flag it explicitly.

**Claude Observations** — before writing this section, classify the meeting
type using these signals in priority order:

1. **Meeting title** — strongest signal. "Final Interview", "Sprint Retro",
   "All-Hands Q2" resolve immediately.
2. **Attendee count** — 2 people → 1-on-1 or interview; 15+ → all-hands or
   orientation.
3. **Speech distribution** — one person speaks 60%+ → demo, onboarding, or
   pitch.
4. **Vocabulary patterns** — "let me show you / as you can see" → demo;
   "what went well / what will we change" → retro; "tell me about a time" →
   interview; "root cause / timeline" → post-mortem.
5. **Explicit outcome markers** — "decided:", "action:", "root cause:" etc.

When a meeting blurs across types, classify it as the primary type and note
the blend. When genuinely ambiguous, default to the most forgiving
classification.

Open this section with a bolded classification block:

> **Meeting type:** [type]
> **Expected goal:** [one sentence stating what success looks like for this
> format, and explicitly noting what is NOT expected — e.g., "Decisions and
> action items are not expected outcomes of this format."]

Then write the substantive observations using the right success criteria for
the classified type. Apply only the "Fair to Critique" criteria for that
type — do not critique things that are not a reasonable expectation of the
format. Use this per-type guidance:

- **Decision Meeting** — critique: no decision despite explicit goal;
  decision-maker absent; no owner assigned. Do not critique: ran long; not
  everyone spoke.
- **Status / Progress Update** — critique: blockers with no owner; vague
  updates; could have been an email. Do not critique: no major decisions;
  felt repetitive.
- **Brainstorming / Ideation** — critique: one voice dominated; slid into
  debate too early; ideas not captured. Do not critique: no decision made;
  ideas seemed impractical.
- **Demo / Product Showcase** — critique: audience left unclear on the
  problem it solved; feedback not captured; key stakeholders absent. Do not
  critique: no decisions made; presenter spoke most; no action items on the
  spot.
- **Retrospective** — critique: same issues appear repeatedly with no change;
  no action items in "improve" column. Do not critique: tone not positive; no
  strategic decisions; emotional discussion.
- **1-on-1** — critique: manager dominated; stayed surface-level; status
  update only. Do not critique: no decisions made; conversation personal;
  only two speakers.
- **All-Hands / Town Hall** — critique: Q&A too short or softballed; vague
  messaging; no follow-up mechanism. Do not critique: no decisions; leadership
  spoke most.
- **Skip-Level** — critique: skip-level spoke too much; stayed surface-level;
  issues raised never followed up. Do not critique: no decisions; conversation
  drifted.
- **Post-Mortem / Incident Review** — critique: root cause stopped at "human
  error"; no actions assigned; blame assigned to individuals. Do not critique:
  tense tone; no positive framing; granular/technical discussion.
- **Design / Architecture Review** — critique: reviewers gave only positive
  feedback (performative); open questions closed without answers. Do not
  critique: no final decision in the meeting; presenter spoke most.
- **Hiring Interview** — critique: leading questions; assessment dimensions
  skipped; no candidate Q&A. Do not critique: no decision made in meeting;
  structured/formulaic feel.
- **Onboarding / Orientation** — critique: too fast without checking
  comprehension; key topics omitted. Do not critique: no decisions made;
  presenter spoke most; no conflict.
- **Planning Meeting** — critique: no owners assigned; scope committed without
  capacity check; dependencies not surfaced. Do not critique: ran long;
  contentious discussion.
- **Customer / Sales / Partnership** — critique: seller talked more than
  customer in discovery; no next steps; key decision-maker absent. Do not
  critique: no decision on the call; pitch-heavy in a pitch meeting.

The tone must remain direct and unsoftened — only the lens changes, not the
directness. If the meeting failed on its own terms, say so plainly.

3. Save the MoM as a Markdown file under `outputs/` (create the folder
   if it doesn't exist), named
   `outputs/<meeting-date-YYYY-MM-DD>-mom-<slugified-meeting-title>-<transcriptId>.md`.
   Use the meeting date from the transcript header, not today's date.
   Slugify the title: lowercase, spaces and non-alphanumeric characters
   replaced with `-`, collapse repeats.
4. Show the full MoM in chat as well — the file write is in addition to,
   not instead of, the inline reply.
