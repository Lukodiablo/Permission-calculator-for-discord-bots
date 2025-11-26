#!/usr/bin/env node

/**
 * Discord Permission Scanner
 * 
 * This script scans the codebase to detect all Discord permissions that are actually used
 * and generates the correct permission integer for the bot invite URL.
 */

const fs = require('fs');
const path = require('path');

// Discord permission flags and their bit values
const DISCORD_PERMISSIONS = {
    // General Server Permissions
    'MANAGE_CHANNELS': 1n << 4n,
    'MANAGE_GUILD': 1n << 5n,
    'ADD_REACTIONS': 1n << 6n,
    'VIEW_AUDIT_LOG': 1n << 7n,
    'PRIORITY_SPEAKER': 1n << 8n,
    'STREAM': 1n << 9n,
    'VIEW_CHANNEL': 1n << 10n,
    'SEND_MESSAGES': 1n << 11n,
    'SEND_TTS_MESSAGES': 1n << 12n,
    'MANAGE_MESSAGES': 1n << 13n,
    'EMBED_LINKS': 1n << 14n,
    'ATTACH_FILES': 1n << 15n,
    'READ_MESSAGE_HISTORY': 1n << 16n,
    'MENTION_EVERYONE': 1n << 17n,
    'USE_EXTERNAL_EMOJIS': 1n << 18n,
    'VIEW_GUILD_INSIGHTS': 1n << 19n,
    'CONNECT': 1n << 20n,
    'SPEAK': 1n << 21n,
    'MUTE_MEMBERS': 1n << 22n,
    'DEAFEN_MEMBERS': 1n << 23n,
    'MOVE_MEMBERS': 1n << 24n,
    'USE_VAD': 1n << 25n,
    'CHANGE_NICKNAME': 1n << 26n,
    'MANAGE_NICKNAMES': 1n << 27n,
    'MANAGE_ROLES': 1n << 28n,
    'MANAGE_WEBHOOKS': 1n << 29n,
    'MANAGE_EMOJIS_AND_STICKERS': 1n << 30n,
    'USE_APPLICATION_COMMANDS': 1n << 31n,
    'REQUEST_TO_SPEAK': 1n << 32n,
    'MANAGE_EVENTS': 1n << 33n,
    'MANAGE_THREADS': 1n << 34n,
    'CREATE_PUBLIC_THREADS': 1n << 35n,
    'CREATE_PRIVATE_THREADS': 1n << 36n,
    'USE_EXTERNAL_STICKERS': 1n << 37n,
    'SEND_MESSAGES_IN_THREADS': 1n << 38n,
    'USE_EMBEDDED_ACTIVITIES': 1n << 39n,
    'MODERATE_MEMBERS': 1n << 40n,
    
    // Moderation Permissions
    'KICK_MEMBERS': 1n << 1n,
    'BAN_MEMBERS': 1n << 2n,
    'ADMINISTRATOR': 1n << 3n,
};

// Map Discord.js permission names to Discord API names
const PERMISSION_ALIASES = {
    // Discord.js format -> Discord API format
    'KickMembers': 'KICK_MEMBERS',
    'BanMembers': 'BAN_MEMBERS',
    'ManageChannels': 'MANAGE_CHANNELS',
    'ManageGuild': 'MANAGE_GUILD',
    'AddReactions': 'ADD_REACTIONS',
    'ViewAuditLog': 'VIEW_AUDIT_LOG',
    'PrioritySpeaker': 'PRIORITY_SPEAKER',
    'Stream': 'STREAM',
    'ViewChannel': 'VIEW_CHANNEL',
    'SendMessages': 'SEND_MESSAGES',
    'SendTTSMessages': 'SEND_TTS_MESSAGES',
    'ManageMessages': 'MANAGE_MESSAGES',
    'EmbedLinks': 'EMBED_LINKS',
    'AttachFiles': 'ATTACH_FILES',
    'ReadMessageHistory': 'READ_MESSAGE_HISTORY',
    'MentionEveryone': 'MENTION_EVERYONE',
    'UseExternalEmojis': 'USE_EXTERNAL_EMOJIS',
    'ViewGuildInsights': 'VIEW_GUILD_INSIGHTS',
    'Connect': 'CONNECT',
    'Speak': 'SPEAK',
    'MuteMembers': 'MUTE_MEMBERS',
    'DeafenMembers': 'DEAFEN_MEMBERS',
    'MoveMembers': 'MOVE_MEMBERS',
    'UseVAD': 'USE_VAD',
    'ChangeNickname': 'CHANGE_NICKNAME',
    'ManageNicknames': 'MANAGE_NICKNAMES',
    'ManageRoles': 'MANAGE_ROLES',
    'ManageWebhooks': 'MANAGE_WEBHOOKS',
    'ManageEmojisAndStickers': 'MANAGE_EMOJIS_AND_STICKERS',
    'UseApplicationCommands': 'USE_APPLICATION_COMMANDS',
    'RequestToSpeak': 'REQUEST_TO_SPEAK',
    'ManageEvents': 'MANAGE_EVENTS',
    'ManageThreads': 'MANAGE_THREADS',
    'CreatePublicThreads': 'CREATE_PUBLIC_THREADS',
    'CreatePrivateThreads': 'CREATE_PRIVATE_THREADS',
    'UseExternalStickers': 'USE_EXTERNAL_STICKERS',
    'SendMessagesInThreads': 'SEND_MESSAGES_IN_THREADS',
    'UseEmbeddedActivities': 'USE_EMBEDDED_ACTIVITIES',
    'ModerateMembers': 'MODERATE_MEMBERS',
    'Administrator': 'ADMINISTRATOR',
};

