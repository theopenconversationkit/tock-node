import { Bot } from '../Bot';
import { BotInterface } from './BotInterface';
import { BotRequest } from './tock';
import { UserDataDispatch } from './UserDataDispatch';

export type BotInterfaceFactory = <TUserData>(
  bot: Bot<TUserData>,
  botRequest: BotRequest,
  userDataDispatch: UserDataDispatch<TUserData>
) => Omit<BotInterface<TUserData>, 'userData' | 'dispatchUserData' | 'runStory'>;
