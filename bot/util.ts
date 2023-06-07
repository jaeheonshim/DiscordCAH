import { User } from "discord.js";
import { CAHError } from "../game/model/cahresponse";

export async function checkCanSendDM(user: User, message: string) {
  try {
    await user.send(message);
    return true;
  } catch (error) {
    throw new CAHError(
      "Couldn't send direct messages to this user - make sure you've allowed server members to send you direct messages!"
    );
  }
}
