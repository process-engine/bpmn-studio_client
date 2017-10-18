import {InvocationContainer} from 'addict-ioc';
import {registerInContainer} from './ioc_module';

export class ConsumerClient {
  private container: InvocationContainer;
  private _messagebus: any;
  private _authService: any;

  public config: any = {};
  private loginToken: string;

  constructor() {
    this.container = this._initIocContainer();
    registerInContainer(this.container);
  }

  private _initIocContainer(): InvocationContainer {
    const container: InvocationContainer = new InvocationContainer({
      defaults: {
        conventionCalls: ['initialize'],
      },
    });

    return container;
  }

  public async initialize(): Promise<void> {
    this.config = {
      authService: {
        some: 'config123',
      },
    };

    this._authService = await this.container.resolveAsync('AuthenticationService', undefined, this.config.authService);
    this._messagebus = await this.container.resolveAsync('MessagebusService');
  }

  public login(username: string, password: string): Promise<string> {
    return this._authService.login(username, password);
  }

  public getProcessDefList(): string {
    return 'things';
  }
}
