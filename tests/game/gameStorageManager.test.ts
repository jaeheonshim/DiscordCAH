import { v4 as uuidv4 } from "uuid";
import { createNewGame, deleteGameByChannelId, deleteGameById, retrieveGameByChannelId, retrieveGameById } from "../../game/gameStorageManager";
import { CAHError } from "../../game/cahresponse";

describe("testing game creation", () => {
    test("created games should be accessible", () => {
        const channelId = uuidv4();

        const newGame = createNewGame(channelId);
        const createdGame = retrieveGameById(newGame.id);
        expect(createdGame).toBeDefined();
        expect(createdGame.channelId).toBe(channelId);
    });

    test("created games should be accessible through channel id", () => {
        const channelId = uuidv4();

        const newGame = createNewGame(channelId);
        const createdGame = retrieveGameByChannelId(channelId);
        expect(createdGame).toBeDefined();
        expect(createdGame.id).toBe(newGame.id);
    });

    test("trying to access nonexistent games should throw an error", () => {
        expect(() => retrieveGameById(uuidv4())).toThrow(CAHError);
        expect(() => retrieveGameByChannelId(uuidv4())).toThrow(CAHError);
    });

    test("trying to create a game in a channel where a game is already running should throw an error", () => {
        const channelId = uuidv4();
        createNewGame(channelId);

        expect(() => createNewGame(channelId)).toThrow(CAHError);
    });
});

describe("testing game deletion", () => {
    test("deleted games should no longer be accessible", () => {
        const channelId = uuidv4();
        const newGame = createNewGame(channelId); 

        deleteGameById(newGame.id);

        expect(() => retrieveGameById(newGame.id)).toThrow(CAHError);
        expect(() => retrieveGameByChannelId(channelId)).toThrow(CAHError);
    });

    test("games should be able to be deleted by channel id", () => {
        const channelId = uuidv4();
        const newGame = createNewGame(channelId); 

        deleteGameByChannelId(channelId);

        expect(() => retrieveGameById(newGame.id)).toThrow(CAHError);
        expect(() => retrieveGameByChannelId(channelId)).toThrow(CAHError);
    });

    test("a new game should be able to be created in a channel once the previous game is deleted", () => {
        const channelId = uuidv4();
        const newGame = createNewGame(channelId); 

        // while the original game exists, creating a new one in the same channel should throw error
        expect(() => createNewGame(channelId)).toThrow(CAHError);
        
        // delete game in channel
        deleteGameByChannelId(channelId);

        const anotherGame = createNewGame(channelId);
        expect(anotherGame.channelId).toEqual(channelId); 
    });
});