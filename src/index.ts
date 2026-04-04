import { client } from "./Utils/Client";
import dotenv from "dotenv";
import { sendWelcomeMessage } from "./WelcomeMessage/welcome";
import {
  addAllCommands,
  handleCommand,
  registerCommands,
  AddNewCommandDeleteOld,
} from "./Commands/CommandsUtils/addCommand";
import { resolve } from "path";
//env variables
dotenv.config({ path: resolve(__dirname, "../.env") });

// Event: Bot ready
client.once("clientReady", async () => {
  console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
  await AddNewCommandDeleteOld();
});

//Use the command handler for chat input commands
handleCommand(client);

// Send welcome message on member join and goodbye on member leave
sendWelcomeMessage(client);

//Connect the bot
client.login(process.env.DISCORD_TOKEN);
