export interface IUser {
    _id: string;
    isLegacy: boolean;
    statistics: {
        gamesCreated: number;
        gamesJoined: number;
        gamesBegun: number;
        totalSubmissions: number;
        totalPoints: number;
    };
}