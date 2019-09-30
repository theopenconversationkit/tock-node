import { BotInterface } from './BotInterface';
import { UserRequest } from './tock';
import { UserDataDispatch } from './UserDataDispatch';

export type StoryHandler<TUserData> = (
  bot: BotInterface,
  request: UserRequest,
  userData: TUserData,
  userDispatch: UserDataDispatch<TUserData>
) => void | Promise<void>;
