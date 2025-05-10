// interactions/settingsMenu.js
import settings from '../setting.json' assert { type: 'json' };
import fs from 'fs';

export async function handleSettingsMenu(interaction) {
  const guildId = interaction.guildId;

  // 確保有初始設定
  if (!settings[guildId]) {
    settings[guildId] = {};
  }

  const selected = interaction.values[0];
  const member = interaction.member;

  switch (selected) {
    case 'setChannel':
      settings[guildId].voiceChannel = interaction.channel.id;
      await interaction.reply(`✅ 已將通知頻道設定為 <#${interaction.channel.id}>`);
      break;

    case 'setRole':
      const role = member.roles.highest; // 或者引導用戶用 W!設定角色 @role
      settings[guildId].autoRole = role.id;
      await interaction.reply(`✅ 已將自動身分組設定為 ${role.name}`);
      break;

    case 'removeChannel':
      delete settings[guildId].voiceChannel;
      await interaction.reply('✅ 已刪除通知頻道設定。');
      break;

    case 'removeRole':
      delete settings[guildId].autoRole;
      await interaction.reply('✅ 已刪除自動身分組設定。');
      break;

    case 'showConfig':
      const channelInfo = settings[guildId].voiceChannel
        ? `<#${settings[guildId].voiceChannel}>`
        : '未設定';
      const roleInfo = settings[guildId].autoRole
        ? `<@&${settings[guildId].autoRole}>`
        : '未設定';

      await interaction.reply(`📋 目前設定如下：\n📢 通知頻道：${channelInfo}\n🎭 自動身分組：${roleInfo}`);
      break;
  }

  // 儲存設定
  fs.writeFileSync('./setting.json', JSON.stringify(settings, null, 2));
}
export { handleSettingsMenu };