// Normalize permission name to Discord API format
function normalizePermissionName(permission) {
    // If it's already in API format, return as-is
    if (DISCORD_PERMISSIONS[permission]) {
        return permission;
    }
    
    // If it's in Discord.js format, convert to API format
    if (PERMISSION_ALIASES[permission]) {
        return PERMISSION_ALIASES[permission];
    }
    
    // Return original if no mapping found
    return permission;
}

// Permission patterns to search for in the code
const PERMISSION_PATTERNS = [
    // Direct permission checks
    { pattern: /\.permissions\.has\(['"`]([^'"`]+)['"`]\)/g, type: 'permission_check' },
    { pattern: /\.permissions\.has\(([A-Z_]+)\)/g, type: 'permission_constant' },
    
    // Moderation actions
    { pattern: /\.kick\s*\(/g, permissions: ['KICK_MEMBERS'] },
    { pattern: /\.ban\s*\(/g, permissions: ['BAN_MEMBERS'] },
    { pattern: /\.timeout\s*\(/g, permissions: ['MODERATE_MEMBERS', 'MANAGE_ROLES'] },
    
    // Channel operations
    { pattern: /\.send\s*\(/g, permissions: ['SEND_MESSAGES'] },
    { pattern: /\.reply\s*\(/g, permissions: ['SEND_MESSAGES'] },
    { pattern: /\.edit\s*\(/g, permissions: ['MANAGE_MESSAGES'] },
    { pattern: /\.delete\s*\(/g, permissions: ['MANAGE_MESSAGES'] },
    { pattern: /\.bulkDelete\s*\(/g, permissions: ['MANAGE_MESSAGES'] },
    { pattern: /\.react\s*\(/g, permissions: ['ADD_REACTIONS'] },
    
    // Thread operations
    { pattern: /\.threads\.create\s*\(/g, permissions: ['CREATE_PUBLIC_THREADS'] },
    { pattern: /\.setArchived\s*\(/g, permissions: ['MANAGE_THREADS'] },
    
    // Role operations
    { pattern: /\.roles\.add\s*\(/g, permissions: ['MANAGE_ROLES'] },
    { pattern: /\.roles\.remove\s*\(/g, permissions: ['MANAGE_ROLES'] },
    { pattern: /\.roles\.set\s*\(/g, permissions: ['MANAGE_ROLES'] },
    
    // Member operations
    { pattern: /\.setNickname\s*\(/g, permissions: ['MANAGE_NICKNAMES'] },
    { pattern: /\.voice\.setChannel\s*\(/g, permissions: ['MOVE_MEMBERS'] },
    { pattern: /\.voice\.setMute\s*\(/g, permissions: ['MUTE_MEMBERS'] },
    { pattern: /\.voice\.setDeaf\s*\(/g, permissions: ['DEAFEN_MEMBERS'] },
    
    // Channel management
    { pattern: /channels\.create\s*\(/g, permissions: ['MANAGE_CHANNELS'] },
    { pattern: /\.setName\s*\(/g, permissions: ['MANAGE_CHANNELS'] },
    { pattern: /\.setTopic\s*\(/g, permissions: ['MANAGE_CHANNELS'] },
    
    // File attachments
    { pattern: /files:\s*\[.*\]/g, permissions: ['ATTACH_FILES'] },
    { pattern: /attachment.*new.*AttachmentBuilder/g, permissions: ['ATTACH_FILES'] },
    
    // Embeds
    { pattern: /EmbedBuilder/g, permissions: ['EMBED_LINKS'] },
    { pattern: /embeds:\s*\[/g, permissions: ['EMBED_LINKS'] },
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
    /node_modules/,
    /\.git/,
    /dist/,
    /\.next/,
    /coverage/,
    /\.nyc_output/,
];

function shouldExcludeFile(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function getAllFiles(dirPath, filesList = []) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const fullPath = path.resolve(filePath);
        
        if (shouldExcludeFile(fullPath)) {
            return;
        }
        
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, filesList);
        } else if (file.match(/\.(ts|js|tsx|jsx)$/)) {
            filesList.push(filePath);
        }
    });
    
    return filesList;
}

function scanFileForPermissions(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundPermissions = new Set();
    const details = [];
    
    for (const pattern of PERMISSION_PATTERNS) {
        let match;
        
        if (pattern.type === 'permission_check') {
            while ((match = pattern.pattern.exec(content)) !== null) {
                const rawPermission = match[1];
                const permission = normalizePermissionName(rawPermission);
                foundPermissions.add(permission);
                details.push({
                    permission,
                    rawPermission,
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    context: match[0]
                });
            }
        } else if (pattern.type === 'permission_constant') {
            while ((match = pattern.pattern.exec(content)) !== null) {
                const rawPermission = match[1];
                const permission = normalizePermissionName(rawPermission);
                foundPermissions.add(permission);
                details.push({
                    permission,
                    rawPermission,
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    context: match[0]
                });
            }
        } else if (pattern.permissions) {
            while ((match = pattern.pattern.exec(content)) !== null) {
                pattern.permissions.forEach(perm => {
                    foundPermissions.add(perm);
                    details.push({
                        permission: perm,
                        file: filePath,
                        line: content.substring(0, match.index).split('\n').length,
                        context: match[0],
                        inferred: true
                    });
                });
            }
        }
    }
    
    return { permissions: foundPermissions, details };
}

function calculatePermissionInteger(permissions) {
    let total = 0n;
    const validPermissions = [];
    const invalidPermissions = [];
    
    permissions.forEach(perm => {
        if (DISCORD_PERMISSIONS[perm]) {
            total |= DISCORD_PERMISSIONS[perm];
            validPermissions.push(perm);
        } else {
            invalidPermissions.push(perm);
        }
    });
    
    return { total: total.toString(), validPermissions, invalidPermissions };
}

function main() {
    console.log('🔍 Scanning codebase for Discord permissions...\n');
    
    const rootDir = process.cwd();
    const files = getAllFiles(rootDir);
    
    console.log(`📁 Found ${files.length} files to scan\n`);
    
    const allPermissions = new Set();
    const allDetails = [];
    
    files.forEach(file => {
        const result = scanFileForPermissions(file);
        result.permissions.forEach(perm => allPermissions.add(perm));
        allDetails.push(...result.details);
    });
    
    console.log('📋 DISCOVERED vs AVAILABLE PERMISSIONS:');
    console.log('======================================\n');
    
    // Show all available Discord permissions
    const allDiscordPermissions = Object.keys(DISCORD_PERMISSIONS).sort();
    const usedPermissions = Array.from(allPermissions).sort();
    const unusedPermissions = allDiscordPermissions.filter(p => !allPermissions.has(p));
    
    console.log(`✅ USED PERMISSIONS: ${usedPermissions.length}/${allDiscordPermissions.length}\n`);
    
    // Group details by permission
    const permissionGroups = {};
    allDetails.forEach(detail => {
        if (!permissionGroups[detail.permission]) {
            permissionGroups[detail.permission] = [];
        }
        permissionGroups[detail.permission].push(detail);
    });
    
    // Check for normalized permissions
    const normalizedMappings = {};
    allDetails.forEach(detail => {
        if (detail.rawPermission && detail.rawPermission !== detail.permission) {
            if (!normalizedMappings[detail.rawPermission]) {
                normalizedMappings[detail.rawPermission] = detail.permission;
            }
        }
    });
    
    if (Object.keys(normalizedMappings).length > 0) {
        console.log('🔄 PERMISSION NORMALIZATION:');
        console.log('============================\n');
        Object.entries(normalizedMappings).forEach(([raw, normalized]) => {
            console.log(`📝 ${raw} → ${normalized} (Discord.js format converted to API format)`);
        });
        console.log('');
    }

    // Display USED permissions with their usage
    usedPermissions.forEach(permission => {
        const usages = permissionGroups[permission] || [];
        const inferredCount = usages.filter(u => u.inferred).length;
        const explicitCount = usages.length - inferredCount;
        
        console.log(`✅ ${permission}`);
        console.log(`   Used in ${usages.length} place(s) (${explicitCount} explicit, ${inferredCount} inferred)`);
        
        // Show different raw permission names used for this normalized permission
        const rawPermissions = [...new Set(usages.map(u => u.rawPermission || u.permission).filter(Boolean))];
        if (rawPermissions.length > 1 || (rawPermissions.length === 1 && rawPermissions[0] !== permission)) {
            console.log(`   Raw formats found: ${rawPermissions.join(', ')}`);
        }
        
        // Show a few example usages
        const examples = usages.slice(0, 2);
        examples.forEach(usage => {
            const fileName = path.relative(rootDir, usage.file);
            const type = usage.inferred ? '(inferred)' : '(explicit)';
            const rawFormat = usage.rawPermission && usage.rawPermission !== usage.permission ? ` [${usage.rawPermission}]` : '';
            console.log(`   • ${fileName}:${usage.line} ${type}${rawFormat}`);
        });
        
        if (usages.length > 2) {
            console.log(`   • ... and ${usages.length - 2} more`);
        }
        console.log('');
    });
    
    // Display UNUSED permissions
    if (unusedPermissions.length > 0) {
        console.log('\n❌ UNUSED PERMISSIONS:', unusedPermissions.length);
        console.log('=======================\n');
        console.log('These permissions are available but NOT currently used in the codebase:\n');
        
        unusedPermissions.forEach(permission => {
            console.log(`  • ${permission}`);
        });
        console.log('');
    }
    
    // Calculate permission integer
    const result = calculatePermissionInteger(allPermissions);
    
    console.log('🔢 PERMISSION CALCULATION:');
    console.log('==========================\n');
    
    if (result.invalidPermissions.length > 0) {
        console.log('⚠️  Unknown permissions found:');
        result.invalidPermissions.forEach(perm => {
            console.log(`   • ${perm}`);
        });
        console.log('');
    }
    
    console.log(`📊 Valid permissions: ${result.validPermissions.length}`);
    console.log(`🔢 Permission integer: ${result.total}`);
    console.log('');
    
    console.log('🔗 UPDATED INVITE URL:');
    console.log('======================\n');
    
    const clientId = 'YOUR_CLIENT_ID'; // Will be replaced in the actual invite URL
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${result.total}&scope=bot%20applications.commands`;
    console.log(inviteUrl);
    console.log('');
    
    console.log('📝 RECOMMENDED ACTIONS:');
    console.log('=======================\n');
    console.log('1. Replace YOUR_CLIENT_ID in the URL above with your actual Discord Client ID');
    console.log('2. Update your bot invite URLs in the codebase to use this permission integer');
    console.log('3. Re-invite your bot to servers or update permissions in Discord Developer Portal');
    console.log('4. Test the bot to ensure all features work correctly');
    console.log('');
    
    // Generate code snippets for updating invite URLs
    console.log('💻 CODE UPDATES NEEDED:');
    console.log('=======================\n');
    console.log('Update these files to use the new permission integer:');
    console.log('');
    console.log('src/app/dashboard/select-guild/client.tsx:');
    console.log(`  permissions=${result.total}`);
    console.log('');
    console.log('src/components/dashboard/GuildSelectorClient.tsx:');
    console.log(`  permissions=${result.total}`);
    console.log('');
    
    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        permissions: Array.from(allPermissions).sort(),
        permissionInteger: result.total,
        details: allDetails,
        filesScanned: files.length,
        inviteUrl: inviteUrl.replace('YOUR_CLIENT_ID', '${CLIENT_ID}')
    };
    
    fs.writeFileSync('discord-permissions-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Detailed report saved to: discord-permissions-report.json');
}

if (require.main === module) {
    main();
}

module.exports = { scanFileForPermissions, calculatePermissionInteger, DISCORD_PERMISSIONS };
