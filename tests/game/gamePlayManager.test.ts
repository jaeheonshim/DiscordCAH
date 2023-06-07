import { playerJoinGame, playerLeaveGame, playerReady } from "../../server/manager/gamePlayerManager";
import { createNewGame } from "../../server/manager/gameStorageManager";
import { v4 as uuidv4 } from "uuid";
import { CAHGame } from "../../server/model/classes";
import { beginGame } from "../../server/manager/gamePlayManager";
import { CAHError } from "../../server/model/cahresponse";

describe("test game begin and round begin", () => {
    let game: CAHGame;
    let player1;
    let player2;
    
    beforeEach(() => {
        game = createNewGame(uuidv4());
        playerJoinGame(game.id, (player1 = uuidv4()));
        playerJoinGame(game.id, (player2 = uuidv4()));
    });

    test("game should not begin if not all players are ready", () => {
        playerReady(player1);

        expect(() => beginGame(game)).toThrow(CAHError);
    });

    test("game should not begin if there are less than two players", () => {
        playerLeaveGame(player1);
        playerReady(player2);

        expect(() => beginGame(game)).toThrow(CAHError);
    });

    test("game should begin if all preconditions met", () => {
        playerReady(player1);
        playerReady(player2);

        beginGame(game);
    });

    test("game should not begin if already begun", () => {
        playerReady(player1);
        playerReady(player2);

        beginGame(game);
        expect(() => beginGame(game)).toThrow(CAHError);
    })
});