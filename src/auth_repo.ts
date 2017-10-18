import {fetch, Headers, Request, Response} from 'fetch-ponyfill';
import {IErrorResponse} from './interfaces';

const HTTP_CODE_OK: number = 200;

export class AuthenticationRepository {

  public config: any;

  private isErrorResult(result: any | IErrorResponse): result is IErrorResponse {
    return result.error !== undefined;
  }
  private async throwOnErrorResponse<TResult = any>(response: Response): Promise<TResult> {
    const result: TResult | IErrorResponse = await response.json();
    if (this.isErrorResult(result)) {
      throw new Error(result.error);
    }

    return result;
  }

  public async login(username: string, password: string): Promise<any> {
    const options: RequestInit = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    };

    const url: string = `${this.config.routes.iam}/login`;
    const response: Response = await fetch(url, options);

    return this.throwOnErrorResponse(response);
  }

  public async logout(): Promise<any> {
    const url: string = `${this.config.routes.iam}/logout`;
    const response: Response = await fetch(url, { method: 'get' });

    return this.throwOnErrorResponse(response);
  }
}
