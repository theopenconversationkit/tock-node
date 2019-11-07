import { URL } from 'url';
import { client as WebSocketClient, connection, IMessage } from 'websocket';
import {
  BotInterface,
  BotInterfaceFactory,
  BotMessage,
  BotRequest,
  UserRequest,
  BotResponse,
  Suggestion,
} from './models';
import { StoryHandler } from './models/StoryHandler';
import { UserDataDispatch } from './models/UserDataDispatch';
import { BotInterfaceConfiguration } from './models/BotInterfaceConfiguration';
import { PersistUser } from './models/PersistUser';
import { RetrieveUser } from './models/RetrieveUser';

export class Bot<TUserData extends {} = {}> {
  private connection?: connection;
  private queue: any[] = [];
  private queueTimer?: number;
  private botInterfaceFactories: { [connectorTypeId: string]: BotInterfaceFactory } = {};
  private persistUser: PersistUser<TUserData> | undefined;
  private retrieveUser: RetrieveUser<TUserData> | undefined;
  public userData: { [userId: string]: TUserData } = {};
  public userMessageBuffer: { [userId: string]: BotMessage[] } = {};
  public storyDefinitions: { [intent: string]: StoryHandler<TUserData>[] } = {};

  constructor(public apiKey: string, public host: string, public port: number = 443) {
    const client: WebSocketClient = new WebSocketClient();
    const url: URL = new URL(`/${apiKey}`, `wss://${host}:${port}`);

    client.on('connectFailed', (error: Error) => {
      console.log(`Connect failed: ${error.toString()}`);
    });

    client.on('connect', (connection: connection) => {
      console.log('Connection established');
      this.connection = connection;
      connection.on('error', (error: Error) => {
        console.log(`Connection error: ${error.toString()}`);
      });
      connection.on('close', () => {
        console.log('Connection closed. Reconnecting...');
        client.connect(url.toString());
      });
      connection.on('message', (message: IMessage) => {
        if (message.type === 'utf8' && message.utf8Data) {
          try {
            const request: BotRequest = JSON.parse(message.utf8Data);
            this.handleBotRequest(request);
          } catch (error) {
            // not a JSON response
            console.log(error.toString());
          }
        }
      });
    });

    client.connect(url.toString());
  }

  public addStory = (intent: string, ...handlers: StoryHandler<TUserData>[]) => {
    this.storyDefinitions[intent] = handlers;
  };

  public addInterface = (botInterfaceConfiguration: BotInterfaceConfiguration) => {
    this.botInterfaceFactories[botInterfaceConfiguration.connectorTypeId] =
      botInterfaceConfiguration.botInterfaceFactory;
  };

  public sendData = (data: string) => {
    if (this.connection && this.connection.connected) {
      this.connection.sendUTF(data);
    } else {
      this.queue.push(data);
      this.executeQueue();
    }
  };

  public setPersistUser = (persistUser: PersistUser<TUserData>) => {
    this.persistUser = persistUser;
  };

  public setRetrieveUser = (retrieveUser: RetrieveUser<TUserData>) => {
    this.retrieveUser = retrieveUser;
  };

  private createBotInterface = async (botRequest: BotRequest): Promise<BotInterface<TUserData>> => {
    const userData: TUserData = await this.getUserData(botRequest);
    const dispatchUserData: UserDataDispatch<TUserData> = await this.createUserDispatch(botRequest);
    return {
      send: (input: string | BotMessage, ...quickReplies: Suggestion[]) => {
        const userRequest: UserRequest = botRequest.botRequest;
        const connectorTypeId: string = userRequest.context.connectorType.id;
        const userId: string = userRequest.context.userId.id;
        if (this.botInterfaceFactories[connectorTypeId]) {
          const message: BotMessage | undefined = this.botInterfaceFactories[connectorTypeId](
            this,
            botRequest,
            dispatchUserData
          ).send(input, ...quickReplies);
          if (message) {
            this.userMessageBuffer[userId] = Array.isArray(this.userMessageBuffer[userId])
              ? [...this.userMessageBuffer[userId], message]
              : [message];
          }
          return message;
        }
        return undefined;
      },
      userData,
      dispatchUserData,
      runStory: async (intent: string) => {
        const userRequest = botRequest.botRequest;
        if (this.storyDefinitions[intent]) {
          for (let i = 0; i < this.storyDefinitions[intent].length; i++) {
            const botInterface: BotInterface<TUserData> = await this.createBotInterface(botRequest);
            await this.storyDefinitions[intent][i](botInterface, userRequest);
          }
        }
      },
    };
  };

  private executeQueue = () => {
    if (this.queue.length > 0 && !this.queueTimer) {
      this.queueTimer = setInterval(() => {
        const data = this.queue.shift();
        if (data) {
          if (this.connection && this.connection.connected) {
            this.connection.sendUTF(data);
          } else {
            this.queue.push(data);
          }
        } else {
          clearInterval(this.queueTimer);
          this.queueTimer = undefined;
        }
      });
    }
  };

  private getUserData = (botRequest: BotRequest): TUserData | Promise<TUserData> => {
    const userId: string = botRequest.botRequest.context.userId.id;
    if (this.retrieveUser) {
      return this.userData[userId] || this.retrieveUser(userId);
    }
    return this.userData[userId];
  };

  private createUserDispatch = (botRequest: BotRequest): UserDataDispatch<TUserData> => {
    const userId: string = botRequest.botRequest.context.userId.id;
    if (!this.userData[userId]) {
      this.userData[userId] = {} as TUserData;
    }
    return (input: ((prevUserData: TUserData) => TUserData) | TUserData): void | Promise<void> => {
      if (typeof input === 'function') {
        this.userData[userId] = (input as (prevUserData: TUserData) => TUserData)(
          this.userData[userId]
        );
      } else {
        this.userData[userId] = input;
      }
      if (this.persistUser) {
        return this.persistUser(userId, this.userData[userId]);
      }
    };
  };

  private handleBotRequest = async (request: BotRequest): Promise<void> => {
    try {
      const userRequest = request.botRequest;
      if (userRequest.intent && this.storyDefinitions[userRequest.intent]) {
        const userId = userRequest.context.userId.id;

        // execute handlers
        for (let i = 0; i < this.storyDefinitions[userRequest.intent].length; i++) {
          const botInterface: BotInterface<TUserData> = await this.createBotInterface(request);
          await this.storyDefinitions[userRequest.intent][i](botInterface, userRequest);
        }

        // if send has been used there should be data in the buffer
        if (
          Array.isArray(this.userMessageBuffer[userId]) &&
          this.userMessageBuffer[userId].length > 0
        ) {
          const response: BotResponse = {
            botResponse: {
              context: {
                date: new Date(),
                requestId: request.requestId,
              },
              entities: [],
              messages: this.userMessageBuffer[userId],
              storyId: userRequest.storyId,
            },
            requestId: request.requestId,
          };
          this.sendData(JSON.stringify(response));

          // clear buffer
          this.userMessageBuffer[userId] = [];
        }
      }
    } catch (error) {
      // not JSON or invalid request
      console.log('WebSocket message error', error.toString());
    }
  };
}
