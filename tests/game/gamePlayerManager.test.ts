import { CAHError } from "../../server/model/cahresponse";
import { CAHGame } from "../../server/model/classes";
import {
  playerJoinGame,
  playerLeaveGame,
  retrievePlayerById,
} from "../../server/manager/gamePlayerManager";
import {
  createNewGame,
  deleteGameById,
  retrieveGameById,
} from "../../server/manager/gameStorageManager";
import { v4 as uuidv4 } from "uuid";

describe("testing player join and leave", () => {
  let newGame: CAHGame;

  beforeEach(() => {
    const channelId = uuidv4();
    newGame = createNewGame(channelId);
  });

  test("player should be able to join games", () => {
    const playerId = uuidv4();
    playerJoinGame(newGame.id, playerId);
    expect(newGame.players[playerId]).toBeDefined();
  });

  test("player should not be able to join games if they are already in game", () => {
    const playerId = uuidv4();
    playerJoinGame(newGame.id, playerId);

    const anotherGame = createNewGame(uuidv4());
    expect(() => playerJoinGame(anotherGame.id, playerId)).toThrow(CAHError);
  });

  test("manager should be able to retrieve players and player games", () => {
    const playerId = uuidv4();
    playerJoinGame(newGame.id, playerId);

    const player = retrievePlayerById(playerId);
    expect(player.game.id).toEqual(newGame.id);
  });

  test("player should be able to leave games", () => {
    const playerId = uuidv4();
    playerJoinGame(newGame.id, playerId);
    const gameId = retrievePlayerById(playerId).game.id;

    playerLeaveGame(playerId);

    const game = retrieveGameById(gameId);
    expect(game.players[playerId]).toBeUndefined();
    expect(retrievePlayerById(playerId)).toBeUndefined();
  });

  test("player should be able to join new games after current game ends", () => {
    const playerId = uuidv4();
    playerJoinGame(newGame.id, playerId);

    expect(() => playerJoinGame(newGame.id, playerId)).toThrow(CAHError);

    deleteGameById(newGame.id);

    const anotherGame = createNewGame(newGame.channelId);
    playerJoinGame(anotherGame.id, playerId);
  });
});
