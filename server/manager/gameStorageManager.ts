import { scheduleJob } from "node-schedule";
import { CAHError, CAHResponse, CAHSuccess } from "../model/cahresponse.js";
import { CAHGame, CAHPlayer } from "../model/classes.js";
import config from "../config.json" assert {type: "json"};

const gameMap = new Map<string, CAHGame>();
const channelIdMap = new Map<string, string>();

export function getGameMap(): Map<string, CAHGame> {
  return gameMap;
}

export function createNewGame(channelId: string): CAHGame {
  const gameId = channelIdMap.get(channelId);
  if (gameId) {
    if (gameMap.get(gameId)) {
      throw new CAHError("A game already exists in this channel!");
    } else {
      // if there isn't a valid game associated, there's probably a mistake.
      // remove channel id from channelIdMap
      channelIdMap.delete(channelId);
    }
  }

  const newGame = new CAHGame();
  newGame.channelId = channelId;

  gameMap.set(newGame.id, newGame);
  channelIdMap.set(channelId, newGame.id);

  return newGame;
}

export function deleteGameById(gameId: string): CAHResponse {
  const game = retrieveGameById(gameId);
  gameMap.delete(game.id);
  channelIdMap.delete(game.channelId);

  game.deleted = true;

  return new CAHSuccess("Game successfully deleted.");
}

export function deleteGameByChannelId(channelId: string): CAHResponse {
  const gameId = channelIdMap.get(channelId);

  if (!gameId) {
    throw new CAHError("Game does not exist in this channel!");
  }

  return deleteGameById(gameId);
}

export function retrieveGameById(gameId: string) {
  const game = gameMap.get(gameId);

  if (!game || game.deleted) {
    throw new CAHError("Game does not exist!");
  }

  return game;
}

export function retrieveGameByChannelId(channelId: string) {
  const gameId = channelIdMap.get(channelId);

  if (!gameId) {
    throw new CAHError("Game does not exist in this channel!");
  }

  return retrieveGameById(gameId);
}

// Scheduler to delete inactive games
scheduleJob("*/5 * * * *", () => {
  for(const gameId of getGameMap().keys()) {
    const game = gameMap.get(gameId);
    const timeSinceLastInteraction = Date.now() - game.lastInteraction;

    if(timeSinceLastInteraction > config.maximumGameInactiveDuration) {
      deleteGameById(game.id);
    }
  }
});