import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  name: 'help',
  description: '顯示可用指令清單',
  async execute(message) {
    const prefix = 'w!'; // 你的前綴

    const embed = new EmbedBuilder()
      .setColor(0xfee75c) // 黃色
      .setTitle('🛠️ 大幫手 - 可用指令清單')
      .setDescription(`
🔧 **設定指令**
\`${prefix}sv <語音頻道ID>\` - 設定監控語音頻道
\`${prefix}sr <@角色 或 角色ID>\` - 設定自動給身分組
\`${prefix}sl <#頻道>\` - 設定語音結束紀錄頻道
\`${prefix}status\` - 查看目前設定
\`${prefix}clear\` - 清除設定
      `)
      .setFooter({ text: '點擊下方按鈕快速複製指令！' })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('copy_sv')
        .setLabel(`${prefix}sv`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('copy_sr')
        .setLabel(`${prefix}sr`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('copy_sl')
        .setLabel(`${prefix}sl`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('copy_status')
        .setLabel(`${prefix}status`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('copy_clear')
        .setLabel(`${prefix}clear`)
        .setStyle(ButtonStyle.Secondary),
    );

    await message.channel.send({ embeds: [embed], components: [row1] });
  },
};
