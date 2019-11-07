import { BotInterface } from './BotInterface';
import { UserRequest } from './tock';

export type StoryHandler<TUserData> = (
  bot: BotInterface<TUserData>,
  request: UserRequest
) => void | Promise<void>;
