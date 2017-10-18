import {InvocationContainer} from 'addict-ioc';
import {registerInContainer} from './ioc_module';

export class ConsumerClient {
  private container: InvocationContainer;
  private _messagebus: any;
  public config: any;

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
    this._messagebus = await this.container.resolveAsync('MessagebusService');
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 10000);
    });
    console.log('messagebus loaded', this._messagebus);
  }

  public getProcessDefList(): string {
    return 'things';
  }
}
