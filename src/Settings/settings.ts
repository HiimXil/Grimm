import {
  ModalBuilder,
  LabelBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  RoleSelectMenuBuilder,
  Interaction,
  type ModalSubmitInteraction,
  type Guild,
} from "discord.js";
import { promises as fs } from "fs";
import path from "path";

const SETTINGS_FILE = path.join(__dirname, "../../data/settings.json");

type BotSettings = {
  epicGames?: {
    channelId?: string | null;
    roleId?: string | null;
  };
  welcome?: {
    channelId?: string | null;
  };
};

type SettingKey = keyof BotSettings;

type SettingDefinition = {
  label: string;
  type: "channel" | "role";
  customId: string;
  group: SettingKey;
  property: string;
};

type SettingValue = string | null | undefined;

type SettingUpdater = (params: {
  guild: NonNullable<Interaction["guild"]>;
  interaction: ModalSubmitInteraction;
  currentSettings: BotSettings;
}) => Promise<BotSettings>;

const SETTINGS_DEFINITIONS: SettingDefinition[] = [
  {
    label: "Channel pour les notifications d'Epic Games",
    type: "channel",
    customId: "EpicChannel",
    group: "epicGames",
    property: "channelId",
  },
  {
    label: "Rôle pour les notifications d'Epic Games",
    type: "role",
    customId: "EpicRole",
    group: "epicGames",
    property: "roleId",
  },
];

async function readSettings(): Promise<BotSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function getSetting<T = unknown>(
  group: SettingKey,
  property: string,
): Promise<T | undefined> {
  const settings = await readSettings();
  const groupSettings = settings[group];
  if (!groupSettings || typeof groupSettings !== "object") {
    return undefined;
  }

  return (groupSettings as Record<string, unknown>)[property] as T | undefined;
}

export async function getEpicGamesChannelId() {
  return getSetting<string>("epicGames", "channelId");
}

export async function getEpicGamesRoleId() {
  return getSetting<string>("epicGames", "roleId");
}

async function writeSettings(settings: BotSettings) {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(
    SETTINGS_FILE,
    `${JSON.stringify(settings, null, 2)}\n`,
    "utf-8",
  );
}

function buildSettingLabel(
  settings: BotSettings,
  definition: SettingDefinition,
) {
  const value =
    settings[definition.group]?.[
      definition.property as keyof NonNullable<BotSettings[SettingKey]>
    ];
  if (typeof value === "string" && value.length > 0) {
    return definition.type === "channel"
      ? `Channel : <#${value}>`
      : `Rôle : <@&${value}>`;
  }
  return definition.type === "channel"
    ? "Channel : non défini"
    : "Rôle : non défini";
}

async function updateSettings(
  updater: SettingUpdater,
  interaction: ModalSubmitInteraction,
) {
  if (!interaction.guild) {
    await interaction.reply({
      content: "❌ Cette commande ne peut pas être utilisée ici.",
      ephemeral: true,
    });
    return null;
  }

  const currentSettings = await readSettings();
  const nextSettings = await updater({
    guild: interaction.guild,
    interaction,
    currentSettings,
  });

  await writeSettings(nextSettings);
  return nextSettings;
}

export async function createModal(guild?: Guild | null) {
  const settings = await readSettings();
  const modal = new ModalBuilder()
    .setCustomId("settingsModal")
    .setTitle("Configuration du bot");

  for (const definition of SETTINGS_DEFINITIONS) {
    const savedValue =
      settings[definition.group]?.[
        definition.property as keyof NonNullable<BotSettings[SettingKey]>
      ];

    if (definition.type === "channel") {
      const select = new ChannelSelectMenuBuilder()
        .setCustomId(definition.customId)
        .setChannelTypes(ChannelType.GuildText)
        .setMinValues(1)
        .setMaxValues(1);

      if (typeof savedValue === "string" && savedValue.length > 0) {
        if (guild?.channels.cache.has(savedValue)) {
          select.setDefaultChannels(savedValue);
        }
      }

      const label = new LabelBuilder()
        .setLabel(definition.label)
        .setChannelSelectMenuComponent(select);

      modal.addLabelComponents(label);
      continue;
    }

    const select = new RoleSelectMenuBuilder().setCustomId(definition.customId);
    if (typeof savedValue === "string" && savedValue.length > 0) {
      if (guild?.roles.cache.has(savedValue)) {
        select.setDefaultRoles(savedValue);
      }
    }

    const label = new LabelBuilder()
      .setLabel(definition.label)
      .setRoleSelectMenuComponent(select);

    modal.addLabelComponents(label);
  }

  return modal;
}

export async function handleModalSubmit(interaction: Interaction) {
  if (
    !interaction.isModalSubmit() ||
    interaction.customId !== "settingsModal"
  ) {
    return;
  }

  const updatedSettings = await updateSettings(
    async ({ guild, currentSettings }) => {
      const nextSettings: BotSettings = {
        ...currentSettings,
      };

      for (const definition of SETTINGS_DEFINITIONS) {
        if (definition.type === "channel") {
          const selectedChannels = interaction.fields.getSelectedChannels(
            definition.customId,
          );
          const selectedChannel = selectedChannels?.first();
          const cachedChannel = selectedChannel
            ? guild.channels.cache.get(selectedChannel.id)
            : null;

          if (
            selectedChannel &&
            (!cachedChannel || !cachedChannel.isTextBased())
          ) {
            await interaction.reply({
              content: "❌ Le channel sélectionné n'est pas valide.",
              ephemeral: true,
            });
            return currentSettings;
          }

          if (cachedChannel && cachedChannel.isTextBased()) {
            nextSettings[definition.group] = {
              ...(nextSettings[definition.group] ?? {}),
              [definition.property]: cachedChannel.id,
            };
          }
          continue;
        }

        const selectedRoles = interaction.fields.getSelectedRoles(
          definition.customId,
        );
        const selectedRole = selectedRoles?.first();

        if (selectedRole) {
          nextSettings[definition.group] = {
            ...(nextSettings[definition.group] ?? {}),
            [definition.property]: selectedRole.id,
          };
        }
      }

      return nextSettings;
    },
    interaction,
  );

  if (!updatedSettings) {
    return;
  }

  const summary = SETTINGS_DEFINITIONS.map((definition) =>
    buildSettingLabel(updatedSettings, definition),
  ).join("\n");

  await interaction.reply({
    content: `✅ Paramètres enregistrés dans le fichier de configuration.\n${summary}`,
    ephemeral: true,
  });
}
