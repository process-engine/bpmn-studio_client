import {
  AuthenticationStateEvent,
  IAuthenticationRepository,
  IAuthenticationService,
  IIdentity,
  ILoginResult,
  ILogoutResult,
  ITokenRepository,
} from '../contracts/index';

export class AuthenticationService implements IAuthenticationService {

  private authenticationRepository: IAuthenticationRepository;
  private tokenRepository: ITokenRepository;
  public config: any = null;

  constructor(authenticationRepository: IAuthenticationRepository, tokenRepository: ITokenRepository) {
    this.authenticationRepository = authenticationRepository;
    this.tokenRepository = tokenRepository;
  }

  public updateConfig(config: any): void {
    this.authenticationRepository.updateConfig(config);
  }

  public async login(username: string, password: string): Promise<ILoginResult> {
    const result: ILoginResult = await this.authenticationRepository.login(username, password);
    this.tokenRepository.setToken(result.token);
    this.tokenRepository.setIdentity(result.identity);

    return result;
  }

  public async logout(): Promise<ILogoutResult> {
    const result: any = await this.authenticationRepository.logout();
    this.tokenRepository.setToken(null);
    this.tokenRepository.setIdentity(null);

    return result;
  }
}
