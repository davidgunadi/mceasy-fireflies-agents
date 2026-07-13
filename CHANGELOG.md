# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-07-13

### Added

- `mom` agent: Claude Observations now applies the same meeting-type
  classification introduced in v1.3.0 for `default-summary` — bolded
  **Meeting type** and **Expected goal** block, five classification signals,
  and per-type "fair to critique" criteria for all 14 meeting types.

## [1.3.1] - 2026-07-13

### Fixed

- `fireflies` skill: day-of-week labels in the transcript picker table must now
  be derived via a Bash `date` command — never by mental arithmetic. Prevents
  silent off-by-one errors (e.g. "Sunday" instead of "Monday") when converting
  UTC ISO timestamps to GMT+7 display dates.

## [1.3.0] - 2026-07-13

### Added

- `default-summary` agent: Claude Observations now opens with a bolded
  **Meeting type** and **Expected goal** block, classifying the meeting before
  critiquing it. Classification uses five signals in priority order: meeting
  title, attendee count, speech distribution, vocabulary patterns, and explicit
  outcome markers.
- `default-summary` agent: per-type success criteria for all 14 meeting types
  (Decision, Status Update, Brainstorming, Demo/Showcase, Retrospective, 1-on-1,
  All-Hands, Skip-Level, Post-Mortem, Design Review, Hiring Interview,
  Onboarding/Orientation, Planning, Customer/Sales/Partnership). Observations
  now apply only "fair to critique" criteria for the classified type — e.g., a
  demo is never faulted for producing no decisions; a decision meeting is.
  Tone remains direct and unsoftened; only the lens changes.

## [1.2.3] - 2026-07-06

### Fixed

- `scripts/compact-transcript.js`: stop hard-failing when
  `fireflies_get_transcript` returns a non-JSON body (plain text or "toon"
  format, depending on the tool's `format` param/server default). Previously
  a failed `JSON.parse` printed an error and exited 1, leaving the `mom` /
  `default-summary` agents to fall back to reading only the first ~50 lines
  of the raw saved file — silently truncating the transcript and producing
  summaries built from a fraction of the meeting. The script now writes the
  non-JSON body through unchanged to the temp file so the agent still gets
  the full transcript.

## [1.2.2] - 2026-07-06

### Fixed

- `mom` and `default-summary` agents: stop reflexively re-invoking the
  `/fireflies` skill. Both agents inherited the `Skill` tool, so when handed a
  transcript ID they would call `Skill(fireflies)`, absorb the skill's
  resolve/menu flow, and derail — asking the summary-type menu (the parent
  skill's job) instead of producing output, then misidentifying their own role.
  Added `disallowedTools: Skill` to both agent frontmatters so the tool is
  structurally unavailable, plus a "leaf worker" guard in each agent body
  instructing it never to invoke a skill or present a menu. `disallowedTools`
  is used (rather than a `tools:` allowlist) so the UUID-prefixed Fireflies MCP
  tool keeps working without hardcoding the per-machine UUID.

## [1.2.1] - 2026-07-06

### Fixed

- `mom` and `default-summary` agents: handle oversized transcripts without
  exhausting execution budget. When `fireflies_get_transcript` spills its
  result to a file (typical ~60–70K-char meetings), the agent now runs a
  single `scripts/compact-transcript.js` pass — stripping per-word timing,
  keeping metadata plus `Speaker: text` lines — and reads the compact file
  once, instead of reading the raw file in 10+ chunks and running out of
  budget mid-summary. Agents are also instructed never to return a partial or
  placeholder reply.
- `scripts/compact-transcript.js`: new Node helper that performs the transcript
  compaction. Implemented in Node (not Python) so it runs wherever Claude Code
  runs — including Windows/Git Bash, where `python3` is typically absent.

## [1.2.0] - 2026-07-06

### Added

- `mom` agent: produces a concise Minutes of Meeting — tight executive summary
  (one sentence per topic), decisions made, action items as a table with
  owner/task/deadline, and Claude Observations.
- `/fireflies` skill now asks what type of summary is needed (Default or MoM)
  after a transcript is selected, then routes to the appropriate subagent.

### Changed

- Renamed `fireflies-summarizer-agent.md` → `default-summary.md` and updated
  its `name:` to `default-summary`; all references updated across SKILL.md,
  CLAUDE.md, and README.md.
- `/fireflies` skill restructured into three explicit steps: resolve transcript,
  select summary type, delegate — with transcript ID format hint added to
  prevent misrouting of short/alphanumeric arguments.

## [1.1.0] - 2026-07-06

### Added

- `fireflies-summarizer` subagent now saves each summary as a Markdown file
  under `outputs/` (gitignored), named
  `<meeting-date>-<slugified-title>-<transcriptId>.md`, in addition to
  showing it in chat.

## [1.0.0] - 2026-07-06

### Added

- `/fireflies` slash command: resolves a transcript ID, partial meeting name
  (searched over the last 2 weeks), or no argument (lists 5 most recent
  transcripts, paginatable) to a single transcript, pausing for human
  selection when needed.
- `fireflies-summarizer` subagent: fetches a transcript by ID and produces a
  structured summary — themes, decisions, action items, and an unsoftened
  "Claude Observations" read.
- `.claude/settings.json` granting `WebSearch` and `WebFetch` permissions.

### Fixed

- Static/incorrect UUID in the agent's MCP tool references, generalized to
  work across accounts and machines.
- Incorrect MCP tool names referenced by the skill/agent.
- An inline-execution bug in the agent pipeline.
