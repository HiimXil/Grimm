import { Message, OmitPartialGroupDMChannel, MessageFlags } from "discord.js";
import { getSoloQueueLP } from "../RandomTools/LeagueOfLegends/league";

export async function handleNonOfficialCommand(
  message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
  if (message.author.id === process.env.ADMIN_USER_ID) {
    if (message.content === "!clear") {
      // Supprime les x derniers message du channel
      const channel = message.channel;
      const messages = await channel.messages.fetch({ limit: 1 });
      const messagesToDeleteCount = messages.size;
      if (messagesToDeleteCount > 0 && "bulkDelete" in channel) {
        await channel.bulkDelete(messages);
      }
      return;
    }
  }

  if (message.content === "!GiveMeDogsLP") {
    const lirio = getSoloQueueLP("Shortking", "MAGIC");
    const baguette = getSoloQueueLP("ENJOYINGLIFEKING", "BAGU");
    const jerome = getSoloQueueLP("ManDreamNeverDie", "Hope");
    const messageContent = await Promise.all([lirio, baguette, jerome]).then(
      (values) => {
        return values
          .map((data: any, index: number) => {
            if (data) {
              const name =
                index === 0
                  ? "Shortking-MAGIC"
                  : index === 1
                    ? "ENJOYINGLIFEKING-BAGU"
                    : "ManDreamNeverDie-Hope";
              return `[${name}](https://op.gg/lol/summoners/euw/${name}) \nTier: ${data.tier} ${data.rank} \nLP: ${data.lp} LP\n\n`;
            }
            return "";
          })
          .join("");
      },
    );
    message.reply({
      content: messageContent,
      flags: MessageFlags.SuppressEmbeds,
    });
    return;
  }

  if (message.content === "!ping") {
    message.reply("Pong !");
    return;
  }
}
