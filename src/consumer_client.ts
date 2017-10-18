import {InvocationContainer} from 'addict-ioc';

export class ConsumerClient {
  private _messagebus: any;

  constructor() {
    const container: InvocationContainer = this._initIocContainer();
    this._registerModulesToIocContainer(container)
      .then(() => {
        this._messagebus = container.resolve('MessagebusService');
        this.initialize();
      });
  }

  private _initIocContainer(): InvocationContainer {
    const container: InvocationContainer = new InvocationContainer({
      defaults: {
        conventionCalls: ['initialize'],
      },
    });

    return container;
  }

  private async _registerModulesToIocContainer(container: InvocationContainer): Promise<void> {
    const iocModule: any = await import('./ioc_module');
    iocModule.registerInContainer(container);
  }

  private initialize(): void {
    // do initialize things
  }

  public getProcessDefList(): string {
    return 'things';
  }
}
