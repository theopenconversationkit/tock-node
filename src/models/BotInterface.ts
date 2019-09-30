import { BotMessage } from './tock';

export interface BotInterface {
  /**
   * Sends a simple text message
   */
  send(text: string): BotMessage | undefined;
  /**
   * Sends a message
   */
  send(message: BotMessage): BotMessage | undefined;
  send(input: string | BotMessage): BotMessage | undefined;
}
