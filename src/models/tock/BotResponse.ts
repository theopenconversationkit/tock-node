import { Entity } from './Entity';
import { BotMessage } from './BotMessage';
import { ResponseContext } from './ResponseContext';

export interface BotResponse {
  botResponse: {
    messages: BotMessage[];
    storyId: string;
    step?: string;
    entities: Entity[];
    context: ResponseContext;
  };
  requestId: string;
}
