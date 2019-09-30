import { UserRequest } from './UserRequest';

export interface BotRequest {
  botRequest: UserRequest;
  requestId: string;
}
