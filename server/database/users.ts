import { User } from "../database/schemas.js";
import { IUser, UserStatistic } from "../model/user.js";

const findOneOptions = { upsert: true, new: true, setDefaultsOnInsert: true };

export async function incrementUserStatistic(userId: string, statisticId: UserStatistic) {
    await User.findOneAndUpdate({_id: userId}, {$inc: {[`statistics.${statisticId}`]: 1}}, findOneOptions);
}

export async function retrieveUser(userId: string): Promise<IUser> {
    return await User.findOneAndUpdate({_id: userId}, {}, findOneOptions);
}