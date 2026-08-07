import { promises as fs } from "fs";
import path from "path";
import { EpicFreeGames, OfferGame } from "epic-free-games";
import { client } from "../Utils/Client";
import { EmbedBuilder } from "discord.js";
import {
  getEpicGamesChannelId,
  getEpicGamesRoleId,
} from "../Settings/settings";

const epicFreeGames = new EpicFreeGames({
  country: "FR",
  locale: "fr",
  includeAll: true,
});

const SEEN_GAMES_FILE = path.join(__dirname, "../../data/seenGames.json");

type SeenGames = {
  gameId: string;
  effectiveDate: string;
};

async function getSeenGames(): Promise<SeenGames[]> {
  try {
    const raw = await fs.readFile(SEEN_GAMES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // file doesn't exist yet, first run
  }
}

async function saveSeenGames(seen: SeenGames[]) {
  await fs.mkdir(path.dirname(SEEN_GAMES_FILE), { recursive: true });
  await fs.writeFile(SEEN_GAMES_FILE, JSON.stringify(seen, null, 2));
}

function makeKey(games: SeenGames): string {
  return `${games.gameId}_${games.effectiveDate}`;
}

export async function checkEpicFreeGames(): Promise<OfferGame[]> {
  const currentGames = await epicFreeGames.getGames();
  const seenGames = await getSeenGames();
  const seenKeys = new Set(seenGames.map(makeKey));

  const newGames: OfferGame[] = [];

  for (const game of currentGames.currentGames) {
    const thisGame = {
      gameId: game.id,
      effectiveDate: game.effectiveDate,
    };

    if (!seenKeys.has(makeKey(thisGame))) {
      newGames.push(game);
      seenGames.push(thisGame);
      seenKeys.add(makeKey(thisGame));
    }
  }

  if (newGames.length > 0) {
    await saveSeenGames(seenGames);
  }

  return newGames;
}

//send a message in a preprogrammed channel with the new free games
export async function EpicFreeGamesSendMessage() {
  const games: OfferGame[] = await checkEpicFreeGames();

  for (const game of games) {
    const title = game.title;
    const pageSlug =
      game.offerMappings[0]?.pageSlug ||
      game.offerMappings[1]?.pageSlug ||
      game.offerMappings[2]?.pageSlug ||
      "unknown";
    const image = game.keyImages.find(
      (img) => img.type === "OfferImageWide",
    )?.url;
    const price = game.price.totalPrice.discountPrice;
    const originalPrice = game.price.totalPrice.originalPrice;
    const endDate = new Date(
      game.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.endDate ||
        game.promotions?.upcomingPromotionalOffers[0]?.promotionalOffers[0]
          ?.endDate ||
        game.effectiveDate,
    );

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(
        `**Open in :**\n- [Epicgames.com](https://store.epicgames.com/fr/p/${pageSlug}) | [Epic Launcher](https://store.epicgames.com/launch)\n\n**~~${(
          originalPrice / 100
        ).toFixed(2)}€~~ -> ${price / 100}€**\n\n🕒 End <t:${Math.floor(
          endDate.getTime() / 1000,
        )}:R>`,
      )
      .setColor(0x2374e1)
      .setThumbnail(image || null);

    //get guilds and client id from .env
    let guildId: string | undefined;
    let channelId: string | undefined;
    if (process.env.NODE_ENV == "development") {
      guildId = process.env.DEV_GUILD_ID;
      channelId = await getEpicGamesChannelId();
    } else {
      guildId = process.env.GUILD_ID;
      channelId = await getEpicGamesChannelId();
    }

    if (!guildId || !channelId) {
      console.error("Guild ID or Channel ID not set in environment variables.");
      return;
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`Guild with ID ${guildId} not found.`);
      return;
    }
    const channel = guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
      console.error(
        `Channel with ID ${channelId} not found or is not text-based.`,
      );
      return;
    }

    await channel.send({
      content: `<@&${await getEpicGamesRoleId()}>`,
      embeds: [embed],
    });
    console.log(`✅ Sent message for free game: ${title}`);
  }
}
