import { CAHError } from "../../game/cahresponse";
import { CAHGame } from "../../game/classes";
import { playerJoinGame, playerLeaveGame, retrievePlayerById } from "../../game/gamePlayerManager";
import { createNewGame, retrieveGameById } from "../../game/gameStorageManager";
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

    test("attempting to retrieve invalid player should throw error", () => {
        expect(() => retrievePlayerById(uuidv4())).toThrow(CAHError);
    })

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
        expect(() => retrievePlayerById(playerId)).toThrow(CAHError);
    });
})