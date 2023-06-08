import { retrieveUsername } from "./manager/usernameManager";
import { CAHGame, CAHGameStatus, CAHPlayer } from "./model/classes";
import jokes from "./jokes.json";
import facts from "./funfacts.json";

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

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

export function randomJoke(): string {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return `Q: \`${joke.setup}\`\nA: \`${joke.punchline}\``;
}

export function randomFunFact(): string {
    const fact = facts.facts[Math.floor(Math.random() * facts.facts.length)];
    return `\`${fact}\``;
}

export function getJudgeModal(game: CAHGame) {
    const submitted = [];
    for(const player of Object.values(game.players)) {
        if(player.submitted.length === game.promptCard.pickCount) {
            submitted.push({
                cards: player.submitted,
                player: player.id
            });
        }
    }

    shuffle(submitted);

    const submittedCardsList = [];
    for(let i = 0; i < submitted.length; ++i) {
        const cards = submitted[i].cards.reduce((prev, card) => prev + `\`${card.text}\`, `, "");
        submittedCardsList.push(`${i+1}. ${cards.substring(0, cards.length - 2)}`);
    }

    return {
        title: "It's your turn to select the winning cards",
        description: "Select the card(s) you think are the best for this round. The prompt for this round is displayed below.",
        fields: [
            {
                name: "Prompt",
                value: `\`${game.promptCard.text}\``
            },
            {
                name: "Submitted Cards",
                value: submittedCardsList.join("\n")
            }
        ]
    }
}