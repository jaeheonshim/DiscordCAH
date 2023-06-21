import { v4 as uuidv4 } from 'uuid';
import { PromptCard, ResponseCard } from './cards.js';

export enum CAHGameStatus {
    PLAYER_JOIN,
    PENDING_ROUND_START,
    PLAYER_SUBMIT_CARD,
    JUDGE_SELECT_CARD,
    ROUND_END
}

export class CAHGame {
    id: string = uuidv4();
    channelId: string;
    creatorId: string;
    players: Record<string, CAHPlayer> = {};
    deleted: boolean = false;
    status: CAHGameStatus = CAHGameStatus.PLAYER_JOIN;

    details = {
        serverName: "unknown",
        channelName: "unknown"
    }

    configuration = {
        nextRoundDelay: 35 * 1000,
        roundDuration: 2 * 60 * 1000,
        cardHandCount: 7,
        reboot: false
    }

    timing = {
        beginGameDelay: 10 * 1000,
        resultDisplayWait: 10 * 1000
    }

    deckId: string = "base_us";
    roundNumber: number = 0;
    promptCard: PromptCard;
    usedPromptCards: Set<string> = new Set<string>();
    winner: CAHPlayer;
    judge: CAHPlayer;
    submitted: {
        cards: ResponseCard[],
        player: CAHPlayer
    }[] = [];

    lastInteraction: number;
    recordInteraction = () => this.lastInteraction = Date.now();

    joinedPlayerIds: Set<string> = new Set(); // a record of all players that have ever joined this game
}

export class CAHPlayer {
    id: string;
    game: CAHGame;
    points: number = 0;
    ready: boolean;
    cards: ResponseCard[] = [];
    submitted: ResponseCard[] = [];
    
    constructor(id: string) {
        this.id = id;
    }
}