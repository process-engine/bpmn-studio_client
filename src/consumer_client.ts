import {SortOrder} from '@essential-projects/core_contracts';
import {InvocationContainer} from 'addict-ioc';
import {EventEmitter2} from 'eventemitter2';
import {
  IAuthenticationService,
  IConsumerClient,
  ILoginResult,
  ILogoutResult,
  IMessage,
  IPagination,
  IProcessDefEntity,
  IProcessEngineService,
  ITokenRepository,
  IUserTaskConfig,
  IUserTaskEntity,
  ProcessInstanceId,
  UserTaskId,
  UserTaskProceedAction,
} from './contracts/index';
import {registerInContainer} from './ioc_module';

export class ConsumerClient extends EventEmitter2 implements IConsumerClient {
  private container: InvocationContainer;
  private authService: IAuthenticationService;
  private processEngineService: IProcessEngineService;

  public config: any = {};

  constructor() {
    super({wildcard: true});
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

    this.authService = await this.container.resolveAsync<IAuthenticationService>('AuthenticationService');
    this.processEngineService = await this.container.resolveAsync<IProcessEngineService>('ProcessEngineService');

    const eventHandler: Function = (eventName: string, ...parameter: Array<any>): void => {
      this.emit(eventName, ...parameter);
    };
    this.processEngineService.on('*', function(...parameter: Array<any>): void {
      eventHandler(this.event, ...parameter);
    });
  }

  public login(username: string, password: string): Promise<ILoginResult> {
    return this.authService.login(username, password);
  }

  public async logout(): Promise<boolean> {
    const logoutResult: ILogoutResult = await this.authService.logout();

    return logoutResult.result;
  }

  public getProcessDefList(limit?: number, offset?: number,
                           sortAttribute?: string, sortingOrder?: SortOrder): Promise<IPagination<IProcessDefEntity>> {
    return this.processEngineService.getProcessDefList(limit, offset, sortAttribute, sortingOrder);
  }

  public startProcessById(processDefId: string): Promise<ProcessInstanceId> {
    return this.processEngineService.startProcessById(processDefId);
  }

  public startProcessByKey(processDefKey: string): Promise<ProcessInstanceId> {
    return this.processEngineService.startProcessByKey(processDefKey);
  }

  public getUserTaskList(limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineService.getUserTaskList(limit, offset);
  }

  public getUserTaskListByProcessDefId(processDefId: string, limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineService.getUserTaskListByProcessDefId(processDefId, limit, offset);
  }

  public getUserTaskListByProcessInstanceId(processInstanceId: string, limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>> {
    return this.processEngineService.getUserTaskListByProcessInstanceId(processInstanceId, limit, offset);
  }

  public getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig> {
    return this.processEngineService.getUserTaskConfig(userTaskId);
  }

  public proceedUserTask(finishedTask: IUserTaskConfig, proceedAction?: UserTaskProceedAction): Promise<void> {
    return this.processEngineService.proceedUserTask(finishedTask, proceedAction);
  }

  public cancelUserTask(userTaskToCancel: IUserTaskConfig): Promise<void> {
    return this.processEngineService.cancelUserTask(userTaskToCancel);
  }
}
