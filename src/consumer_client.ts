import {InvocationContainer} from 'addict-ioc';
import {registerInContainer} from './ioc_module';

import {
  IAuthenticationService,
  ILoginResult,
  ILogoutResult,
  IMessage,
  IMessageBusService,
  IPagination,
  IProcessDefEntity,
  ITokenRepository,
  IUserTaskEntity,
  ProcessId,
  UserTaskId,
} from './contracts/index';

export class ConsumerClient {
  private container: InvocationContainer;
  private messageBusService: IMessageBusService;
  private authService: IAuthenticationService;

  public config: any = {};
  private loginToken: string;

  constructor(tokenRepository?: ITokenRepository) {
    this.container = this._initIocContainer();
    registerInContainer(this.container, tokenRepository);
  }

  private _initIocContainer(): InvocationContainer {
    const container: InvocationContainer = new InvocationContainer({
      defaults: {
        conventionCalls: ['initialize'],
      },
    });

    return container;
  }

  public async initialize(): Promise<void> {
    this.config = {
      authService: {
        some: 'config123',
      },
    };

    this.authService = await this.container.resolveAsync<IAuthenticationService>('AuthenticationService', undefined, this.config.authService);
    this.messageBusService = await this.container.resolveAsync<IMessageBusService>('MessagebusService');
  }

  public login(username: string, password: string): Promise<ILoginResult> {
    return this._authService.login(username, password);
  }

  public async logout(): Promise<boolean> {
    const logoutResult: ILogoutResult = await this._authService.logout();

    return logoutResult.result;
  }

  public getProcessDefList(limit: number = 100, offset: number): Promise<IPagination<IProcessDefEntity>> {
    throw new Error('not implemented');
  }

  public startProcess(processtoStart: IProcessDefEntity): Promise<ProcessId> {
    throw new Error('not implemented');
  }

  public getUserTaskList(): Promise<IPagination<IUserTaskEntity>> {
    throw new Error('not implemented');
  }

  public getUserTask(userTaskId: UserTaskId): Promise<IUserTaskEntity> {
    throw new Error('not implemented');
  }

  public proceedUserTask(finishedTask: IUserTaskEntity, token?: string): Promise<void> {
    throw new Error('not implemented');
    /*

    const messageToken: any = {};
    if (widget.type === 'form') {
      for (const field of (widget as IFormWidget).fields) {
        messageToken[field.id] = field.value;
      }
    }

    if (widget.type === 'confirm') {
      if (action === 'abort') {
        messageToken.key = 'decline';
      } else {
        messageToken.key = 'confirm';
      }
    }

    const messageData: any = {
      action: 'proceed',
      token: messageToken,
    };

    const message: IMessage = this.messageBusService.createMessage(messageData, token);
    const messageToken: any = this.getMessageToken(widget, action);

    this.messageBusService.sendMessage(`/processengine/node/${widget.taskEntityId}`, message);
    */
  }

  public cancelUserTask(taskToCancel: IUserTaskEntity): Promise<void> {
    throw new Error('not implemented');
  }
/*
  private getMessageToken(widget: IWidget, action: string): any {
    const messageToken: any = {};
    if (widget.type === 'form') {
      for (const field of (widget as IFormWidget).fields) {
        messageToken[field.id] = field.value;
      }
    }

    if (widget.type === 'confirm') {
      if (action === 'abort') {
        messageToken.key = 'decline';
      } else {
        messageToken.key = 'confirm';
      }
    }

    // TODO: handle other widget types
    return messageToken;
  }
  */

}
