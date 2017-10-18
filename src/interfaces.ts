export interface IErrorResponse {
  error: any;
}

export interface IAuthenticationService {
  login(username: string, password: string): Promise<IIdentity>;
  logout(): Promise<void>;
  getToken(): string;
  hasToken(): boolean;
  getIdentity(): IIdentity;
}

export interface IAuthenticationRepository {
  login(username: string, password: string): Promise<ILoginResult>;
  logout(): Promise<ILogoutResult>;
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

export interface IMessageBusService {
  createMessage(): any;
  sendMessage(channel: string, message: any): Promise<any>;
  registerMessageHandler(handler: (channel: string, message: any) => void): void;
  removeMessageHandler(handler: (channel: string, message: any) => void): void;
}
