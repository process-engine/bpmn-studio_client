import {InvocationContainer} from 'addict-ioc';
import {registerInContainer} from './ioc_module';

import {
  IAuthenticationService,
  IConsumerClient,
  ILoginResult,
  ILogoutResult,
  IMessage,
  IMessageBusService,
  IPagination,
  IProcessDefEntity,
  IProcessEngineService,
  ITokenRepository,
  IUserTaskConfig,
  IUserTaskEntity,
  ProcessId,
  UserTaskId,
} from './contracts/index';

export class ConsumerClient implements IConsumerClient {
  private container: InvocationContainer;
  private messageBusService: IMessageBusService;
  private authService: IAuthenticationService;
  private processEngineService: IProcessEngineService;

  public config: any = {};
  private loginToken: string;

  constructor() {
    this.container = this._initIocContainer();
  }

  private _initIocContainer(): InvocationContainer {
    const container: InvocationContainer = new InvocationContainer({
      defaults: {
        conventionCalls: ['initialize'],
      },
    });

    return container;
  }

  public async initialize(tokenRepository?: ITokenRepository): Promise<void> {
    registerInContainer(this.container, tokenRepository, this.config.baseRoute);

    this.authService = await this.container.resolveAsync<IAuthenticationService>('AuthenticationService', undefined, this.config.authService);
    this.processEngineService = await this.container.resolveAsync<IProcessEngineService>('ProcessEngineService', undefined, this.config.processEngineService);
  }

  public login(username: string, password: string): Promise<ILoginResult> {
    return this.authService.login(username, password);
  }

  public async logout(): Promise<boolean> {
    const logoutResult: ILogoutResult = await this.authService.logout();

    return logoutResult.result;
  }

  public getProcessDefList(limit: number = 100, offset: number = 0): Promise<IPagination<IProcessDefEntity>> {
    return this.processEngineService.getProcessDefList(limit, offset);
  }

  public startProcessById(processDefId: string): Promise<ProcessId> {
    return this.processEngineService.startProcessById(processDefId);
  }

  public startProcessByKey(processDefKey: string): Promise<ProcessId> {
    return this.processEngineService.startProcessByKey(processDefKey);
  }

  public getUserTaskList(): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineService.getUserTaskList();
  }

  public getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig> {
    return this.processEngineService.getUserTaskConfig(userTaskId);
  }

  public proceedUserTask(finishedTask: IUserTaskConfig): Promise<void> {
    return this.processEngineService.proceedUserTask(finishedTask);
  }

  public cancelUserTask(taskToCancel: IUserTaskConfig): Promise<void> {
    return this.processEngineService.cancelUserTask(taskToCancel);
  }
}
