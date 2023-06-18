import config from "../config.json" assert { type: "json" };
import path from "path";
import fs from "node:fs";
import { REST, Routes } from "discord.js";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = config.token;

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, "../commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = "file://" + path.join(commandsPath, file);
  const command: any = (await import(filePath)).default;
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
