#!/bin/bash

# Discord Permission Analyzer
# Analyzes the codebase and generates the correct Discord bot permissions

echo "🔍 Discord Permission Analyzer"
echo "=============================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Run the permission analyzer
echo "📁 Analyzing codebase for Discord permissions..."
echo ""

node analyze-discord-permissions.js

echo ""
echo "✅ Analysis complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check the generated discord-permissions-report.json for details"
echo "2. Update your bot invite URLs with the calculated permission integer"
echo "3. Re-invite your bot to Discord servers with the new permissions"
