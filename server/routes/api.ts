import express from "express";
import { getGameMap } from "../manager/gameStorageManager.js";
import { CAHGame } from "../model/classes.js";

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
            status: game.status,
            roundNumber: game.roundNumber
        })
    }

    res.json(gameSummaries);
});