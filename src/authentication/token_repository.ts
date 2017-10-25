import {IIdentity, ITokenRepository} from '../contracts/index';

export class TokenRepository implements ITokenRepository {
  private _token: string;
  private _identity: IIdentity;

  public getToken(): string {
    return this._token;
  }

  public setToken(token: string): void {
    this._token = token;
  }

  public getIdentity(): IIdentity {
    return this._identity;
  }

  public setIdentity(identity: IIdentity): void {
    this._identity = identity;
  }
}
