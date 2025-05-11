// commands.js（ESM 版本）用來統一處理 prefix 指令
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import settings from './setting.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { commandDescriptions } from './commandDescriptions.js'; // ✅ 外部引入
import { handleSettingsMenu, showSettingsMenu } from './interactions/settingsMenu.js';




const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const settingPath = path.join(__dirname, 'setting.json');

function saveSettings() {
  fs.writeFileSync(settingPath, JSON.stringify(settings, null, 2));
}

export async function handleCommands(message, prefix) {
  const content = message.content.trim();
  if (!content.toLowerCase().startsWith(prefix.toLowerCase()) || message.author.bot) return;

  const args = content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();
  const guildId = message.guild.id;

  if (!settings[guildId]) settings[guildId] = {};

  // === 指令：sv（設定語音頻道） ===
  if (cmd === 'sv') {
    const channelId = args[0];
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== 2) return message.reply('❌ 請輸入有效的語音頻道 ID');

    settings[guildId].voiceChannel = channel.id;
    saveSettings();
    return message.reply(`✅ 語音頻道已設定為：${channel.name}`);
  }

  // === 指令：sr（設定身分組） ===
  if (cmd === 'sr') {
    const roleId = message.mentions.roles.first()?.id || args[0];
    const role = message.guild.roles.cache.get(roleId);
    if (!role) return message.reply('❌ 請輸入有效的身分組 ID 或 @標記');

    settings[guildId].autoRole = role.id;
    saveSettings();
    return message.reply(`✅ 自動身分組已設定為：${role.name}`);
  }

  // === 指令：sl（設定紀錄頻道與追蹤對象） ===
  if (cmd === 'sl') {
    const logChannel = message.mentions.channels.first();
    if (!logChannel) return message.reply('❌ 請標記一個文字頻道當作語音紀錄頻道');

    const trackedUsers = message.mentions.users.map(u => u.id).concat(
      args.filter(arg => /^\d{17,}$/.test(arg) && !message.mentions.channels.has(arg))
    );

    settings[guildId].logChannelId = logChannel.id;
    settings[guildId].trackedUsers = trackedUsers;
    saveSettings();

    return message.reply(`✅ 已設定語音紀錄頻道為 ${logChannel}，紀錄對象為：${
      trackedUsers.length > 0 ? trackedUsers.map(id => `<@${id}>`).join('、') : '未指定'
    }`);
  }

  // === 指令：clear（清除設定） ===
  if (cmd === 'clear') {
    delete settings[guildId];
    saveSettings();
    return message.reply('🧹 已清除當前伺服器的設定');
  }

  // === 指令：status（顯示設定） ===
  if (cmd === 'status') {
    const config = settings[message.guild.id];
    if (!config) return message.reply('❌ 此伺服器尚未設定任何內容。');

    const voiceChannel = message.guild.channels.cache.get(config.voiceChannel);
    const autoRole = message.guild.roles.cache.get(config.autoRole);
    const logChannel = message.guild.channels.cache.get(config.logChannelId);
    const trackedUsers = config.trackedUsers || [];

    const embed = new EmbedBuilder()
      .setTitle('📊 當前設定狀態')
      .setColor(0x0099FF)
      .addFields(
        { name: '🎤 語音頻道', value: voiceChannel ? `<#${voiceChannel.id}>` : '未設定', inline: true },
        { name: '🎭 自動身分組', value: autoRole ? `<@&${autoRole.id}>` : '未設定', inline: true },
        { name: '📥 紀錄頻道', value: logChannel ? `<#${logChannel.id}>` : '未設定', inline: true },
        {
          name: '👀 追蹤成員',
          value: trackedUsers.length > 0
            ? trackedUsers.map(id => `<@${id}>`).join('\n')
            : '目前追蹤所有人',
        }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }

    // === 指令：help（動態產生，來自 commandDescriptions） ===
    if (cmd === 'help') {
      const embed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle('🛠️ 大幫手 - 可用指令清單')
        .setFooter({ text: '點擊下方按鈕快速複製指令！' })
        .setTimestamp();
  
      const commandList = Object.entries(commandDescriptions)
        .map(([key, desc]) => `\`${prefix}${key}\` - ${desc}`)
        .join('\n');
  
      embed.setDescription(commandList);
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('copy_sv').setLabel(`${prefix}sv`).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('copy_sr').setLabel(`${prefix}sr`).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('copy_sl').setLabel(`${prefix}sl`).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('copy_status').setLabel(`${prefix}status`).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('copy_clear').setLabel(`${prefix}clear`).setStyle(ButtonStyle.Secondary),
      );
  
      return message.reply({ embeds: [embed], components: [row] });
    }

    // === 指令：設定（顯示下拉選單） ===
    if (cmd === '設定') {
      await showSettingsMenu(message); // 確保有引入 showSettingsMenu 並傳入 message
      return;
    }
    

}
