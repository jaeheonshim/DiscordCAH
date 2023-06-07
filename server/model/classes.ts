import { v4 as uuidv4 } from 'uuid';
import { PromptCard, ResponseCard } from './cards';

export enum CAHGameStatus {
    PLAYER_JOIN,
    PENDING_ROUND_START,
    PLAYER_SUBMIT_CARD
}

export class CAHGame {
    id: string = uuidv4();
    channelId: string;
    players: Record<string, CAHPlayer> = {};
    deleted: boolean = false;
    status: CAHGameStatus = CAHGameStatus.PLAYER_JOIN;

    details = {
        serverName: "unknown",
        channelName: "unknown"
    }

    timing = {
        beginGameDelay: 10 * 1000,
        nextRoundDelay: 15 * 1000,
        roundDuration: 2 * 60 * 1000
    }

    cardHandCount: number = 7;

    deckId: string = "base_us";
    roundNumber: number = 0;
    promptCard: PromptCard;
    usedPromptCards: Set<string> = new Set<string>();
    winner: CAHPlayer;
    judge: CAHPlayer;
}

export class CAHPlayer {
    id: string;
    game: CAHGame;
    points: number = 0;
    ready: boolean;
    cards: ResponseCard[] = [];
    
    constructor(id: string) {
        this.id = id;
    }
}