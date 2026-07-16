---
name: export-to-notion
description: Export the most recently generated MoM to Notion as a sub-page under the McEasy MoM page. Invoke after /fireflies produces a MoM. Pass a path to a specific outputs/*.md file to export that one instead.
---

# Export MoM to Notion

Export a MoM (Minutes of Meeting) to Notion as a sub-page under the McEasy MoM page.

**Target Notion parent page ID:** `396fbd65000f806d874ee63b7dfa58e1`
(Notion path: Product Development Space → MoM)

---

## Step 1 — Locate the MoM file

If `$ARGUMENTS` is provided and the path exists → use it as the source file.

Otherwise, find the most recently modified MoM file in `outputs/`:

```bash
ls -t outputs/*-mom-*.md 2>/dev/null | head -1
```

If no file is found, tell the user no MoM file was found in `outputs/` and suggest
running `/fireflies` first to generate one. Stop here.

---

## Step 2 — Read and parse the MoM

Read the full file content. Extract:

- **Meeting title** — compose as `YYYY-MM-DD <Meeting Name>`, where:
  - `YYYY-MM-DD` is the meeting date (from the `**Date:**` field in the file, or from the filename prefix as a fallback).
  - `<Meeting Name>` is the meeting name from the first `#` heading in the file, with any leading `Minutes of Meeting — ` or `Minutes of Meeting - ` prefix stripped (or un-slugified from the filename middle segment `<slug>` as a fallback).
  - Example: `2026-07-14 IoT x Product x Engineering Weekly`
- **Content body** — the full Markdown text. Do **not** include the title
  in the content body; it goes into `properties.title` only (Notion renders
  the title automatically as a large heading at the top of the page).

---

## Step 3 — Read the Notion Markdown spec

Before creating the page, read the Notion Markdown specification via the MCP
resource interface:

```
notion://docs/enhanced-markdown-spec
```

Use the spec to convert any Markdown constructs (tables, bold, bullets, code
blocks) that need adjustment for Notion-flavored Markdown. Action-item tables
and section headings are the most likely areas requiring conversion.

---

## Step 4 — Create the Notion sub-page

Find the available tool whose name ends with `notion-create-pages` and call it.

Before assembling the `content` string:
- The Table of Contents block syntax for Notion-flavored Markdown is:
  `<table_of_contents/>`
- Prepend that ToC block to the content body (before the first heading), so
  Notion renders a live, auto-generated Table of Contents at the top of the page.

Then call the tool:

```json
{
  "parent": {
    "type": "page_id",
    "page_id": "396fbd65000f806d874ee63b7dfa58e1"
  },
  "pages": [
    {
      "properties": {
        "title": "<YYYY-MM-DD Meeting Name from Step 2>"
      },
      "content": "<ToC block>\n\n<full MoM body from Step 2, Notion-flavored Markdown>"
    }
  ]
}
```

---

## Step 5 — Report

On success, tell the user:
- The Notion page URL (from the API response)
- Which source file was exported (relative path)

If the tool returns an error, show it verbatim so the user can act on it.
