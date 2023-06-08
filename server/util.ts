import { retrieveUsername } from "./manager/usernameManager";
import { CAHGame, CAHGameStatus, CAHPlayer } from "./model/classes";

function sortPlayers(p1: CAHPlayer, p2: CAHPlayer) {
    if(p2.points == p1.points) {
        const compare = retrieveUsername(p1.id).localeCompare(retrieveUsername(p2.id));
        return compare;
    } else {
        return p2.points - p1.points;
    }
}

export function getPlayerString(game: CAHGame) {
    return Object.values(game.players).sort(sortPlayers).reduce<string>((prev, player) => {
        const username = retrieveUsername(player.id);
        const points = player.points;
        let str = `\`${username}\` - ${points} points`;
        
        if(game.status == CAHGameStatus.PLAYER_JOIN) {
            if(player.ready) {
                str += " (**READY**)";
            } else {
                str += " (Not Ready)";
            }
        }

        return prev + str + "\n";
    }, "").trimEnd();
}

export function getPlayerRoundEmbed(game: CAHGame, playerId: string) {
    const player = game.players[playerId];
    const cardLines = [];

    for(let i = 0; i < player.cards.length; ++i) {
        if(player.submitted.includes(player.cards[i])) {
            cardLines.push(`${i+1}. ~~\`${player.cards[i].text}\`~~`);
        } else {
            cardLines.push(`${i+1}. \`${player.cards[i].text}\``);
        }
    }

    const embed = {
        title: `Your Cards For Round #${game.roundNumber}`,
        color: 0xFFFF00,
        description: `Below are your cards for this round. Don't show then to anyone else!\nTo choose a card, simply click the corresponding button below.`,
        fields: [
            {
                name: "Prompt",
                value: `\`${game.promptCard.text}\``
            },
            {
                name: "Your cards",
                value: cardLines.join("\n")
            },
            {
                name: "Status",
                value: `${player.submitted.length} out of ${game.promptCard.pickCount} cards submitted.`
            }
        ]
    }

    return embed;
}

export function isPlayerCountInsufficient(game: CAHGame): boolean { 
    return Object.values(game.players).length == 0;
}