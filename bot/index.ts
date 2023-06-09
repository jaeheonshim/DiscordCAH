import { ShardingManager } from "discord.js";
import config from "./config.json" assert {type: "json"};
import "./deployCommands.js";

const manager = new ShardingManager('./dist/bot/bot.js', { token: config.token, execArgv: ["--no-warnings"] });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();