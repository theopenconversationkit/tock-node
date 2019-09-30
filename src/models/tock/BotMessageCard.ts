import { I18nText } from './I18nText';
import { Attachment } from './Attachment';
import { Action } from './Action';

export interface BotMessageCard {
  title?: I18nText;
  subTitle?: I18nText;
  attachment?: Attachment;
  actions: Action[];
  delay?: number;
  type: 'card';
}
