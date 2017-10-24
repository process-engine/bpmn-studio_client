# consumer_client

The consumer_client is a JavaScript-client to communicate with a process-engine-instance

## What are the goals of this project?

The goal is to simplify the communication of JavaScript-clients with a process-engine-instance

## How do I set this project up?

### Prerequesites

A javascript or typescript environment

### Setup/Installation

Install the package:
```
npm install --save @process-engine/consumer_client
```

## How do I use this project?

### Usage

To use this package, import the `ConsumerClient`-class, make a new instance and use its methods, and initialize it.

Before initializing it, you can set its `config` as described in the API-doc

Some examples:

<details>
  <summary>simple JavaScript (Node)</summary>

```JavaScript
const client = require('@process-engine/consumer_client').ConsumerClient;

const clientInstance = new client();

client.initialize()
  .then(() => {
    // do things here with clientInstance
  });
```
</details>

<details>
  <summary>TypeScript</summary>

```TypeScript
import {ConsumerClient} from '@process-engine/consumer_client';

const clientInstance = new ConsumerClient();

async function run() {
  await clientInstance.initialize()
  // do things here with clientInstance
}

run();
```
</details>

<details>
  <summary>Aurelia</summary>

In aurelia, you should create a new consumerClient-feature, so you can inject the client where you need it (this is how it's used in [charon](https://github.com/process-engine/charon)):

*aurelia.json* (make aurelia know about the package)

```JSON
...
{
  "dependencies": [
    ...
    {
      "name": "@process-engine/consumer_client",
      "path": "../node_modules/@process-engine/consumer_client/dist/amd",
      "main": "index.js"
    },
    {
      "name": "addict-ioc",
      "path": "../node_modules/addict-ioc/dist/amd",
      "main": "index.js"
    },
    {
      "name": "fetch-ponyfill",
      "path": "../node_modules/fetch-ponyfill",
      "main": "build/fetch-browser"
    },
    {
      "name": "uuid-browser",
      "path": "../node_modules/uuid-browser",
      "main": "index.js"
    },
    {
      "name": "bluebird",
      "main": "./js/browser/bluebird",
      "path": "../node_modules/bluebird",
      "resources": []
    },
    "eventemitter2",
    "node-uuid"
}
```

*consumer-client/index.ts* (register the client to aurelias dependency injection container)

```TypeScript
import {ConsumerClient} from '@process-engine/consumer_client';
import {FrameworkConfiguration} from 'aurelia-framework';

export async function configure(config: FrameworkConfiguration): Promise<void> {

  const consumerClient: ConsumerClient = new ConsumerClient();
  await consumerClient.initialize();

  config.container.registerInstance('ConsumerClient', consumerClient);
}
```

*main.ts* (execute the registration setup before)

```TypeScript
aurelia.use
  .standardConfiguration()
  .feature('consumer-client');
```

*some class* (inject the client where you need it)

```TypeScript
import {ConsumerClient} from '@process-engine/consumer_client';
import {inject} from 'aurelia-framework';

@inject('ConsumerClient')
export class ClassName {

  private consumerClient: ConsumerClient;

  constructor(consumerClient: ConsumerClient) {
    this.consumerClient = consumerClient;
    // do something with the client
  }
}
```
</details>

## What else is there to know?

### Authors/Contact information

- Heiko Mathes <heiko.mathes@5minds.de>

### Related projects

- [Charon](https://github.com/process-engine/charon)

## ConsumerClient-API

### Configuration

At the moment, there is not much you can configure, only the base-route of the process-engine. Later, additional configuration might be added

```JavaScript
{
  baseRoute: 'http://localhost:8000'
}
```

### Methods

#### initialize

Initializes the ConsumerClient, and establishes a messagebus-connection to the process-engine.

See [here](./src/authentication/token_repository.ts) for an example of a minimal token-repository. If none provided, this is the one that will be used

```TypeScript
// definition
initialize(tokenRepository?: ITokenRepository): Promise<void>

// example
await consumerClient.initialize();
```

#### login

logs in the user

```TypeScript
// definition
login(username: string, password: string): Promise<ILoginResult>

// example
const loginResult = await consumerClient.login('admin', 'admin');

/* loginResult:
{
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI4ODg5NGJlNC1hOGUxLTRlYTMtODlmZC0zMWY1NGQ2YWExN2UiLCJpYXQiOjE1MDg4NDYxMTN9.23xzZS_uoeE9qRXF8u2ZALV8ntynmCiJ5gTdEXn2bD0',
  identity: {
    id: '61d7f2e3-3387-4115-895e-b04a49967b27',
    name: 'admin',
    roles: ['administrator', 'user', '_iam_internal', 'default']
  }
}*/
```

#### logout

logs out the current user

```TypeScript
// definition
logout(): Promise<boolean>

// example
consumerClient.logout();
```

#### getProcessDefList

fetches a list of processDefinitions. These can be used to start a new process.

```TypeScript
// definition
getProcessDefList(limit: number = 100, offset: number = 0): Promise<IPagination<IProcessDefEntity>>

// example
const list = await consumerClient.getProcessDefList();

/* list:
{ count: 2,
  offset: 0,
  limit: 100,
  data: [{
    id: '5c64bfbc-45c1-4dd8-a69d-325e8610d6bd',
    name: 'Prozess erstellen',
    key: 'CreateProcessDef',
    defId: 'Definitions_1',
    xml: 'SOME_LONG_STRING',
    path: '/Users/heiko/Desktop/Projekte/BPMN/process_engine_meta/process_repository/bpmn/createProcessDef.bpmn',
    category: 'internal',
    module: 'process_engine',
    readonly: null,
    version: '1.0.0',
    counter: 0,
    nodeDefCollection: [Object],
    flowDefCollection: [Object],
    laneCollection: [Object]
  }, {
    id: 'f1a8b520-f983-4ba6-8485-f8d7c331df9a',
    name: 'Reservierungsprozess',
    key: 'reservation',
    defId: 'Definitions_1',
    xml: 'SOME_LONG_STRING',
    extensions: [Object],
    internalName: 'reservationProcess',
    path: null,
    category: 'internal',
    module: null,
    readonly: null,
    version: '1.0.0',
    counter: 0,
    nodeDefCollection: [Object],
    flowDefCollection: [Object],
    laneCollection: [Object]
  }]
}*/
```

#### startProcessById(processDefId: string): Promise<ProcessId>

Starts a new Instance of the process with the given Id

```TypeScript
//definition
startProcessById(processDefId: string): Promise<ProcessInstanceId>

//example
const ProcessInstanceId = await consumerClient.startProcessById('5c64bfbc-45c1-4dd8-a69d-325e8610d6bd')

// processId: '6b1c43ae-bcc6-4ec5-adf1-3350916feaf7
```

  startProcessByKey(processDefKey: string): Promise<ProcessId>;
  getUserTaskList(): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskListByProcessDefId(processDefId: string): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskListByProcessInstanceId(processInstanceId: string): Promise<IPagination<IUserTaskEntity>>;
  getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig>;
  proceedUserTask(finishedTask: IUserTaskConfig, proceedAction?: UserTaskProceedAction): Promise<void>;
  cancelUserTask(userTaskToCancel: IUserTaskConfig): Promise<void>;
