
import {
  AuthenticationStateEvent,
  IAuthenticationRepository,
  IAuthenticationService,
  IIdentity,
  ILoginResult,
  ILogoutResult,
} from '../contracts/index';

export class AuthenticationService implements IAuthenticationService {

  private authenticationRepository: IAuthenticationRepository;
  private token: string;
  public config: any = null;
  private identity: IIdentity;

  constructor(authenticationRepository: IAuthenticationRepository) {
    this.authenticationRepository = authenticationRepository;
  }

  public getToken(): string {
    return this.token;
  }

  public getIdentity(): IIdentity {
    return this.identity;
  }

  public async login(username: string, password: string): Promise<ILoginResult> {
    const result: ILoginResult = await this.authenticationRepository.login(username, password);
    if (this.config.manageToken === true) {
      this.token = result.token;
      this.identity = result.identity;
    }

    return result;
  }

  public async logout(): Promise<ILogoutResult> {
    const result: any = await this.authenticationRepository.logout();
    this.token = null;
    this.identity = null;

    return result;
  }

  public hasToken(): boolean {
    return this.token !== null && this.token !== undefined && this.token !== '';
  }
}
