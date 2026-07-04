# [Your Team Name] Claude Agents

[One paragraph describing what this repo does and who it's for.]

---

## Prerequisites

- Claude Code enabled (comes with Claude Pro or Max)
- One of the following:
  - [Claude Desktop](https://claude.ai/download) with Claude Code, or
  - [VS Code](https://code.visualstudio.com/) with the [Claude Code extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
- This repo cloned to your machine

---

## Setup

### Option A: Using the terminal (CLI)

1. Clone the repo

```bash
git clone https://github.com/[your-org]/[your-repo].git
```

2. Open the folder in Claude Code

3. That's it — agents and skills load automatically from `.claude/`

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
/example-skill
```

Claude will greet you, explain the pipeline, and ask for the inputs it needs.

---

## Folder structure

```
your-repo/
├── CLAUDE.md                          # Project instructions — agents read this for context
├── README.md                          # This file
├── .gitignore
├── outputs/                           # All generated files go here
│   └── .gitkeep
└── .claude/
    ├── settings.json                  # Permissions (e.g. allow WebSearch)
    ├── agents/                        # One .md file per agent
    │   └── example-agent.md
    └── skills/                        # One folder per slash command
        └── example-skill/
            └── SKILL.md
```

---

## How agents work

Each file in `.claude/agents/` defines one agent. The frontmatter controls how Claude uses it:

```markdown
---
name: agent-name            # How you invoke it: @agent-name
description: ...            # Claude reads this to decide when to use it
model: sonnet               # sonnet (fast/cheap) or opus (deep research)
tools: Read, Write          # What tools the agent can use
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

---

## How skills work

Each folder in `.claude/skills/` is a slash command. The folder name becomes the command.

```
.claude/skills/my-pipeline/SKILL.md  →  /my-pipeline
```

The `SKILL.md` file is a prompt that tells Claude how to orchestrate the pipeline — which agents to invoke, in what order, and where to pause for human input.

---

## How CLAUDE.md works

`CLAUDE.md` in the repo root is always loaded as project context. Use it to:
- Define the pipeline order and rules
- Give agents shared background knowledge about your domain, product, or team
- Set hard rules (e.g. "always save to `./outputs/`", "write in English only")

Agents read `CLAUDE.md` automatically — you don't need to repeat context in every agent file.

---

## Questions

[Add your team contact here]
