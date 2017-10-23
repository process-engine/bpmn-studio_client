import {EventEmitter2} from 'eventemitter2';
import * as Faye from 'faye';
import {IAuthenticationService, IDataMessage, IMessage, IMessageBusService, ITokenRepository, MessageAction} from './contracts/index';

export class MessageBusService extends EventEmitter2 implements IMessageBusService {

  private tokenRepository: ITokenRepository;
  private fayeClient: any;
  private messageHandlers: Array<(channel: string, message: any) => void> = new Array();

  public config: any = null;

  constructor(tokenRepository: ITokenRepository) {
    super({wildcard: true});
    this.tokenRepository = tokenRepository;
  }

  public initialize(): void {
    this.fayeClient = new Faye.Client(this.config.routes.messageBus);

    this.fayeClient.subscribe('/**').withChannel((channel: string, message: any) => {
      this.emit(channel, message);
    });
  }

  public createDataMessage(data: any, participantId?: string): IDataMessage {
    const message: IDataMessage = {
      data: data,
      metadata: {
        id: undefined,
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
