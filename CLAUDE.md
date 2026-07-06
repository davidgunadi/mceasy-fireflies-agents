# McEasy Fireflies Agents

This project uses Claude Code's agent/skill system to fetch and summarize
Fireflies.ai meeting transcripts on demand via the `/fireflies` slash command.

---

## Agents

Agents live in `.claude/agents/`. Each agent is a markdown file with a YAML frontmatter header.

| Agent | Model | Role |
|---|---|---|
| `default-summary` | sonnet | Fetches a transcript by ID and produces a structured summary — themes, decisions, action items, and a critical "Claude Observations" read |

---

## Skills (Slash Commands)

Skills live in `.claude/skills/`. Each skill is a folder with a `SKILL.md` file inside.

| Command | What it triggers |
|---|---|
| `/fireflies` | With a transcript ID: summarizes it directly. With a partial meeting name: searches the last 2 weeks for matches and asks you to pick. With no argument: lists your 5 most recent transcripts (paginate with "more") and asks you to pick. |

Type the command in Claude Code to start.

---

## Pipeline Order

```
/fireflies [transcript ID | meeting name | nothing]
    ↓
(if not a transcript ID) resolve to one via search or recent-list picker
    ↓
⏸ Pause — human picks a transcript, if not already given
    ↓
@default-summary — fetches transcript, produces structured summary
    ↓
Summary shown in chat AND saved to outputs/<date>-<title>-<id>.md
```

---

## Rules

- The skill never fetches or analyzes a transcript inline — that work always
  happens inside the `default-summary` subagent.
- Meeting-name search is capped at a 2-week lookback window.
- "Claude Observations" in the summary must stay direct and unsoftened, even
  for unfocused or unproductive meetings.
- Every summary is also saved as a Markdown file in `outputs/` (gitignored),
  in addition to being shown in chat — never instead of it.

---

## Versioning

This repo follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[SemVer](https://semver.org/). Current version lives in `CHANGELOG.md` and is
mirrored in the `**Version:**` line near the top of `README.md`.

**Functional changes** — anything that changes what the agents/skills do or
how they're configured:

- `.claude/agents/*.md` (agent behavior, prompts, tool grants, model choice)
- `.claude/skills/**/SKILL.md` (slash command behavior, pipeline logic)
- `.claude/settings.json` (permissions)

**Non-functional changes** — no CHANGELOG entry or version bump required:

- `README.md`, `CLAUDE.md`, and other documentation
- `.gitignore`, `.DS_Store` cleanup, formatting-only edits

**Bump rule:** any commit with a functional change must, as part of that same
commit, proactively (not just when asked):

1. Add an entry to `CHANGELOG.md` under Added/Changed/Fixed/Removed, dated
   with the commit date.
2. Bump the version in `CHANGELOG.md` and the `README.md` header to match —
   MAJOR for breaking changes to the pipeline/workflow (e.g. changing what a
   command expects or how it hands off between skill and agent), MINOR for
   new capabilities (new agent, new skill, new command option), PATCH for
   fixes/tweaks to existing behavior.

If it's unclear whether a change counts as functional, ask rather than guess.

---

## Context

- Team: McEasy (Indonesia) — B2B SaaS in telematics, logistics, mobility,
  transportation, and fleet management.
- Fireflies MCP tool names are prefixed with a UUID that varies per user
  and connector registration (e.g.
  `mcp__<uuid>__fireflies_get_transcript`). The agent and skill files
  reference tools by their suffix only — no hardcoded UUIDs — so they
  work across accounts and machines without modification.
