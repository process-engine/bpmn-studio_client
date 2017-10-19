import * as fetch_ponyfill from 'fetch-ponyfill';

import {IProcessEngineRepository, IUserTaskMessageData} from '../contracts/index';
import {isErrorResult, throwOnErrorResponse} from '../http';

const {fetch, Headers, Request, Response} = fetch_ponyfill();

export class ProcessEngineRepository implements IProcessEngineRepository {
  public config: any = null;

  public async getUserTaskData(userTaskId: string): Promise<IUserTaskMessageData> {
    const url: string = `${this.config.routes.processengine}/user_task_data/${userTaskId}`;
    const response: Response = await fetch(url, { method: 'get' });

    return throwOnErrorResponse<IUserTaskMessageData>(response);
  }
}
