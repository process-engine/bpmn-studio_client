import * as Faye from 'faye';
import {IAuthenticationService, IMessage, IMessageBusService} from './contracts/index';

export class MessageBusService implements IMessageBusService {

  private authenticationService: IAuthenticationService;
  private fayeClient: any;
  private messageHandlers: Array<(channel: string, message: any) => void> = new Array();

  public config: any = null;

  constructor(authenticationService: IAuthenticationService) {
    this.authenticationService = authenticationService;
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

  public createMessage(data: any, token: string): IMessage {
    const message: IMessage = {};
    if (this.authenticationService.hasToken()) {
      message.metadata = {
        token: this.authenticationService.getToken(),
      };
    }

    return message;
  }

  private isAllowedToHandle(channel: string): boolean {
    let roles: Array<string> = ['guest']; // default roles
    if (this.authenticationService.getIdentity()) {
      roles = this.authenticationService.getIdentity().roles;
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
