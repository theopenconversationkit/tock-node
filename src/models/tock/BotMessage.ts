import { BotMessageCard } from './BotMessageCard';
import { BotMessageCarousel } from './BotMessageCarousel';
import { BotMessageCustom } from './BotMessageCustom';
import { BotMessageSentence } from './BotMessageSentence';

export type BotMessage =
  | BotMessageCard
  | BotMessageCarousel
  | BotMessageCustom
  | BotMessageSentence;
