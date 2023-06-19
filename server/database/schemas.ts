import { Schema, model } from "mongoose";
import { IUser } from "../model/user.js";

const userSchema = new Schema<IUser>({
    _id: String,
    statistics: {
        gamesCreated: {type: Number, default: 0}, // total games this user has created
        gamesJoined: {type: Number, default: 0}, // total games this user has joined
        gamesBegun: {type: Number, default: 0}, // total games THAT PLAYED AT LEAST 1 ROUND this user has been a part of
        totalSubmissions: {type: Number, default: 0}, // total cards this player has submitted
        totalPoints: {type: Number, default: 0}, // total rounds this player has won
    },
    isLegacy: {type: Boolean, default: false}
}, { timestamps: true });

export const User = model<IUser>("User", userSchema);