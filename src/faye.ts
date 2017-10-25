import {EventEmitter2} from 'eventemitter2';
import * as Faye from 'faye';
import {v4} from 'uuid-browser';
import {IAuthenticationService, IDataMessage, IMessage, IMessageBusService, ITokenRepository, MessageAction} from './contracts/index';

interface SubscriptionObject {
  subscription: any;
  callback: Function;
}

export class MessageBusService extends EventEmitter2 implements IMessageBusService {

  private tokenRepository: ITokenRepository;
  private fayeClient: any;
  private subscriptions: {[channel: string]: Array<SubscriptionObject>} = {};

  public config: any = null;

  constructor(tokenRepository: ITokenRepository) {
    super({
      wildcard: true,
      newListener: true,
    });
    this.tokenRepository = tokenRepository;
  }

  public initialize(): void {
    this.fayeClient = new Faye.Client(this.config.routes.messageBus);

    this.on('newListener', (channel: string, callback: Function) => {
      if (channel === 'newListener' || channel === 'removeListener') {
        return;
      }

      if (this.subscriptions[channel] === undefined) {
        this.subscriptions[channel] = [];
      }

      const subscription: any = this.fayeClient.subscribe(channel).withChannel(callback);
      this.subscriptions[channel].push({
        subscription: subscription,
        callback: callback,
      });
    });

    this.on('removeListener', (channel: string, callback: Function) => {
      if (channel === 'newListener' || channel === 'removeListener') {
        return;
      }

      // if nobody ever subscribed to this channel, do nothing
      if (this.subscriptions[channel] === undefined) {
        return;
      }

      const subscriptionIndex: number = this.subscriptions[channel].findIndex((subscriptionObject: SubscriptionObject) => {
        return subscriptionObject.callback === callback;
      });

      // if the subscription couldn't be found, do nothing
      if (subscriptionIndex < 0) {
        return;
      }

      this.subscriptions[channel][subscriptionIndex].subscription.cancel();
      delete this.subscriptions[channel][subscriptionIndex];
    });
  }

  public createDataMessage(data: any, participantId?: string): IDataMessage {
    const message: IDataMessage = {
      data: data,
      metadata: {
        id: v4(),
        applicationId: undefined,
        token: undefined,
      },
    };

    const token: string = this.tokenRepository.getToken();
    if (token !== undefined && token !== null) {
      message.metadata.token = token;
    }

    if (participantId !== undefined && participantId !== null) {
      message.metadata.options = {
        participantId: participantId,
      };
    }

    return message;
  }

  public sendMessage(channel: string, message: any): Promise<any> {
    return this.fayeClient.publish(channel, message);
  }

  public messageIsDataMessage(message: any): message is IDataMessage {
    return message.data !== undefined;
  }
}
