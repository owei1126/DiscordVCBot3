// ✅ 載入 .env 檔案的變數（ESM 語法）
import 'dotenv/config.js';

// ✅ 從 discord.js 匯入所需功能（ESM 語法）
import { Client, GatewayIntentBits } from 'discord.js';

// ✅ 匯入自定義模組（請確認這些模組也都是 ESM 格式）
import settings from './setting.json' assert { type: 'json' };
import { handleCommands } from './commands.js';
import voiceTimer from './voice-features/voiceTimer.js';
import  joinLeaveNotify  from './voice-features/joinLeaveNotify.js';
import { handleSettingsMenu } from './interactions/settingsMenu.js';

// ❗注意：檔名後面請加 `.js`，ESM 不允許省略副檔名

// ✅ 建立 Discord bot client，指定需要的 intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ]
});

// ✅ 指令前綴字（不分大小寫）
const prefix = 'w!';

// ✅ 當 bot 上線時觸發
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ✅ 當有訊息時觸發（處理 prefix 指令）
client.on('messageCreate', async message => {
  await handleCommands(message, prefix);
});

// ✅ 當成員進出語音頻道時觸發
client.on('voiceStateUpdate', (oldState, newState) => {
  joinLeaveNotify(oldState, newState);
  voiceTimer(oldState, newState);

  const guildId = newState.guild.id;
  const config = settings[guildId];
  if (!config || !config.voiceChannel || !config.autoRole) return;

  const joined = newState.channelId === config.voiceChannel;
  const left = oldState.channelId === config.voiceChannel && newState.channelId !== config.voiceChannel;
  const member = newState.member;

  if (joined) {
    member.roles.add(config.autoRole).catch(console.error);
  }

  if (left) {
    member.roles.remove(config.autoRole).catch(console.error);
  }
});

//✅（可選）自動載入 prefix 指令清單功能（如果你沒用到就註解）
 /*import { loadPrefixCommands } from './loadPrefixCommands.js';
 let prefixCommands = new Map();
 client.once('ready', async () => {
   console.log(`✅ Logged in as ${client.user.tag}`);
   prefixCommands = await loadPrefixCommands();
 }); */

// ✅ 處理 w!help 產生的「複製按鈕」互動事件
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const commandsMap = {
    'copy_sv': 'w!sv ',
    'copy_sr': 'w!sr ',
    'copy_sl': 'w!sl ',
    'copy_status': 'w!status',
    'copy_clear': 'w!clear',
  };

  const command = commandsMap[interaction.customId];
  if (command) {
    await interaction.reply({
      content: command, // 只顯示純文字
      ephemeral: true,
    });
    
  }
});

// 下拉選單互動監聽


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId === 'settingsMenu') {
    await handleSettingsMenu(interaction);
  }
});


// ✅ 登入 Discord Bot（記得 .env 裡有設好 DISCORD_TOKEN）
client.login(process.env.DISCORD_TOKEN);
