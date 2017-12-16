export interface IAuthenticationService {
  login(username: string, password: string): Promise<ILoginResult>;
  logout(): Promise<ILogoutResult>;
  updateConfig(config: any): void;
}

export interface IAuthenticationRepository {
  login(username: string, password: string): Promise<ILoginResult>;
  logout(): Promise<ILogoutResult>;
  updateConfig(config: any): void;
}

export interface ILoginResult {
  identity: IIdentity;
  token: string;
}

export interface ILogoutResult {
  result: boolean;
}

export interface IIdentity {
  id: string;
  name: string;
  roles: Array<string>;
}

export enum AuthenticationStateEvent {
  LOGIN = 'login',
  LOGOUT = 'logout',
}
