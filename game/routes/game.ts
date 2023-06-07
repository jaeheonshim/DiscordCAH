import express from "express";
import { createNewGame } from "../manager/gameStorageManager";
import {
  playerJoinGame,
  retrievePlayerById,
} from "../manager/gamePlayerManager";
import { CAHError } from "../model/cahresponse";
import { cacheUsername } from "../manager/usernameManager";

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

  const player = retrievePlayerById(userId);
  if (player && player.game) throw new CAHError("You're already in a game!");

  const newGame = createNewGame(channelId);
  const joinResponse = playerJoinGame(newGame.id, userId);

  const botResponse = {
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
