import { User } from "../database/schemas.js";
import { UserStatistic } from "../model/user.js";

const findOneOptions = { upsert: true, new: true, setDefaultsOnInsert: true };

async function incrementStatistic(userId: string, statisticId: UserStatistic) {
    await User.findOneAndUpdate({_id: userId}, {$inc: {[`statistics.${statisticId}`]: 1}}, findOneOptions);
}