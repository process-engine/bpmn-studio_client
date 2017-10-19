import * as fetch_ponyfill from 'fetch-ponyfill';

import {
  IPagination,
  IProcessDefEntity,
  IProcessEngineRepository,
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

  constructor(tokenRepository: ITokenRepository) {
    console.log(tokenRepository);
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

  public async startProcess(processtoStart: IProcessDefEntity): Promise<ProcessId> {
    const url: string = this.config.routes.startProcess;
    const response: Response = await fetch(url, {
      method: 'post',
      headers: this.getFetchHeader({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        msg: {
          key: processtoStart.key,
        },
      }),
    });

    return throwOnErrorResponse<ProcessId>(response);
  }

  public async getUserTaskList(): Promise<IPagination<IUserTaskEntity>> {
    const url: string = `${this.config.routes.userTaskData}?expandCollection=["process.processDef", "nodeDef"]&limit="ALL"`;
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
