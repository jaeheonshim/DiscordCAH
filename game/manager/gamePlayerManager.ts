import { CAHError, CAHResponse, CAHSuccess } from "../model/cahresponse";
import { CAHPlayer } from "../model/classes";
import { retrieveGameById } from "./gameStorageManager";

const playerMap = new Map<string, CAHPlayer>();

export function playerJoinGame(gameId: string, playerId: string): CAHResponse {
  const game = retrieveGameById(gameId);
  const player = playerMap.get(playerId) || new CAHPlayer(playerId);

  if (player && player.game) {
    throw new CAHError("Player is already in a game!");
  }

  playerMap.set(playerId, player);

  game.players[playerId] = player;
  player.game = game;

  return new CAHSuccess("Successfully joined game!");
}

export function retrievePlayerById(playerId: string): CAHPlayer {
  const player = playerMap.get(playerId);

  return player;
}

export function playerLeaveGame(playerId: string): CAHResponse {
  const player = retrievePlayerById(playerId);
  const game = player.game;
  if (!game || !game.players[player.id]) {
    throw new CAHError("Player not in game!");
  }

  delete game.players[player.id];
  playerMap.delete(player.id);

  return new CAHSuccess("Successfully left game.");
}
