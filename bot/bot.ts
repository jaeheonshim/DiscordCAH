import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  BaseInteraction,
} from "discord.js";
import config from "./config.json" assert { type: "json" };
import fs from "node:fs";
import "./deployCommands.js";
import { CAHError } from "../server/model/cahresponse.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Sentry.init({
  dsn: "https://50e6331e22374ce5932d547293aae7af@o573198.ingest.sentry.io/4505326774124544",
  tracesSampleRate: 1.0,
});

axios.defaults.headers.common["Authorization"] = `Bearer ${config.apiToken}`;

const token = config.token;

export const client: any = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = "file://" + path.join(commandsPath, file);
  const command: any = (await import(filePath)).default;
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Load events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = "file://" + path.join(eventsPath, file);
  const event = (await import(filePath)).default;

  if ("name" in event && "execute" in event) {
    client.on(event.name, event.execute);
  } else {
    console.log(
      `[WARNING] The event at ${filePath} is missing a required "name" or "execute" property.`
    );
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);
