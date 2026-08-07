import {
  SlashCommandBuilder,
  CommandInteraction,
  ModalBuilder,
  LabelBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} from "discord.js";
import type Command from "../interfaces/Command";
import { createModal } from "../Settings/settings";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Setup settings for the bot.") as SlashCommandBuilder,

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) {
      await interaction.reply({
        content: "❌ Cette commande ne peut pas être utilisée ici.",
        ephemeral: true,
      });
      return;
    }

    const modal = await createModal();

    await interaction.showModal(modal);
  },
};

export default command;
