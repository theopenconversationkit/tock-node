import { ConnectorType } from './ConnectorType';
import { UserInterfaceType } from './UserInterfaceType';
import { PlayerId } from './PlayerId';

export interface RequestContext {
  namespace: string;
  language: string;
  connectorType: ConnectorType;
  userInterface: UserInterfaceType;
  applicationId: string;
  userId: PlayerId;
  botId: PlayerId;
  user: string;
}
