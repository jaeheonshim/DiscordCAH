import express from "express";
import { getGameMap } from "../manager/gameStorageManager.js";
import { CAHGame, CAHGameStatus, CAHPlayer } from "../model/classes.js";
import { retrieveUsername } from "../manager/usernameManager.js";
import clone from "clone";

export const apiRouter = express.Router();

apiRouter.get("/games", function (req, res) {
    const gameMap = getGameMap();
    const gameSummaries = [];

    for(const game of gameMap.values()) {
        gameSummaries.push({
            id: game.id,
            channelId: game.channelId,
            details: game.details,
            playerCount: game.players.length,
            status: CAHGameStatus[game.status],
            roundNumber: game.roundNumber
        })
    }

    res.json(gameSummaries);
});

apiRouter.get("/game/:id", function (req, res) {
    const gameId = req.params.id;
    const game: any = clone(getGameMap().get(gameId));
    
    if(!game) {
        res.sendStatus(404);
        return;
    }

    for(const player of Object.values<CAHPlayer>(game.players)) {
        player["username"] = retrieveUsername(player.id);
        delete player["game"];
    }

    if(game.judge) {
        delete game.judge["game"];
    }

    game.status = CAHGameStatus[game.status];

    res.json(game);
});