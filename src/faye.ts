import * as Faye from 'faye';
import {IAuthenticationService, IDataMessage, IMessageBusService, ITokenRepository, MessageAction} from './contracts/index';

export class MessageBusService implements IMessageBusService {

  private tokenRepository: ITokenRepository;
  private fayeClient: any;
  private messageHandlers: Array<(channel: string, message: any) => void> = new Array();

  public config: any = null;

  constructor(tokenRepository: ITokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  public initialize(): void {
    this.fayeClient = new Faye.Client(this.config.routes.messageBus);
    this.fayeClient.subscribe('/**').withChannel((channel: string, message: any) => {
      this.handleIncommingMessage(channel, message);
    });
  }

  private handleIncommingMessage(channel: string, message: any): void {
    const isAllowedToHandle: boolean = this.isAllowedToHandle(channel);
    if (!isAllowedToHandle) {
      return;
    }

    for (const handler of this.messageHandlers) {
      handler(channel, message);
    }
  }

  public createDataMessage(data: any): IDataMessage {
    const message: IDataMessage = {
      data: data,
    };

    const token: string = this.tokenRepository.getToken();
    if (token !== undefined && token !== null) {
      message.metadata = {
        token: token,
      };
    }

    return message;
  }

  private isAllowedToHandle(channel: string): boolean {
    let roles: Array<string> = ['guest']; // default roles
    if (this.tokenRepository.getIdentity()) {
      roles = this.tokenRepository.getIdentity().roles;
    }

    const rolePrefix: string = '/role/';
    if (!channel.startsWith(rolePrefix)) {
      return false;
    }

    const handledRole: string = channel.substr(rolePrefix.length);

    return roles.includes(handledRole);
  }

  public sendMessage(channel: string, message: any): Promise<any> {
    return this.fayeClient.publish(channel, message);
  }

  public registerMessageHandler(handler: (channel: string, message: any) => void): void {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(handler: (channel: string, message: any) => void): void {
    const index: number = this.messageHandlers.indexOf(handler);
    if (index >= 0) {
      this.messageHandlers.slice(index, 1);
    }
  }
}
