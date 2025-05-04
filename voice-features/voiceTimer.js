// voiceTimer.js - 語音時數紀錄
import { EmbedBuilder } from 'discord.js';
import settings from '../setting.json' assert { type: 'json' };

// 暫存每個使用者加入語音頻道的時間（Map：userId → timestamp）
const voiceJoinTimestamps = new Map();

/**
 * 主函式：處理語音狀態改變，計算使用者待在語音頻道的時間
 * @param {VoiceState} oldState - 原本的語音狀態
 * @param {VoiceState} newState - 新的語音狀態
 */
export default async function voiceTimer(oldState, newState) {
  const member = newState.member;
  const guildId = newState.guild.id;
  const config = settings[guildId];

  // 如果該伺服器沒設定語音紀錄頻道則跳過
  if (!config || !config.logChannelId) return;

  const logChannel = newState.guild.channels.cache.get(config.logChannelId);
  if (!logChannel) return;

  // 取得追蹤名單（可選），若為空則代表追蹤所有人
  const trackedUsers = config.trackedUsers || [];
  const shouldTrack = trackedUsers.length === 0 || trackedUsers.includes(member.id);
  if (!shouldTrack) return;

  // ✅ 使用者剛加入語音頻道 → 紀錄時間戳
  if (!oldState.channel && newState.channel) {
    voiceJoinTimestamps.set(member.id, Date.now());
    return;
  }

  // ✅ 使用者剛離開語音頻道 → 計算停留時間並送出 embed
  if (oldState.channel && !newState.channel) {
    const joinTime = voiceJoinTimestamps.get(member.id);
    if (!joinTime) return; // 沒有加入紀錄就略過（可能是 bot 重啟等狀況）

    // 計算停留時間（毫秒 → 秒 → 格式化）
    const durationMs = Date.now() - joinTime;
    const durationSec = Math.floor(durationMs / 1000);
    const hours = Math.floor(durationSec / 3600);
    const minutes = Math.floor((durationSec % 3600) / 60);
    const seconds = durationSec % 60;
    const formatted = `${hours} 小時 ${minutes} 分 ${seconds} 秒`;

    // 建立 embed 訊息
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('⏱ 語音結束紀錄')
      .setDescription(`<@${member.id}> 待在語音的時間：\n**${formatted}**`)
      .setTimestamp();

    // 發送至紀錄頻道
    logChannel.send({ embeds: [embed] }).catch(console.error);

    // 清除紀錄
    voiceJoinTimestamps.delete(member.id);
  }
}
