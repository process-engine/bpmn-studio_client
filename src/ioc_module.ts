import * as eventAggregatorRegister from '@essential-projects/event_aggregator/ioc_module';
import {InvocationContainer} from 'addict-ioc';
import {AuthenticationRepository} from './auth_repo';
import {AuthenticationService} from './auth_service';
import {MessageBusService} from './faye';

const baseRoute: string = 'http://localhost:8000';

export function registerInContainer(container: InvocationContainer): void {

  container.register('AuthenticationRepository', AuthenticationRepository);

  container.register('AuthenticationService', AuthenticationService)
    .dependencies('AuthenticationRepository');

  container.register('MessagebusService', MessageBusService)
    .dependencies('AuthenticationService')
    .configure({
      routes: {
        messageBus: `${baseRoute}/mb`,
      },
    });
}
