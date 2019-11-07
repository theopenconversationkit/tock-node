import { BotMessage, Suggestion } from './tock';
import { UserDataDispatch } from './UserDataDispatch';

export interface BotInterface<TUserData extends {} = {}> {
  /**
   * Sends a simple text message
   */
  send(text: string, ...quickReplies: Suggestion[]): BotMessage | undefined;
  /**
   * Sends a message
   */
  send(message: BotMessage): BotMessage | undefined;
  send(input: string | BotMessage, ...quickReplies: Suggestion[]): BotMessage | undefined;

  userData: TUserData;
  dispatchUserData: UserDataDispatch<TUserData>;
  runStory(intent: string): Promise<void>;
}
