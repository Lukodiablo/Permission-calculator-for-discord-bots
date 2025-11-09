Discord Permission Analyzer
A dynamic, data-driven tool that audits your Discord bot's codebase to generate the exact, minimal permissions it requires.
Stop guessing with static permission calculators. This tool reads your code and tells you what permissions you're actually using, providing a "single source of truth" for your bot's security requirements.
The Problem with Manual Calculators
Manually calculating your bot's permissions is tedious and error-prone. You either:
Under-permission: Forgetting a permission, which leads to frustrating DiscordAPIError: Missing Permissions errors in production.
Over-permission: Requesting broad permissions like Administrator (or checking too many boxes) "just in case," which creates a massive security risk and causes security-conscious server owners to distrust and refuse to invite your bot.
This tool solves that problem by automating the entire process.
How It Works
The Permission Analyzer is a Node.js script that performs a static analysis of your codebase. It scans your files for specific discord.js method calls that are gated by a permission (e.g., .ban(), .kick(), .setName()) and generates a complete, auditable report of its findings.
The result is a definitive, provably accurate list of the permissions your bot needs to function—no more, no less.
Features
Data-Driven Accuracy: Generates permissions based on the code you've actually written.
Principle of Least Privilege: Helps you build trust by requesting only the permissions your bot truly needs.
Detailed Audit Trail: Creates a discord-permissions-report.json file with a human-readable list, the final permission integer, and the exact file and line number where each permission was detected.
User-Friendly Wrapper: Comes with a simple run-analyzer.sh script for easy execution.
CI/CD Friendly: Can be easily integrated into your continuous integration pipeline to check for permission changes on every commit.
Getting Started
Prerequisites
Node.js (v18.x or later recommended)
Your Discord bot project using discord.js
Installation
Clone this repository or copy the scripts/analyze-discord-permissions.js and run-analyzer.sh files into your project.
Move the .js file into a scripts directory in your project's root.
Place the .sh file in your project's root.
Make the script executable:
code
Bash
chmod +x run-analyzer.sh
Configuration
Open scripts/analyze-discord-permissions.js and configure the SCAN_DIRECTORIES array to point to the folders containing your bot's runtime code (e.g., ['src/bot/commands', 'src/bot/events']).
Usage
Simply run the script from your project's root directory:
code
Bash
./run-analyzer.sh
The script will analyze your codebase and generate a discord-permissions-report.json file in your root directory with the results.
Example Report (discord-permissions-report.json)
code
JSON
{
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
This tool is a work in progress. Contributions are welcome! Feel free to open an issue to report a bug or a pull request to add a new feature, such as:
Support for other Discord libraries (Eris, etc.).
More advanced pattern matching.
Exclusion patterns for tests and other non-runtime files.
License
This project is licensed under the MIT License.
