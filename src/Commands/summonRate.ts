import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  CommandInteraction,
} from "discord.js";
import type Command from "../interfaces/Command";
import { calcSummonRate } from "../RandomTools/SummonersWar/summonRate";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("summonrate")
    .setDescription("Donne les probabilités pour ta summon en 4nat et 5nat.")
    .addIntegerOption((option) =>
      option
        .setName("vm")
        .setDescription("Nombre de Velin Mystique")
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("vl")
        .setDescription("Nombre de Velin légendaire")
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("ld")
        .setDescription("Nombre de Velin Light and Dark")
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("tta")
        .setDescription("Nombre de tout-attribut")
        .setRequired(false),
    ) as SlashCommandBuilder,

  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) {
      await interaction.reply({
        content: "❌ Cette commande ne peut pas être utilisée ici.",
        ephemeral: true,
      });
      return;
    }
    const vm = interaction.options.getInteger("vm") ?? 0;
    const vl = interaction.options.getInteger("vl") ?? 0;
    const ld = interaction.options.getInteger("ld") ?? 0;
    const tta = interaction.options.getInteger("tta") ?? 0;
    const result = calcSummonRate(vm, vl, ld, tta);
    await interaction.reply({ content: result, ephemeral: false });
  },
};

export default command;
