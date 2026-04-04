import { Client } from "discord.js";
import messages from "./welcomeMessage.json";

const welcomeMessages: string[] = messages.welcomeMessages;
const goodbyeMessages: string[] = messages.goodbyeMessages;

export function sendWelcomeMessage(client: Client) {
  client.on("guildMemberAdd", (member) => {
    const guild = member.guild;
    const channel = guild.systemChannel;
    if (channel) {
      const randomMessage =
        welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      channel.send(
        randomMessage.replace("<name>", "<@" + member.user.id + ">"),
      );
    }
  });
  client.on("guildMemberRemove", (member) => {
    const guild = member.guild;
    const channel = guild.systemChannel;
    if (channel) {
      const randomMessage =
        goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
      channel.send(
        randomMessage.replace("<name>", "<@" + member.user.id + ">"),
      );
    }
  });
}
