import { APIEmbed } from "discord.js";

export const mainHelpEmbed: APIEmbed = {
  title: `Cards Against Humanity Help`,
  description: `Welcome to the Cards Against Humanity Discord bot!\n\nThis bot can be a bit confusing at first, so use these help messages to find your way around. If you need any extra help, feel free to join our support server for more assistance (invite below).`,
  footer: {
    text: `If you ever find any issues with the bot or wish to request new features, contact the developer using the /contact command.`,
  },
};

export const creatingAGame: APIEmbed = {
  title: `Creating a game`,
  description: `Choose a channel to begin your game. We recommend you create a separate channel for the bot for best results.\n\nOnce you're inside the channel you want to play the game in, type \`/new\` to create a new game. The bot will send a message with a join and begin button.`,
  color: 0x9400D3,
};


export const joiningAGame: APIEmbed = {
    title: `Joining a game`,
    description: `To join a game, navigate to the channel in which the game is running (i.e. the channel where the \`/new\` command was run). Then, either press the join button on the embed or run the \`/join\` command to join the game.`,
    color: 0x0000FF,
};

export const startingTheGame: APIEmbed = {
    title: `Starting the game`,
    description: `In order to start the game, all players must declare that they are ready to begin. **All players must either press the \`✔️ Ready to Begin\` button or run \`/begin\`.** Once all players are ready, the game will automatically begin.\n\n*Note: Your game must have at least two players to begin.*`,
    color: 0x00FF00,
};

export const gameplay: APIEmbed = {
    title: `Playing the game`,
    description: `The Cards Against Humanity game consists of two stages: the submission stage and the judging stage.`,
    fields: [
        {
            name: "Submission Stage",
            value: "During this stage, players will submit their cards. In their direct messages, players will be sent the prompt for the round along with their cards. To submit cards, players can use the number buttons provided or use the `/submit` command. Note that some prompts may require more than one card to be submitted. The judge is not allowed to submit any cards during this stage."
        },
        {
            name: "Judging Stage",
            value: "Once all players have submitted their cards, or the round timer has run out, the judging stage will begin. In the judging stage, the judge will select the winning player submission. To select the winner, the judge must run the `/submit` command in their direct message channel. If you are the judge, type `/submit` followed by the number next to the submission you would like to choose."
        },
        {
            name: "Scoring",
            value: "If your submission is chosen by the judge, you will receive a point and become the judge for the next round."
        }
    ],
    color: 0xFFFF00,
};

export const endingTheGame: APIEmbed = {
    title: `Ending the game`,
    description: `The game will end when there are no longer enough players to continue the game. If you wish to stop playing, run \`/leave\` to leave your current game.\n\nAlternatively, any server moderator with \`Manage Server\` permissions can force a game to end using the \`/end\` command.`,
    color: 0xFF0000,
};