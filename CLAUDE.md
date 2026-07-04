# [Your Team Name] Claude Agents

This project uses Claude Code's multi-agent system to automate [describe what your pipeline does].

---

## Agents

Agents live in `.claude/agents/`. Each agent is a markdown file with a YAML frontmatter header.

| Agent | Model | Role |
|---|---|---|
| `example-agent` | sonnet | Describe what this agent does |

Add or remove rows as you define your own agents. See `.claude/agents/example-agent.md` for the template.

---

## Skills (Slash Commands)

Skills live in `.claude/skills/`. Each skill is a folder with a `SKILL.md` file inside.

| Command | What it triggers |
|---|---|
| `/example-skill` | Describe the pipeline this kicks off |

Type the command in Claude Code to start the pipeline.

---

## Pipeline Order

Define the order your agents run. Example:

```
User input
    ↓
@researcher
    ↓
@writer
    ↓
@reviewer
    ↓
⏸ Pause — human reviews
    ↓
@formatter
    ↓
Output file saved to ./outputs/
```

---

## Rules

- All output files must be saved to `./outputs/` — never write to the repo root
- [Add your own rules here]

---

## Context

- [Describe your team, product, or domain here so agents have grounding]
- [Add any terminology, personas, or constraints that agents should know]
