import { Client, REST, Routes } from "discord.js";
import type Command from "../interfaces/Command";
import type { DiscordCommand } from "./DiscordCommand";

export default class CommandHandler {
  private commands: Map<string, Command> = new Map();
  private rest: REST;

  constructor() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error("Bot token not found in environment variables");
    }
    this.rest = new REST().setToken(token);
  }

  public async registerCommands(client: Client) {
    try {
      const commands = Array.from(this.commands.values()).map((cmd) =>
        cmd.data.toJSON(),
      );

      if (!client.user) {
        throw new Error("Bot user is not available");
      }

      if (process.env.NODE_ENV === "development" && process.env.DEV_GUILD_ID) {
        // Register commands to a specific guild in development mode
        await this.rest.put(
          Routes.applicationGuildCommands(
            client.user.id,
            process.env.DEV_GUILD_ID,
          ),
          { body: commands },
        );
        console.log(
          `Registered ${commands.length} commands to guild ${process.env.DEV_GUILD_ID}`,
        );
      } else {
        // Register commands globally in production
        await this.rest.put(Routes.applicationCommands(client.user.id), {
          body: commands,
        });
        console.log(`Registered ${commands.length} commands globally`);
      }
    } catch (error) {
      console.log("Failed to register commands: " + error);
    }
  }

  public async fetchRegisteredCommands(client: Client) {
    try {
      if (!client.user) {
        throw new Error("Bot user is not available");
      }

      const appId = client.user.id;

      // 🌍 Global commands
      const globalCommands = (await this.rest.get(
        Routes.applicationCommands(appId),
      )) as DiscordCommand[];

      // 🧪 Guild commands (dev)
      let guildCommands = null;

      if (process.env.DEV_GUILD_ID) {
        guildCommands = (await this.rest.get(
          Routes.applicationGuildCommands(appId, process.env.DEV_GUILD_ID),
        )) as DiscordCommand[];
      }

      return {
        global: globalCommands,
        guild: guildCommands,
      };
    } catch (error) {
      console.log("Failed to fetch commands: " + error);
      return null;
    }
  }

  public async deleteCommands(client: Client, commandId: string) {
    try {
      if (!client.user) {
        throw new Error("Bot user is not available");
      }
      const appId = client.user.id;
      // 🧪 Supprimer commandes guild (dev)
      if (process.env.DEV_GUILD_ID) {
        await this.rest.delete(
          Routes.applicationGuildCommand(
            appId,
            process.env.DEV_GUILD_ID,
            commandId,
          ),
        );
        console.log(
          `Deleted guild command ${commandId} for ${process.env.DEV_GUILD_ID}`,
        );
      } else {
        await this.rest.put(Routes.applicationCommand(appId, commandId));
        console.log(`Deleted global command ${commandId}`);
      }
    } catch (error) {
      console.log("Failed to delete commands: " + error);
    }
  }

  public addCommand(command: Command) {
    this.commands.set(command.data.name, command);
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public removeCommand(name: string) {
    this.commands.delete(name);
  }
}
