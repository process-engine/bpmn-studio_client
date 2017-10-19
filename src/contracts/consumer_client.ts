import {ILoginResult, IPagination, IProcessDefEntity, ITokenRepository, IUserTaskConfig, IUserTaskEntity, ProcessId, UserTaskId} from './index';

export interface IConsumerClient {
  config: any;
  initialize(): Promise<void>;
  login(username: string, password: string): Promise<ILoginResult>;
  logout(): Promise<boolean>;
  getProcessDefList(limit: number, offset: number): Promise<IPagination<IProcessDefEntity>>;
  startProcess(processtoStart: IProcessDefEntity): Promise<ProcessId>;
  getUserTaskList(): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig>;
  proceedUserTask(finishedTask: IUserTaskConfig): Promise<void>;
  cancelUserTask(taskToCancel: IUserTaskConfig): Promise<void>;
}
