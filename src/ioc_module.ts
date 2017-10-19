import * as eventAggregatorRegister from '@essential-projects/event_aggregator/ioc_module';
import {InvocationContainer, ITypeRegistration} from 'addict-ioc';
import {AuthenticationRepository, AuthenticationService, TokenRepository} from './authentication/index';
import {ITokenRepository} from './contracts';
import {MessageBusService} from './faye';
import {ProcessEngineRepository, ProcessEngineService} from './processengine/index';

export function registerInContainer(container: InvocationContainer,
                                    tokenRepository?: ITokenRepository,
                                    baseRoute: string = 'http://localhost:8000'): void {

  let tokenRepositoryRegistration: ITypeRegistration<ITokenRepository>;

  if (tokenRepository !== undefined && tokenRepository !== null) {
    tokenRepositoryRegistration = container.registerObject('TokenService', tokenRepository);
  } else {
    tokenRepositoryRegistration = container.registerObject('TokenService', TokenRepository);
  }

  tokenRepositoryRegistration.isTrueSingleton();

  container.register('AuthenticationRepository', AuthenticationRepository);
  container.register('AuthenticationService', AuthenticationService)
    .dependencies('AuthenticationRepository', 'TokenService')
    .isTrueSingleton();

  container.register('ProcessEngineRepository', ProcessEngineRepository)
  .configure({
    routes: {
      processengine: `${baseRoute}/processengine`,
    },
  });

  container.register('ProcessEngineService', ProcessEngineService)
    .dependencies('ProcessEngineRepository', 'TokenService')
    .isTrueSingleton();

  container.register('MessagebusService', MessageBusService)
    .dependencies('AuthenticationService')
    .configure({
      routes: {
        messageBus: `${baseRoute}/mb`,
      },
    });
}
