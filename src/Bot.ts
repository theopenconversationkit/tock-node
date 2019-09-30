import { URL } from 'url';
import { client as WebSocketClient, connection, IMessage } from 'websocket';
import {
  BotInterface,
  BotInterfaceFactory,
  BotMessage,
  BotRequest,
  UserRequest,
  BotResponse,
} from './models';
import { StoryHandler } from './models/StoryHandler';
import { UserDataDispatch } from './models/UserDataDispatch';
import { BotInterfaceConfiguration } from './models/BotInterfaceConfiguration';

export class Bot<TUserData extends {} = {}> {
  private connection?: connection;
  private queue: any[] = [];
  private queueTimer?: number;
  private botInterfaceFactories: { [connectorTypeId: string]: BotInterfaceFactory } = {};
  public userData: { [userId: string]: TUserData } = {};
  public userMessageBuffer: { [userId: string]: BotMessage[] } = {};
  public storyDefinitions: { [intent: string]: StoryHandler<TUserData> } = {};

  constructor(public apiKey: string, public host: string, public port: number) {
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

  public addStory = (
    intent: string,
    handler: (
      bot: BotInterface,
      request: UserRequest,
      userData: TUserData,
      userDataDispatch: UserDataDispatch<TUserData>
    ) => void
  ) => {
    this.storyDefinitions[intent] = handler;
  };

  public addInterface = (botInterfaceConfiguration: BotInterfaceConfiguration) =>
    (this.botInterfaceFactories[botInterfaceConfiguration.connectorTypeId] =
      botInterfaceConfiguration.botInterfaceFactory);

  public sendData = (data: string) => {
    if (this.connection && this.connection.connected) {
      this.connection.sendUTF(data);
    } else {
      this.queue.push(data);
      this.executeQueue();
    }
  };

  private createBotInterface = (botRequest: BotRequest): BotInterface => {
    return {
      send: (input: string | BotMessage) => {
        const userRequest: UserRequest = botRequest.botRequest;
        const connectorTypeId: string = userRequest.context.connectorType.id;
        const userId: string = userRequest.context.userId.id;
        if (this.botInterfaceFactories[connectorTypeId]) {
          const message: BotMessage | undefined = this.botInterfaceFactories[connectorTypeId](
            this,
            botRequest,
            this.createUserDispatch(botRequest)
          ).send(input);
          if (message) {
            this.userMessageBuffer[userId] = Array.isArray(this.userMessageBuffer[userId])
              ? [...this.userMessageBuffer[userId], message]
              : [message];
          }
          return message;
        }
        return undefined;
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

  private createUserDispatch = (botRequest: BotRequest): UserDataDispatch<TUserData> => {
    const userId: string = botRequest.botRequest.context.userId.id;
    if (!this.userData[userId]) {
      this.userData[userId] = {} as TUserData;
    }
    return (input: ((prevUserData: TUserData) => TUserData) | TUserData): void => {
      if (typeof input === 'function') {
        this.userData[userId] = (input as (prevUserData: TUserData) => TUserData)(
          this.userData[userId]
        );
      } else {
        this.userData[userId] = input;
      }
    };
  };

  private handleBotRequest = async (request: BotRequest): Promise<void> => {
    try {
      const userRequest = request.botRequest;
      if (userRequest.intent && this.storyDefinitions[userRequest.intent]) {
        const botInterface: BotInterface = this.createBotInterface(request);
        const userDispatch: UserDataDispatch<TUserData> = this.createUserDispatch(request);
        const userId = userRequest.context.userId.id;

        // execute handler
        const potentialPromise: Promise<void> | void = this.storyDefinitions[userRequest.intent](
          botInterface,
          userRequest,
          this.userData[userId],
          userDispatch
        );

        if (potentialPromise instanceof Promise) {
          await potentialPromise;
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
