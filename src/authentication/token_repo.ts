import {ITokenRepository} from '../contracts/index';

export class TokenRepository implements ITokenRepository {
  private _token: string;

  public getToken(): string {
    return this._token;
  }

  public setToken(token: string): void {
    this._token = token;
  }
}
