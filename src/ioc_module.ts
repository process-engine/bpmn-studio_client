import * as eventAggregatorRegister from '@essential-projects/event_aggregator/ioc_module';
import {InvocationContainer, ITypeRegistration} from 'addict-ioc';
import {AuthenticationRepository, AuthenticationService, TokenRepository} from './authentication/index';
import {ITokenRepository} from './contracts';
import {MessageBusService} from './faye';

const baseRoute: string = 'http://localhost:8000';

export function registerInContainer(container: InvocationContainer, tokenRepository?: ITokenRepository): void {

  let tokenRepositoryRegistration: ITypeRegistration<ITokenRepository>;

  if (tokenRepository !== undefined && tokenRepository !== null) {
    tokenRepositoryRegistration = container.registerObject('TokenService', tokenRepository);
  } else {
    tokenRepositoryRegistration = container.registerObject('TokenService', TokenRepository);
  }

  container.register('AuthenticationRepository', AuthenticationRepository);


  container.register('AuthenticationService', AuthenticationService)
    .dependencies('AuthenticationRepository', 'TokenService')
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
