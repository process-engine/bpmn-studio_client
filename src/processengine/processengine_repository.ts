import * as fetch_ponyfill from 'fetch-ponyfill';

import {
  IDataMessage,
  IMessageBusService,
  IPagination,
  IProcessDefEntity,
  IProcessEngineRepository,
  IQueryClause,
  ITokenRepository,
  IUserTaskEntity,
  IUserTaskMessageData,
  ProcessId,
} from '../contracts/index';
import {HttpHeader, isErrorResult, throwOnErrorResponse} from '../http';

const {fetch, Headers, Request, Response} = fetch_ponyfill();

export class ProcessEngineRepository implements IProcessEngineRepository {
  public config: any = null;
  private tokenRepository: ITokenRepository;
  private messageBusService: IMessageBusService;

  constructor(tokenRepository: ITokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  public async getProcessDefList(limit: number = 100, offset: number = 0): Promise<IPagination<IProcessDefEntity>> {
    const url: string = `${this.config.routes.processes}?limit=${limit}&offset=${offset}`;
    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IPagination<IProcessDefEntity>>(response);
  }

  public async startProcessById(processDefId: string): Promise<ProcessId> {
    const url: string = this.config.routes.startProcess;
    const response: Response = await fetch(url, {
      method: 'post',
      headers: this.getFetchHeader({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        msg: {
          id: processDefId,
        },
      }),
    });

    return throwOnErrorResponse<ProcessId>(response);
  }

  public async startProcessByKey(processDefKey: string): Promise<ProcessId> {
    const url: string = this.config.routes.startProcess;
    const response: Response = await fetch(url, {
      method: 'post',
      headers: this.getFetchHeader({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        msg: {
          key: processDefKey,
        },
      }),
    });

    return throwOnErrorResponse<ProcessId>(response);
  }

  public async getUserTaskList(): Promise<IPagination<IUserTaskEntity>> {
    const url: string = `${this.config.routes.userTaskList}?expandCollection=["process.processDef", "nodeDef"]&limit="ALL"`;
    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IPagination<IUserTaskEntity>>(response);
  }

  public async getUserTaskListByProcessDefId(processDefId: string): Promise<IPagination<IUserTaskEntity>> {
    const query: IQueryClause = {
      attribute: 'process.processDef.id',
      operator: '=',
      value: processDefId,
    };
    const parameters: string = `expandCollection=["process.processDef", "nodeDef"]&limit="ALL"`;
    const url: string = `${this.config.routes.userTaskList}?${parameters}&query=${JSON.stringify(query)}`;
    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IPagination<IUserTaskEntity>>(response);
  }

  public async getUserTaskListByProcessInstanceId(processInstanceId: string): Promise<IPagination<IUserTaskEntity>> {
    const query: IQueryClause = {
      attribute: 'process.id',
      operator: '=',
      value: processInstanceId,
    };
    const parameters: string = `expandCollection=["process.processDef", "nodeDef"]&limit="ALL"`;
    const url: string = `${this.config.routes.userTaskList}?${parameters}&query=${JSON.stringify(query)}`;
    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IPagination<IUserTaskEntity>>(response);
  }

  public async getUserTaskData(userTaskId: string): Promise<IUserTaskMessageData> {
    const url: string = `${this.config.routes.userTaskData}/${userTaskId}`;
    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IUserTaskMessageData>(response);
  }

  private getFetchHeader(header: HttpHeader = {}): HttpHeader {
    const token: string = this.tokenRepository.getToken();
    if (token !== undefined && token !== null) {
      header.Authorization = `Bearer ${token}`;
    }

    return header;
  }
}
