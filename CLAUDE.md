# McEasy Fireflies Agents

This project uses Claude Code's agent/skill system to fetch and summarize
Fireflies.ai meeting transcripts on demand via the `/fireflies` slash command.

---

## Agents

Agents live in `.claude/agents/`. Each agent is a markdown file with a YAML frontmatter header.

| Agent | Model | Role |
|---|---|---|
| `fireflies-summarizer` | sonnet | Fetches a transcript by ID and produces a structured summary — themes, decisions, action items, and a critical "Claude Observations" read |

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
@fireflies-summarizer — fetches transcript, produces structured summary
    ↓
Summary shown in chat
```

---

## Rules

- The skill never fetches or analyzes a transcript inline — that work always
  happens inside the `fireflies-summarizer` subagent.
- Meeting-name search is capped at a 2-week lookback window.
- "Claude Observations" in the summary must stay direct and unsoftened, even
  for unfocused or unproductive meetings.

---

## Context

- Team: McEasy (Indonesia) — B2B SaaS in telematics, logistics, mobility,
  transportation, and fleet management.
- Fireflies MCP tools are namespaced as `mcp__claude_ai_Fireflies__*` in this
  environment (e.g. `mcp__claude_ai_Fireflies__fireflies_fetch`,
  `mcp__claude_ai_Fireflies__fireflies_get_transcripts`). If this repo is used
  with a differently-configured Fireflies connector, update the tool names in
  `.claude/skills/fireflies/SKILL.md` and
  `.claude/agents/fireflies-summarizer-agent.md` to match.
