import { incrementUserStatistic } from "../database/users.js";
import { CAHError, CAHResponse, CAHSuccess } from "../model/cahresponse.js";
import { CAHGameStatus, CAHPlayer } from "../model/classes.js";
import { UserStatistic } from "../model/user.js";
import { dealCardsToPlayers } from "./gamePlayManager.js";
import { retrieveGameById } from "./gameStorageManager.js";
import { retrieveUsername } from "./usernameManager.js";

const playerMap = new Map<string, CAHPlayer>();

export function playerJoinGame(gameId: string, playerId: string): CAHResponse {
  const game = retrieveGameById(gameId);
  
  if (playerInGame(playerId)) {
    throw new CAHError("Player is already in a game!");
  }
  
  const player = new CAHPlayer(playerId);

  playerMap.set(playerId, player);

  game.players[playerId] = player;
  player.game = game;

  if(game.status == CAHGameStatus.PLAYER_SUBMIT_CARD) {
    dealCardsToPlayers(game, [player]);
    
    // if player is joining game for first time, increment their statistic
    if(!game.joinedPlayerIds.has(playerId)) {
      incrementUserStatistic(playerId, UserStatistic.gamesBegun);
    }
  }

  return new CAHSuccess(`\`Successfully joined game!`);
}

export function retrievePlayerById(playerId: string): CAHPlayer {
  const player = playerMap.get(playerId);

  if (!player || (player.game && player.game.deleted)) throw new CAHError("Player not in game!");

  return player;
}

export function playerInGame(playerId: string): boolean {
  try {
    retrievePlayerById(playerId);
    return true;
  } catch (e) {
    return false;
  }
}

export function playerLeaveGame(playerId: string): CAHResponse {
  const player = retrievePlayerById(playerId);
  const game = player.game;
  if (!game || !game.players[player.id]) {
    throw new CAHError("Player not in game!");
  }

  delete game.players[player.id];
  playerMap.delete(player.id);

  return new CAHSuccess(`Successfully left game.`);
}

export function playerReady(playerId: string): CAHResponse {
  const player = retrievePlayerById(playerId);
  player.ready = true;

  return new CAHSuccess(`\`${retrieveUsername(playerId)}\` is ready to begin! (${Object.values(player.game.players).filter(p => p.ready).length}/${Object.values(player.game.players).length})`);
}