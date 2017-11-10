import * as fetch_ponyfill from 'fetch-ponyfill';
import {Request, RequestInit, Response} from 'node-fetch';

import {IAuthenticationRepository, ILoginResult, ILogoutResult, ITokenRepository} from '../contracts/index';
import {HttpHeader, isErrorResult, throwOnErrorResponse} from '../http';

const fetch: (url: string | Request, init?: RequestInit) => Promise<Response> = fetch_ponyfill().fetch;

const HTTP_CODE_OK: number = 200;

export class AuthenticationRepository implements IAuthenticationRepository {

  public config: any = null;
  private tokenRepository: ITokenRepository;

  constructor(tokenRepository: ITokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  public async login(username: string, password: string): Promise<ILoginResult> {
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

    return throwOnErrorResponse<ILoginResult>(response);
  }

  public async logout(): Promise<ILogoutResult> {
    const url: string = `${this.config.routes.iam}/logout`;
    const response: Response = await fetch(url, { method: 'get' });

    return throwOnErrorResponse<ILogoutResult>(response);
  }

  private getFetchHeader(header: HttpHeader = {}): HttpHeader {
    const token: string = this.tokenRepository.getToken();
    if (token !== undefined && token !== null) {
      header.Authorization = `Bearer ${token}`;
    }

    return header;
  }
}
