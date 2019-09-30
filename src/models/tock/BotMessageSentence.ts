import { Suggestion } from './Suggestion';
import { I18nText } from './I18nText';

export interface BotMessageSentence {
  text: I18nText;
  suggestions: Suggestion[];
  delay?: number;
  type: 'sentence';
}
