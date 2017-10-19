import {IIdentity} from './index';

export interface ITokenRepository {
  getToken(): string;
  setToken(token: string): void;
  getIdentity(): IIdentity;
  setIdentity(identity: IIdentity): void;
}
