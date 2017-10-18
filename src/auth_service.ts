
import {AuthenticationStateEvent, IAuthenticationRepository, IIdentity} from './interfaces';

export class AuthenticationService {

  private authenticationRepository: IAuthenticationRepository;
  private token: string;
  public config: any = null;
  private identity: IIdentity;

  constructor(authenticationRepository: IAuthenticationRepository) {
    this.authenticationRepository = authenticationRepository;
  }

  public initialize(): Promise<void> {
    console.log('config', this.config, 'wat?');
    console.log('test');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(this.config);
        console.log('test2');
        resolve();
      }, 2000);
    })
  }

  public getToken(): string {
    return this.token;
  }

  public getIdentity(): IIdentity {
    return this.identity;
  }

  public async login(username: string, password: string): Promise<IIdentity> {
    const result: any = await this.authenticationRepository.login(username, password);
    this.token = result.token;
    this.identity = result.identity;

    return result;
  }

  public async logout(): Promise<void> {
    const result: any = await this.authenticationRepository.logout();
    this.token = null;
    this.identity = null;

    return result;
  }

  public hasToken(): boolean {
    return this.token !== null && this.token !== undefined && this.token !== '';
  }
}
