import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  BaseInteraction,
} from "discord.js";
import config from "./config.json";
import path from "node:path";
import fs from "node:fs";
import "./deployCommands";
import { CAHError } from "../server/model/cahresponse";
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://50e6331e22374ce5932d547293aae7af@o573198.ingest.sentry.io/4505326774124544",
  tracesSampleRate: 1.0,
});

const token = config.token;

export const client: any = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default;
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
  .filter((file) => file.endsWith(".ts"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath).default;
  
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
