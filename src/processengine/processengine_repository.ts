import * as fetch_ponyfill from 'fetch-ponyfill';

import {Request, RequestInit, Response} from 'node-fetch';

import {IPublicQueryOptions, ISortOptions, SortOrder} from '@essential-projects/core_contracts';
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
  ProcessInstanceId,
} from '../contracts/index';
import {HttpHeader, isErrorResult, throwOnErrorResponse} from '../http';

const fetch: (url: string | Request, init?: RequestInit) => Promise<Response> = fetch_ponyfill().fetch;

export class ProcessEngineRepository implements IProcessEngineRepository {

  public config: any = null;
  private tokenRepository: ITokenRepository;
  private messageBusService: IMessageBusService;

  constructor(tokenRepository: ITokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  private getPaginationSelector(limit?: number, offset?: number): string {
    if (limit === undefined || limit === null) {
      return 'limit="ALL"';
    }

    return `limit=${limit}&offset=${offset}`;
  }

  private getOrderByQuery(sortAttribute: string, sortingOrder: SortOrder): ISortOptions {
    if (sortAttribute === undefined || sortAttribute === null) {
      const standardQuery: ISortOptions = {
        attributes: [
          {
            attribute: 'name',
            order: 'asc',
          },
        ],
      };

      return standardQuery;
    }

    const query: ISortOptions = {
      attributes: [
        {
          attribute: sortAttribute,
          order: sortingOrder,
        },
      ],
    };

    return query;
  }

  public async getProcessDefList(limit?: number, offset?: number,
                                 sortAttribute?: string, sortingOrder?: SortOrder): Promise<IPagination<IProcessDefEntity>> {
    const selector: string = this.getPaginationSelector(limit, offset);
    const orderByQuery: ISortOptions = this.getOrderByQuery(sortAttribute, sortingOrder);
    const url: string = `${this.config.routes.processes}?${selector}&orderBy=${JSON.stringify(orderByQuery)}`;

    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IPagination<IProcessDefEntity>>(response);
  }

  public async startProcessById(processDefId: string, participantId?: string): Promise<ProcessInstanceId> {
    const url: string = this.config.routes.startProcess;
    const response: Response = await fetch(url, {
      method: 'post',
      headers: this.getFetchHeader({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        msg: {
          participant: participantId,
          id: processDefId,
        },
      }),
    });

    return throwOnErrorResponse<ProcessInstanceId>(response);
  }

  public async startProcessByKey(processDefKey: string, participantId?: string): Promise<ProcessInstanceId> {
    const url: string = this.config.routes.startProcess;
    const response: Response = await fetch(url, {
      method: 'post',
      headers: this.getFetchHeader({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        msg: {
          participant: participantId,
          key: processDefKey,
        },
      }),
    });

    return throwOnErrorResponse<ProcessInstanceId>(response);
  }

  public async getUserTaskList(limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>> {
    const selector: string = this.getPaginationSelector(limit, offset);
    const url: string = `${this.config.routes.userTaskList}?expandCollection=["process.processDef", "nodeDef"]&${selector}`;
    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IPagination<IUserTaskEntity>>(response);
  }

  public async getUserTaskListByProcessDefId(processDefId: string, limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>> {
    const query: IQueryClause = {
      attribute: 'process.processDef.id',
      operator: '=',
      value: processDefId,
    };
    const selector: string = this.getPaginationSelector(limit, offset);
    const parameters: string = `expandCollection=["process.processDef", "nodeDef"]`;
    const url: string = `${this.config.routes.userTaskList}?${parameters}&query=${JSON.stringify(query)}&${selector}`;
    const response: Response = await fetch(url, {
      method: 'get',
      headers: this.getFetchHeader(),
    });

    return throwOnErrorResponse<IPagination<IUserTaskEntity>>(response);
  }

  public async getUserTaskListByProcessInstanceId(processInstanceId: string, limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>> {
    const query: IQueryClause = {
      attribute: 'process.id',
      operator: '=',
      value: processInstanceId,
    };
    const selector: string = this.getPaginationSelector(limit, offset);
    const parameters: string = `expandCollection=["process.processDef", "nodeDef"]&${selector}`;
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
