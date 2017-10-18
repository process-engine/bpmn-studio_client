import * as eventAggregatorRegister from '@essential-projects/event_aggregator/ioc_module';
import {InvocationContainer} from 'addict-ioc';
import {AuthenticationRepository, AuthenticationService} from './authentication/index';
import {MessageBusService} from './faye';

const baseRoute: string = 'http://localhost:8000';

export function registerInContainer(container: InvocationContainer): void {

  container.register('AuthenticationRepository', AuthenticationRepository);

  container.register('AuthenticationService', AuthenticationService)
    .dependencies('AuthenticationRepository')
    .configure({
      some: 'config',
    })
    .isTrueSingleton();

  container.register('MessagebusService', MessageBusService)
    .dependencies('AuthenticationService')
    .configure({
      routes: {
        messageBus: `${baseRoute}/mb`,
      },
    });
}
