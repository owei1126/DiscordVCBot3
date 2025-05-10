// prefix-commands/settings.js
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export const name = '設定';
export const description = '打開伺服器功能設定選單';

export async function execute(message) {
  // 建立一個下拉選單
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('settingsMenu')
    .setPlaceholder('請選擇要設定的項目')
    .addOptions([
      {
        label: '設定通知頻道',
        description: '指定通知要發送到哪個頻道',
        value: 'setChannel',
        emoji: '📢',
      },
      {
        label: '設定自動身分組',
        description: '指定進入語音後自動給予的身分組',
        value: 'setRole',
        emoji: '🎭',
      },
      {
        label: '刪除頻道設定',
        description: '清除目前設定的通知頻道',
        value: 'removeChannel',
        emoji: '❌',
      },
      {
        label: '刪除身分組設定',
        description: '清除目前設定的自動身分組',
        value: 'removeRole',
        emoji: '🧹',
      },
      {
        label: '顯示目前設定',
        description: '查看目前頻道與身分組設定',
        value: 'showConfig',
        emoji: '🔍',
      },
    ]);

  // 建立選單所在的 row
  const row = new ActionRowBuilder().addComponents(selectMenu);

  // 回覆訊息
  await message.reply({
    content: '請選擇要設定的項目：',
    components: [row],
  });
}
