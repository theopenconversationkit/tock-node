import { BotMessageCard } from './BotMessageCard';

export interface BotMessageCarousel {
  cards: BotMessageCard[];
  delay?: number;
  type: 'carousel';
}
