import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  CommandInteraction,
} from "discord.js";
import type Command from "../interfaces/Command";
import {
  calcSummonRate,
  calcSummonRate12Years,
} from "../RandomTools/SummonersWar/summonRate";

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
    )
    .addAttachmentOption((option) =>
      option
        .setName("12y")
        .setDescription("Nombre de Velin des 12 ans")
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
    const twelves = interaction.options.getInteger("12y") ?? 0;
    const result = calcSummonRate12Years(vm, vl, ld, tta, twelves);
    await interaction.reply({ content: result, ephemeral: false });
  },
};

export default command;
