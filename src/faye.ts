import {EventEmitter2} from 'eventemitter2';
import * as Faye from 'faye';
import {v4} from 'uuid-browser';
import {IAuthenticationService, IDataMessage, IMessage, IMessageBusService, ITokenRepository, MessageAction} from './contracts/index';

interface SubscriptionObject {
  fayeSubscription: any;
  callback: Function;
}

export class MessageBusService extends EventEmitter2 implements IMessageBusService {

  private tokenRepository: ITokenRepository;
  private fayeClient: any;
  private subscriptions: {[channel: string]: Array<SubscriptionObject>} = {};

  public config: any = {};

  constructor(tokenRepository: ITokenRepository) {
    super({
      wildcard: true,
      newListener: true,
    });
    this.tokenRepository = tokenRepository;
  }

  public updateConfig(config: any): void {
    if (this.fayeClient !== undefined && this.fayeClient !== null) {
      this.fayeClient.disconnect();
    }

    Object.assign(this.config, {
      routes: {
        messageBus: `${config.baseRoute}/mb`,
      },
    });

    this.fayeClient = new Faye.Client(this.config.routes.messageBus);
    this.moveOldSubscriptionsToNewFayeClient();
  }

  private initialize(): void {
    this.on('newListener', (channel: string, callback: Function) => {
      if (channel === 'newListener' || channel === 'removeListener') {
        return;
      }

      if (this.subscriptions[channel] === undefined) {
        this.subscriptions[channel] = [];
      }

      this.subscriptions[channel].push({
        fayeSubscription: null,
        callback: callback,
      });

      if (this.fayeClient !== undefined && this.fayeClient !== null) {
        const subscriptionObject: SubscriptionObject = this.subscriptions[channel][this.subscriptions[channel].length - 1];
        subscriptionObject.fayeSubscription = this.fayeClient.subscribe(channel).withChannel(callback);
      }

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

      this.subscriptions[channel][subscriptionIndex].fayeSubscription.cancel();
      this.subscriptions[channel].splice(subscriptionIndex, 1);
    });
  }

  private moveOldSubscriptionsToNewFayeClient(): void {
    const oldSubscriptions: {[channel: string]: Array<SubscriptionObject>} = Object.assign({}, this.subscriptions);
    this.subscriptions = {};

    for (const channel in oldSubscriptions) {
      if (this.subscriptions[channel] === undefined) {
          this.subscriptions[channel] = [];
      }

      for (const subscription of oldSubscriptions[channel]) {
        if (subscription.fayeSubscription !== null) {
          subscription.fayeSubscription.cancel();
        }

        const newSubscription: SubscriptionObject = this.fayeClient.subscribe(channel).withChannel(subscription.callback);
        this.subscriptions[channel].push({
          fayeSubscription: newSubscription,
          callback: subscription.callback,
        });
      }
    }
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
