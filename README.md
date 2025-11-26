# Discord Permission Analyzer

**The only tool that reads your actual code to generate the exact, minimal permissions your bot needs.**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ff69b4)](https://github.com/sponsors/Lukodiablo)

> No more guessing. No more `Administrator`.  
> This tool **scans your entire codebase** and tells you — with proof — exactly which Discord permissions your bot actually uses.

---

### Why This Exists

Most bots either:
- Ask for **way too many permissions** → users don't trust them
- Forget one permission → crash in production with `Missing Permissions`

Both are unacceptable.

This analyzer fixes that by **statically analyzing your code** and generating the **perfect permission integer** — backed by file names and line numbers.

---

### Features

- Scans **all** `.js/.ts/.jsx/.tsx` files recursively
- Detects **both explicit** (`.has('BAN_MEMBERS')`) and **inferred** (`.ban()`) permissions
- Supports **Discord.js naming** → automatically converts to API format
- Covers **all 50+ current Discord permissions** (up to date as of 2025)
- Shows **exactly where** each permission is used
- Generates ready-to-use **bot invite link**
- Outputs clean console report + full `discord-permissions-report.json`
- Zero dependencies — just drop in and run

---

### Quick Start

```bash
# 1. Save the script as analyze-discord-permissions.js in your project root
# 2. Run it
node analyze-discord-permissions.js
That’s it.
You’ll get:

A beautiful terminal summary
Your exact permission number
A perfect invite URL
A full audit trail in JSON


Example Output
textUSED PERMISSIONS: 7/52

SEND_MESSAGES
   Used in 23 place(s) (12 explicit, 11 inferred)
   • src/commands/ping.ts:15 (inferred)
   • src/events/messageCreate.ts:42 (explicit)

BAN_MEMBERS
   Used in 1 place(s) (0 explicit, 1 inferred)
   • src/commands/ban.ts:38 (inferred)

MANAGE_ROLES
   Used in 4 place(s)
   • src/commands/role.ts:102 (inferred)

Permission integer: 140737488355327

UPDATED INVITE URL:
https://discord.com/api/oauth2/authorize?client_id=1234567890&permissions=140737488355327&scope=bot%20applications.commands

Detailed report saved to: discord-permissions-report.json

Perfect For

Open-source bots that want to earn trust
Large bots with many commands
Teams tired of permission bugs
CI/CD pipelines (fail build if permissions drift!)


Installation & Usage
Just copy this single file into your project:
analyze-discord-permissions.js (or paste the full script)
Then run:
Bashnode analyze-discord-permissions.js
No config needed — it auto-excludes node_modules, dist, etc.
Want to run it often? Add to your package.json:
JSON"scripts": {
  "permissions": "node analyze-discord-permissions.js"
}
Then: npm run permissions

Contributing
Found a missing pattern? New permission added by Discord?
Pull requests are very welcome!
Especially needed:

Patterns for interaction.reply({ files: [...] })
Support for discord.js v13/v12
Auto-updating permission list from Discord API


Made With ❤️ For The Discord Community
Tired of bots asking for Administrator "just in case"?
So were we.
Now you can prove — with evidence — that your bot only needs what it uses.
Invite with confidence. Build with trust.

Star this repo if it saved you from another Missing Permissions error
Made by developers, for developers.
Always free • Always open source • Always accurate.
