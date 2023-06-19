export interface IUser {
    _id: string;
    isLegacy: boolean;
    statistics: {
        [statisticId in UserStatistic]: number
    };
}

export enum UserStatistic {
    gamesCreated = "gamesCreated",
    gamesJoined = "gamesJoined",
    gamesBegun = "gamesBegun",
    totalSubmissions = "totalSubmissions",
    totalPoints = "totalPoints"
};