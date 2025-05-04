// joinLeaveNotify.js (ESM 語法版本)
import { EmbedBuilder, AuditLogEvent } from 'discord.js';
import settings from '../setting.json' assert { type: 'json' };

export default async function joinLeaveNotify(oldState, newState) {
  const member = newState.member;
  const guildId = newState.guild.id;
  const config = settings[guildId];

  if (!config || !config.voiceLogChannelId) return;
  const logChannel = newState.guild.channels.cache.get(config.voiceLogChannelId);
  if (!logChannel) return;

  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  const alreadyInChannel = oldState.channelId && newState.channelId;
  const justJoined = !oldState.channelId && newState.channelId;
  const justLeft = oldState.channelId && !newState.channelId;
  const switchedChannel = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

  // 📢 語音進出通知
  if (justJoined) {
    sendEmbed(logChannel, member, '🎧 加入語音頻道', `<@${member.id}> 加入了 <#${newChannel.id}>`, 0x3399ff);
  } else if (justLeft) {
    sendEmbed(logChannel, member, '👋 離開語音頻道', `<@${member.id}> 離開了 <#${oldChannel.id}>`, 0x3399ff);
  } else if (switchedChannel) {
    // 🔍 檢查是不是被搬移
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等1秒讓 audit log 更新

    try {
      const fetchedLogs = await newState.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberMove,
      });

      const moveLog = fetchedLogs.entries.find(entry =>
        entry.target &&
        entry.target.id === member.id &&
        (Date.now() - entry.createdTimestamp) < 10000
      );

      if (moveLog) {
        const mover = moveLog.executor;
        sendEmbed(
          logChannel,
          member,
          '🚚 使用者被移動語音頻道',
          `<@${member.id}> 被 <@${mover.id}> 移動到 <#${newChannel.id}>`,
          0xff6666
        );
      } else {
        sendEmbed(logChannel, member, '🔁 切換語音頻道', `<@${member.id}> 從 <#${oldChannel.id}> 移動到 <#${newChannel.id}>`, 0x3399ff);
      }
    } catch (error) {
      console.error('❗ 查詢移動紀錄錯誤:', error);
      sendEmbed(logChannel, member, '🔁 切換語音頻道', `<@${member.id}> 從 <#${oldChannel.id}> 移動到 <#${newChannel.id}>`, 0x3399ff);
    }
  }

  // 🎤 麥克風/耳機靜音/拒聽通知
  if (alreadyInChannel) {
    if (oldState.selfMute !== newState.selfMute) {
      sendEmbed(
        logChannel,
        member,
        newState.selfMute ? '🔇 自己靜音' : '🔊 自己解除靜音',
        `<@${member.id}> ${newState.selfMute ? '關閉了' : '開啟了'} 自己的麥克風`,
        0xffcc00
      );
    }

    if (oldState.selfDeaf !== newState.selfDeaf) {
      sendEmbed(
        logChannel,
        member,
        newState.selfDeaf ? '🙉 自己拒聽' : '👂 自己恢復聽音',
        `<@${member.id}> ${newState.selfDeaf ? '拒聽了語音' : '恢復聽取語音'}`,
        0xffcc00
      );
    }

    if (oldState.serverMute !== newState.serverMute) {
      sendEmbed(
        logChannel,
        member,
        newState.serverMute ? '🔇 被伺服器靜音' : '🔊 被解除伺服器靜音',
        `<@${member.id}> ${newState.serverMute ? '被伺服器靜音' : '伺服器解除靜音'}`,
        0xff3300
      );
    }

    if (oldState.serverDeaf !== newState.serverDeaf) {
      sendEmbed(
        logChannel,
        member,
        newState.serverDeaf ? '🙉 被伺服器拒聽' : '👂 被解除伺服器拒聽',
        `<@${member.id}> ${newState.serverDeaf ? '被伺服器拒聽' : '伺服器恢復聽音'}`,
        0xff3300
      );
    }
  }
}

// 📦 小工具：統一送 embed
function sendEmbed(channel, member, title, description, color) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setAuthor({
      name: `${member.user.username} (${member.user.id})`,
      iconURL: member.user.displayAvatarURL({ dynamic: true }),
    });

  channel.send({ embeds: [embed] }).catch(console.error);
}
