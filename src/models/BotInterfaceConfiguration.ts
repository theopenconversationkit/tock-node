import { BotInterfaceFactory } from './BotInterfaceFactory';

export interface BotInterfaceConfiguration {
  connectorTypeId: string;
  botInterfaceFactory: BotInterfaceFactory;
}
