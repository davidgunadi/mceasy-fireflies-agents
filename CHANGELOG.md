# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
