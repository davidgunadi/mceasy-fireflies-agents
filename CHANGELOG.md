# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
