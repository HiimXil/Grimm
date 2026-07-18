import { client } from "./Utils/Client";
import { resolve } from "path";
import dotenv from "dotenv";
//env variables
dotenv.config({ path: resolve(__dirname, "../.env") });
import {
  handleCommand,
  AddNewCommandDeleteOld,
} from "./Commands/CommandsUtils/addCommand";
import { roulette } from "./RandomTools/Roulette/roulette";
import { sendWelcomeMessage } from "./WelcomeMessage/welcome";
import { handleNonOfficialCommand } from "./AdminCommand/adminCommand";
import { EpicFreeGamesSendMessage } from "./EpicGames/epicFreeGames";

// Event: Bot ready
client.once("clientReady", async () => {
  console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
  await AddNewCommandDeleteOld();

  // Fetch free games from Epic Games Store every 6 hours
  setInterval(
    async () => {
      console.log("✅ Fetching free games from Epic Games Store...");
      await EpicFreeGamesSendMessage();
    },
    6 * 60 * 60 * 1000,
  );
});

// Use the non-official command handler for messages
client.on("messageCreate", async (message) => {
  await handleNonOfficialCommand(message);
});

//Use the command handler for chat input commands
handleCommand(client);

// Send welcome message on member join and goodbye on member leave
sendWelcomeMessage(client);

// Roulette command
roulette(client);

//Connect the bot
client.login(process.env.DISCORD_TOKEN);
