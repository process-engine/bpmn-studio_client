import {ILoginResult,
  IPagination,
  IProcessDefEntity,
  ITokenRepository,
  IUserTaskConfig,
  IUserTaskEntity,
  ProcessInstanceId,
  UserTaskId,
  UserTaskProceedAction} from './index';

export interface IConsumerClient {
  config: any;
  initialize(tokenRepository?: ITokenRepository): Promise<void>;
  login(username: string, password: string): Promise<ILoginResult>;
  logout(): Promise<boolean>;
  getProcessDefList(limit: number, offset: number): Promise<IPagination<IProcessDefEntity>>;
  startProcessById(processDefId: string): Promise<ProcessInstanceId>;
  startProcessByKey(processDefKey: string): Promise<ProcessInstanceId>;
  getUserTaskList(): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskListByProcessDefId(processDefId: string): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskListByProcessInstanceId(processInstanceId: string): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig>;
  proceedUserTask(finishedTask: IUserTaskConfig, proceedAction?: UserTaskProceedAction): Promise<void>;
  cancelUserTask(userTaskToCancel: IUserTaskConfig): Promise<void>;
}
