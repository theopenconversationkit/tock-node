import { BotInterface, BotMessage, BotMessageSentence } from './models';
import { BotInterfaceConfiguration } from './models/BotInterfaceConfiguration';
import { i18nText } from './utils';

export function WebBotInterface(): BotInterfaceConfiguration {
  return {
    connectorTypeId: 'web',
    botInterfaceFactory: (): BotInterface => ({
      send: (input: string | BotMessage): BotMessage => {
        let message: BotMessage;
        if (typeof input === 'string') {
          message = {
            delay: 0,
            suggestions: [],
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
