import { BotInterface, BotMessage, BotMessageSentence, Suggestion } from './models';
import { BotInterfaceConfiguration } from './models/BotInterfaceConfiguration';
import { i18nText } from './utils';

export function WebBotInterface(): BotInterfaceConfiguration {
  return {
    connectorTypeId: 'web',
    botInterfaceFactory: (): Omit<BotInterface, 'userData' | 'dispatchUserData' | 'runStory'> => ({
      send: (input: string | BotMessage, ...quickReplies: Suggestion[]): BotMessage => {
        let message: BotMessage;
        if (typeof input === 'string') {
          message = {
            delay: 0,
            suggestions: quickReplies,
            text: i18nText(input),
            type: 'sentence',
          } as BotMessageSentence;
        } else {
          message = input;
        }
        return message;
      },
    }),
  };
}
