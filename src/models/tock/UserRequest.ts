import { Entity } from './Entity';
import { RequestContext } from './RequestContext';
import { UserMessage } from './UserMessage';

export interface UserRequest {
  intent?: string;
  entities: Entity[];
  message: UserMessage;
  storyId: string;
  step?: string;
  context: RequestContext;
}
