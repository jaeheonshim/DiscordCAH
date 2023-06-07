import express from "express";
import { createNewGame, deleteGameByChannelId, deleteGameById, retrieveGameByChannelId, retrieveGameById } from "../manager/gameStorageManager";
import {
    playerInGame,
    playerJoinGame,
    playerLeaveGame,
    playerReady,
    retrievePlayerById,
} from "../manager/gamePlayerManager";
import { CAHError } from "../model/cahresponse";
import { cacheUsername, retrieveUsername } from "../manager/usernameManager";
import { getPlayerString, isPlayerCountInsufficient } from "../util";
import { beginGame, isReadyToBeginGame, newRound } from "../manager/gamePlayManager";
import { CAHGameStatus } from "../model/classes";

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
                            "To join this game, run `/join` inside this channel. Before joining, make sure you aren't in any other games.\n\nThe game will begin once all players are ready. **Once you're ready to begin, make sure to let the bot know by running `/begin`**!",
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

    if (isPlayerCountInsufficient(player.game)) {
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

gameRouter.post("/ready", function (req, res) {
    if (
        !req.body.channelId ||
        !req.body.userId ||
        !req.body.username
    )
        throw new Error("Missing required body param(s).");

    const userId = req.body.userId;
    const username = req.body.username;

    cacheUsername(userId, username);

    const readyResponse = playerReady(userId);

    const game = retrievePlayerById(userId).game;
    if (isReadyToBeginGame(game)) {
        const beginTime = beginGame(game);
        const botResponse = {
            response: [
                {
                    content: readyResponse.getMessage(),
                    embeds: [{
                        title: "All Players Ready!",
                        color: 0xFFFF00,
                        description: `The game will begin <t:${Math.round(beginTime / 1000)}:R>!`
                    }]
                }
            ],
            gameBeginTime: beginTime,
            gameId: game.id,
            channelId: game.channelId
        }
        res.json(botResponse);
    } else {
        res.json({
            response: [
                { content: readyResponse.getMessage() }
            ]
        });
    }
});

gameRouter.post("/newRound", function (req, res) {
    if (!req.body.gameId)
        throw new Error("Missing required body param(s).");

    const reqGame = retrieveGameById(req.body.gameId);
    console.log(reqGame);
    if(reqGame.status != CAHGameStatus.PENDING_ROUND_START) {
        throw new Error("Invalid game status for request");
    }

    const newRoundResponse = newRound(reqGame);

    const newRoundEmbed = {
        title: `Round #${reqGame.roundNumber}`,
        fields: [
            {
                name: "🧐 Judge",
                value: retrieveUsername(reqGame.judge.id)
            },
            {
                prompt: "❔ Prompt",
                value: `\`${reqGame.promptCard.text}\``
            }
        ]
    }
    
    res.json({
        channelMessage: { content: newRoundResponse.getMessage() }
    });
});