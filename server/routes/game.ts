import express from "express";
import { createNewGame, deleteGameByChannelId, deleteGameById, retrieveGameByChannelId } from "../manager/gameStorageManager";
import {
    playerInGame,
    playerJoinGame,
    playerLeaveGame,
    retrievePlayerById,
} from "../manager/gamePlayerManager";
import { CAHError } from "../model/cahresponse";
import { cacheUsername } from "../manager/usernameManager";
import { getPlayerString, isPlayerCountInsufficient } from "../util";

export const gameRouter = express.Router();

gameRouter.post("/new", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.displayAvatarURL ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    if (playerInGame(userId)) throw new CAHError("You're already in a game!");

    const newGame = createNewGame(channelId);
    const joinResponse = playerJoinGame(newGame.id, userId);

    if (req.body.channelName) newGame.details.channelName = req.body.channelName;
    if (req.body.serverName) newGame.details.serverName = req.body.serverName;

    const botResponse = {
        gameId: newGame.id,
        response: [
            {
                embeds: [
                    {
                        color: 0x00ff00,
                        title: `\`${username}\` has created a new game!`,
                        thumbnail: {
                            url: req.body.displayAvatarURL,
                        },
                        description:
                            "To join this game, run `/join` inside this channel. Before joining, make sure you aren't in any other games.\n\nThe game will begin once all players are ready. **Once you're ready to begin, make sure to let the bot know by running `/start`**!",
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
            { content: joinResponse.getMessage(), ephemeral: true },
        ],
    };

    res.json(botResponse);
});

gameRouter.post("/info", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const game = retrieveGameByChannelId(channelId);

    const botResponse = {
        response: [
            {
                embeds: [
                    {
                        color: 0x0096FF,
                        title: `Game Information`,
                        fields: [
                            {
                                name: "Server",
                                value: `\`${game.details.serverName}\``
                            },
                            {
                                name: "Channel",
                                value: `<#${game.channelId}>`
                            },
                            {
                                name: "Players",
                                value: getPlayerString(game)
                            }
                        ],
                        timestamp: new Date().toISOString(),
                    },
                ],
            }
        ],
    };

    res.json(botResponse);
});

gameRouter.post("/end", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const deleteResponse = deleteGameByChannelId(channelId);

    const botResponse = {
        response: [
            {
                content: deleteResponse.getMessage(), embeds: [
                    {
                        title: "Game Ended",
                        description: "The game in this channel has been ended by a server administrator."
                    }
                ]
            }
        ]
    }

    res.json(botResponse);
});

gameRouter.post("/join", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const joinResponse = playerJoinGame(retrieveGameByChannelId(channelId).id, userId);
    
    res.json({
        response: [
            { content: joinResponse.getMessage(), ephemeral: true }
        ]
    });
});

gameRouter.post("/leave", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const channelId = req.body.channelId;
    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const player = retrievePlayerById(userId);
    const leaveResponse = playerLeaveGame(userId);

    const botResponse: any = {
        response: [
            {
                content: leaveResponse.getMessage()
            }
        ]
    }

    if(isPlayerCountInsufficient(player.game)) {
        deleteGameById(player.game.id);
        botResponse.channelMessage = {
            channelId: player.game.channelId,
            message: {
                embeds: [{
                    title: "Game Ended",
                    description: "The game in this channel has been ended because there aren't enough players."
                }]
            }
        }
    }

    res.json(botResponse);
});