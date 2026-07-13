# McEasy Fireflies Agents

**Version:** 1.4.0 — see [CHANGELOG.md](CHANGELOG.md)

A Claude Code agent/skill pack that fetches and summarizes Fireflies.ai
meeting transcripts. Run `/fireflies` with a transcript ID, a partial meeting
name, or nothing at all, and it hands off to a subagent that produces a
structured summary — themes, decisions, action items, and a direct "Claude
Observations" read on gaps or risks. Each summary is also saved as a
Markdown file under `outputs/` (gitignored).

---

## Prerequisites

Must Have:

- [Claude Desktop](https://claude.com/download)
- [Git](https://git-scm.com/install/)
- [Python](https://www.python.org/downloads/)
- [Node](https://nodejs.org/en/download)
- Claude Pro or Max account

- Optional:

- [GitHub Desktop](https://desktop.github.com/download/)
- [VSCode](https://code.visualstudio.com/download)

---

## Setup

### Option A: Using the terminal (CLI)

1. Clone the repo

```bash
git clone https://github.com/[your-org]/mceasy-fireflies-agents.git
```

1. Open the folder in Claude Code

2. That's it — agents and skills load automatically from `.claude/`

### Option B: Using GitHub Desktop

1. Open [GitHub Desktop](https://desktop.github.com/)
2. Click **File → Clone Repository**
3. Go to the **URL** tab and paste the repo URL:
   - On the GitHub repo page, click the green **\< \> Code** button
   - Make sure **HTTPS** is selected
   - Click the copy icon next to the URL
   - Paste it into GitHub Desktop
4. Choose a local path and click **Clone**
5. Once cloned, open the folder in Claude Code:
   - In GitHub Desktop, click **Repository → Open in…** and select your Claude Code editor, or
   - Open Claude Code manually and use **File → Open Folder** to navigate to the cloned folder

> **Note:** The `.claude/` folder is hidden by default. On Mac press `Cmd + Shift + .` to show hidden files in Finder.

---

## How to use

Type the slash command in Claude Code:

```
/fireflies                              # lists your 5 most recent transcripts, can get "more"
/fireflies grooming                     # searches meeting containing "grooming" from the last 2 weeks for a match
/fireflies 01KWH8BVRB8Q6GMCAJM70ANHFS   # summarizes that transcript directly
```

Claude will either resolve your input to a transcript (asking you to pick if
needed), then produce a structured summary via the `default-summary`
subagent.

---

## Folder structure

```
mceasy-fireflies-agents/
├── CLAUDE.md                          # Project instructions — agents read this for context
├── CHANGELOG.md                       # Version history (Keep a Changelog / SemVer)
├── README.md                          # This file
├── .gitignore
├── scripts/                           # Helper scripts invoked by agents via Bash, not run manually
│   └── compact-transcript.js          # Shrinks oversized transcript JSON so agents can read it in one pass
├── outputs/                           # Saved summaries, one Markdown file per run (gitignored)
└── .claude/
    ├── settings.json                  # Permissions (WebSearch, WebFetch)
    ├── agents/
    │   ├── default-summary.md         # Fetches a transcript and produces the structured summary
    │   └── mom.md                     # Fetches a transcript and produces a Minutes of Meeting summary
    └── skills/
        └── fireflies/
            └── SKILL.md                # /fireflies — resolves input to a transcript, then delegates
```

---

## How agents work

Each file in `.claude/agents/` defines one agent. The frontmatter controls how Claude uses it:

```markdown
---
name: agent-name # How you invoke it: @agent-name
description: ... # Claude reads this to decide when to use it
model: sonnet # sonnet (fast/cheap) or opus (deep research)
tools: Read, Write # What tools the agent can use
---

[System prompt — the agent's instructions]
```

**Model guidance:**

- Use `opus` for research agents that need deep reasoning and web search
- Use `sonnet` for writing, reviewing, and formatting agents

**Tools you can grant:**

- `Read`, `Write`, `Edit` — file access
- `WebSearch`, `WebFetch` — internet access
- `Bash` — shell commands (use carefully)
- MCP tools (e.g. `mcp__claude_ai_Fireflies__fireflies_fetch`) — access to a connected MCP server

---

## How skills work

Each folder in `.claude/skills/` is a slash command. The folder name becomes the command.

```
.claude/skills/fireflies/SKILL.md  →  /fireflies
```

The `SKILL.md` file is a prompt that tells Claude how to orchestrate the
pipeline — which agents to invoke, in what order, and where to pause for
human input.

---

## How CLAUDE.md works

`CLAUDE.md` in the repo root is always loaded as project context. Use it to:

- Define the pipeline order and rules
- Give agents shared background knowledge about your domain, product, or team
- Set hard rules

Agents read `CLAUDE.md` automatically — you don't need to repeat context in every agent file.

---

## A note on MCP tool names

The Fireflies MCP tools this pack calls are namespaced as
`mcp__claude_ai_Fireflies__*` in this environment (e.g.
`mcp__claude_ai_Fireflies__fireflies_fetch`,
`mcp__claude_ai_Fireflies__fireflies_get_transcripts`). If your Fireflies
connector is set up differently, update the tool names in
`.claude/skills/fireflies/SKILL.md` and
`.claude/agents/default-summary.md` to match.

---

## Questions

Contact the McEasy engineering team.
