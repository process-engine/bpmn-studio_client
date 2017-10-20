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
    tokenRepositoryRegistration = container.registerObject('TokenRepository', tokenRepository);
  } else {
    tokenRepositoryRegistration = container.register('TokenRepository', TokenRepository);
  }

  tokenRepositoryRegistration.isTrueSingleton();

  container.register('AuthenticationRepository', AuthenticationRepository)
    .dependencies('TokenRepository')
    .configure({
      routes: {
        iam: `${baseRoute}/iam`,
      },
    });

  container.register('AuthenticationService', AuthenticationService)
    .dependencies('AuthenticationRepository', 'TokenRepository')
    .isTrueSingleton();

  container.register('ProcessEngineRepository', ProcessEngineRepository)
    .dependencies('TokenRepository')
    .configure({
      routes: {
        userTaskData: `${baseRoute}/processengine/user_task_data`,
        userTaskList: `${baseRoute}/datastore/UserTask`,
        startProcess: `${baseRoute}/processengine/start`,
        processes: `${baseRoute}/datastore/ProcessDef`,
      },
    });

  container.register('ProcessEngineService', ProcessEngineService)
    .dependencies('ProcessEngineRepository', 'MessagebusService', 'TokenRepository')
    .isTrueSingleton();

  container.register('MessagebusService', MessageBusService)
    .dependencies('TokenRepository')
    .configure({
      routes: {
        messageBus: `${baseRoute}/mb`,
      },
    });
}
