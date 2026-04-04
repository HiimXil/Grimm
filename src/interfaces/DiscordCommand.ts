export interface DiscordCommand {
  id: string;
  application_id: string;
  version: string;
  default_member_permissions: null;
  type: number;
  name: string;
  description: string;
  guild_id: string;
  options: Option[];
  nsfw: boolean;
}

export interface Option {}
