import * as eventAggregatorRegister from '@essential-projects/event_aggregator/ioc_module';
import {InvocationContainer, ITypeRegistration} from 'addict-ioc';
import {AuthenticationRepository, AuthenticationService} from './authentication/index';
import {IAuthenticationService} from './contracts';
import {MessageBusService} from './faye';

const baseRoute: string = 'http://localhost:8000';

export function registerInContainer(container: InvocationContainer, authService?: IAuthenticationService): void {

  let authServiceRegistration: ITypeRegistration<IAuthenticationService>;

  if (authService !== undefined && authService !== null) {
    authServiceRegistration = container.register('AuthenticationService', <any> authService);
  } else {
    authServiceRegistration = container.register('AuthenticationService', AuthenticationService)
      .dependencies('AuthenticationRepository');

    container.register('AuthenticationRepository', AuthenticationRepository);
  }

  authServiceRegistration
    .isTrueSingleton()
    .configure({
      some: 'config',
    });

  container.register('MessagebusService', MessageBusService)
    .dependencies('AuthenticationService')
    .configure({
      routes: {
        messageBus: `${baseRoute}/mb`,
      },
    });
}
