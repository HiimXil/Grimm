import { Client } from "discord.js";
export function roulette(client: Client) {
  client.on("messageCreate", (message) => {
    if (message.content.startsWith("!roulette")) {
      const args = message.content.slice("!roulette".length).trim().split(/ +/);
      //Randomise a number dependings on the number of args
      //if no args, reply with a message
      if (args.length === 0) {
        message.reply("Pas de choix dans la roulette.");
        return;
      } else {
        const randomNumber = Math.floor(Math.random() * args.length);
        const result = args[randomNumber];
        let finalMessage = "🎰 Tirage en cours...";
        for (const arg of args) {
          finalMessage += `\n- ${arg}`;
        }
        message.reply(finalMessage);
        setTimeout(() => {
          message.reply(result);
        }, 3000);
      }
    }
  });
}
