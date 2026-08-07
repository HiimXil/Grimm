import CommandHandler from "../../interfaces/CommandHandler";
import { REST, Routes, Client } from "discord.js";
import summonRate from "../summonRate";
import settings from "../settings";
import { client } from "../../Utils/Client";
import { handleModalSubmit } from "../../Settings/settings";

export const commandHandler = new CommandHandler();

//Add Command to the commandHandler
export function addAllCommands() {
  //add the current bot commands here
  commandHandler.addCommand(summonRate);
  commandHandler.addCommand(settings);
}

export async function AddNewCommandDeleteOld() {
  addAllCommands();
  const fetchedCommand = await commandHandler.fetchRegisteredCommands(client);
  if (process.env.DEV_GUILD_ID) {
    if (fetchedCommand?.guild) {
      for (const cmd of fetchedCommand.guild) {
        if (!commandHandler.getCommand(cmd.name)) {
          await commandHandler.deleteCommands(client, cmd.id);
          console.log("supprimé de la guild", cmd.name);
        }
      }
    }
  } else {
    if (fetchedCommand?.global) {
      for (const cmd of fetchedCommand.global) {
        if (!commandHandler.getCommand(cmd.name)) {
          await commandHandler.deleteCommands(client, cmd.id);
          console.log("supprimé globalement", cmd.name);
        }
      }
    }
  }
  registerCommands();
}

//Register Commands to the bot
export function registerCommands() {
  commandHandler.registerCommands(client);
}

export function handleCommand(client: Client) {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isModalSubmit()) {
      try {
        await handleModalSubmit(interaction);
      } catch (error) {
        console.error("Erreur lors de la soumission du modal : ", error);
        await interaction.reply({
          content: "❌ Une erreur est survenue lors de l'enregistrement.",
          ephemeral: true,
        });
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = commandHandler.getCommand(interaction.commandName);
      if (!command) {
        await interaction.reply({
          content: "❌ Commande introuvable.",
          ephemeral: true,
        });
        return;
      }
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error("Erreur lors de l'exécution de la commande : ", error);
        await interaction.reply({
          content:
            "❌ Une erreur est survenue lors de l'exécution de la commande.",
          ephemeral: true,
        });
      }
    }
  });
}
