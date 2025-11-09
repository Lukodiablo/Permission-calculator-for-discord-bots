# Discord Permission Analyzer

A **dynamic, data-driven tool** that audits your Discord bot's codebase to generate the **exact, minimal permissions** it requires.

> Stop guessing with static permission calculators. This tool **reads your code** and tells you what permissions you're *actually using* — providing a **"single source of truth"** for your bot's security requirements.

---

## The Problem with Manual Calculators

Manually calculating your bot's permissions is **tedious and error-prone**. You either:

1. **Under-permission**: Forgetting a permission → `DiscordAPIError: Missing Permissions` in production.
2. **Over-permission**: Requesting `Administrator` (or checking every box) "just in case" → **huge security risk** → server owners **refuse to invite your bot**.

This tool **solves that problem by automating the entire process**.

---

## How It Works

The **Permission Analyzer** is a **Node.js script** that performs **static analysis** of your codebase.

It scans your files for **discord.js method calls** gated by permissions (e.g., `.ban()`, `.kick()`, `.setName()`) and generates a **complete, auditable report**.

The result? A **definitive, provably accurate list** of permissions your bot needs — **no more, no less**.

---

## Features

- **Data-Driven Accuracy**: Permissions generated from the code you've *actually written*.
- **Principle of Least Privilege**: Build trust by requesting only what's necessary.
- **Detailed Audit Trail**: Outputs `discord-permissions-report.json` with:
  - Human-readable permission list
  - Final permission integer
  - **Exact file + line number** where each permission is used
- **User-Friendly Wrapper**: Includes `run-analyzer.sh` for one-click execution.
- **CI/CD Friendly**: Easily integrate into your pipeline to detect permission changes on every commit.

---

## Getting Started

### Prerequisites

- Node.js (**v18.x or later** recommended)
- Discord bot project using **discord.js**

---
scripts/analyze-discord-permissions.js
run-analyzer.sh

2. Place `analyze-discord-permissions.js` in a `scripts/` directory at your project root.

3. Place `run-analyzer.sh` in your **project root**.

4. Make the script executable:

```bash
chmod +x run-analyzer.sh

Configuration
Open scripts/analyze-discord-permissions.js and update the SCAN_DIRECTORIES array to point to your bot's runtime code:
jsconst SCAN_DIRECTORIES = [
  'src/bot/commands',
  'src/bot/events',
  'src/handlers'
];

Usage
From your project root, run:
bash./run-analyzer.sh
The script will:

Scan your codebase
Generate discord-permissions-report.json in the root directory


Example Report (discord-permissions-report.json)
json{
  "timestamp": "2025-11-09T10:56:25.877Z",
  "permissions": [
    "BAN_MEMBERS",
    "KICK_MEMBERS",
    "MANAGE_THREADS",
    "SEND_MESSAGES"
  ],
  "permissionInteger": "51539603014",
  "details": [
    {
      "permission": "BAN_MEMBERS",
      "file": "/path/to/your/project/src/bot/commands/ban.ts",
      "line": 52,
      "context": ".ban(",
      "inferred": true
    }
  ]
}

Contributing
This tool is a work in progress. Contributions are welcome!
Feel free to:

Open an issue to report bugs
Submit a pull request to add features like:
Support for other libraries (Eris, discord.py, etc.)
Advanced pattern matching
Exclusion rules for test files



License
This project is licensed under the MIT License — see LICENSE for details.

Made with ❤️ for safer, more trusted Discord bots.
### Installation

1. Clone this repo **or** copy the following files into your project:
