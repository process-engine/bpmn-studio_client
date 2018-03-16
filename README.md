# BPMN-Studio Client

The bpmn-studio_client is a JavaScript-client to communicate with a process-engine-instance

## What are the goals of this project?

The goal is to simplify the communication of JavaScript-clients with a process-engine-instance

## How do I set this project up?

### Prerequesites

A javascript or typescript environment

### Setup/Installation

Install the package:
```
npm install --save @process-engine/bpmn-studio_client
```

## How do I use this project?

### Usage

To use this package, import the `BpmnStudioClient`-class, create a new instance and initialize it. After that,
you can start using its methods.

Before initializing it, you can set its `config` as described in the API-doc

Some examples:

<details>
  <summary>simple JavaScript (Node)</summary>

```JavaScript
const client = require('@process-engine/bpmn-studio_client').BpmnStudioClient;

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
import {BpmnStudioClient} from '@process-engine/bpmn-studio_client';

const clientInstance = new BpmnStudioClient();

async function run() {
  await clientInstance.initialize()
  // do things here with clientInstance
}

run();
```
</details>

<details>
  <summary>Aurelia</summary>

In aurelia, you should create a new bpmnStudioClient-feature, so you can inject the client where you need it (this is how it's used in [bpmn-studio](https://github.com/process-engine/bpmn-studio)):

*aurelia.json* (make aurelia knows about the package)

```JSON
...
{
  "dependencies": [
    ...
    {
      "name": "@process-engine/bpmn-studio_client",
      "path": "../node_modules/@process-engine/bpmn-studio_client/dist/amd",
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
      "path": "../node_modules/bluebird"
    },
    "eventemitter2",
    "node-uuid"
}
```

*bpmn-studio_client/index.ts* (register the client to aurelias dependency injection container)

```TypeScript
import {BpmnStudioClient} from '@process-engine/bpmn-studio_client';
import {FrameworkConfiguration} from 'aurelia-framework';

export async function configure(config: FrameworkConfiguration): Promise<void> {

  const bpmnStudioClient: BpmnStudioClient = new BpmnStudioClient();
  await bpmnStudioClient.initialize();

  config.container.registerInstance('BpmnStudioClient', bpmnStudioClient);
}
```

*main.ts* (execute the registration setup before)

```TypeScript
aurelia.use
  .standardConfiguration()
  .feature('bpmn-studio_client');
```

*some class* (inject the client where you need it)

```TypeScript
import {BpmnStudioClient} from '@process-engine/bpmn-studio_client';
import {inject} from 'aurelia-framework';

@inject('BpmnStudioClient')
export class ClassName {

  private bpmnStudioClient: BpmnStudioClient;

  constructor(bpmnStudioClient: BpmnStudioClient) {
    this.bpmnStudioClient = bpmnStudioClient;
    // do something with the client
  }
}
```
</details>

## What else is there to know?

### Authors/Contact information

- Heiko Mathes <heiko.mathes@5minds.de>

### Related projects

- [BPMN-Studio](https://github.com/process-engine/bpmn-studio)

## BpmnStudioClient-API

### Configuration

At the moment, there is not much you can configure, only the base-route of the process-engine. Later, additional configuration might be added

```JavaScript
{
  baseRoute: 'http://localhost:8000'
}
```

### Methods

#### initialize

Initializes the BpmnStudioClient, and establishes a messagebus-connection to the process-engine.

See [here](./src/authentication/token_repository.ts) for an example of a minimal token-repository. If none provided, this is the one that will be used

```TypeScript
// definition
initialize(tokenRepository?: ITokenRepository): Promise<void>

// example
await bpmnStudioClient.initialize();
```

#### login

tries to login with the given credentials

```TypeScript
// definition
login(username: string, password: string): Promise<ILoginResult>

// example
const loginResult = await bpmnStudioClient.login('admin', 'admin');

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
bpmnStudioClient.logout();
```

#### getProcessDefList

fetches a list of processDefinitions. These can be used to start a new process. See [here](#about-pagination) for details on `IPagination<T>`.

```TypeScript
// definition
getProcessDefList(limit?: number, offset?: number): Promise<IPagination<IProcessDefEntity>>

// example
const list = await bpmnStudioClient.getProcessDefList();

/* list:
{ count: 2,
  offset: 0,
  limit: 'ALL',
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

#### startProcessById

Starts a new Instance of the process with the given Id

```TypeScript
//definition
startProcessById(processDefId: string): Promise<ProcessInstanceId>

//example
const processInstanceId = await bpmnStudioClient.startProcessById('5c64bfbc-45c1-4dd8-a69d-325e8610d6bd');

// processInstanceId: '6b1c43ae-bcc6-4ec5-adf1-3350916feaf7
```

#### startProcessByKey

Starts a new Instance of the process with the given key

```TypeScript
//definition
startProcessById(processDefKey: string): Promise<ProcessInstanceId>

//example
const processInstanceId = await bpmnStudioClient.startProcessByKey('CreateProcessDef');

// processInstanceId: '6b1c43ae-bcc6-4ec5-adf1-3350916feaf7
```

#### getUserTaskList

fetches the list of available userTasks. See [here](#about-pagination) for details on `IPagination<T>`.

```TypeScript
// definition
getUserTaskList(limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>>

// example
const userTaskList = await bpmnStudioClient.getUserTaskList()

/* userTaskList:
{ count: 3,
  offset: 0,
  limit: 'ALL',
  data: [{
    id: 'b061e1ee-217c-4e04-b260-16090ad410f4',
    name: 'Wähle Fzg.-Klasse',
    key: 'ut_WaehleKlasse',
    type: 'bpmn:UserTask',
    state: 'end',
    participant: '653ecef5-2458-4342-a03f-caba222ca360',
    application: null,
    processToken: [Object],
    instanceCounter: 0,
    nodeDef: [Object],
    process: [Object]
  }, { id: 'f4def4dc-b454-4a36-b4b0-42865141a061',
    name: 'Wähle Fzg.-Klasse',
    key: 'ut_WaehleKlasse',
    type: 'bpmn:UserTask',
    state: 'end',
    participant: null,
    application: null,
    processToken: [Object],
    instanceCounter: 0,
    nodeDef: [Object],
    process: [Object]
  }, { id: '11de295d-a592-467a-ab5d-e49bdcb0ceaf',
    name: 'Wähle Fzg.-Klasse',
    key: 'ut_WaehleKlasse',
    type: 'bpmn:UserTask',
    state: 'wait',
    participant: null,
    application: null,
    processToken: [Object],
    instanceCounter: 0,
    nodeDef: [Object],
    process: [Object]
  }]
}*/
```

#### getUserTaskListByProcessDefId

fetches the list of currently waiting userTasks that belong to the processDefinition with a given Id. See [here](#about-pagination) for details on `IPagination<T>`.

```TypeScript
// definition
getUserTaskListByProcessDefId(processDefId: string, limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>>

// example
const userTaskList = await bpmnStudioClient.getUserTaskListByProcessDefId('f1a8b520-f983-4ba6-8485-f8d7c331df9a')

/* userTaskList:
{
  count: 0,
  offset: 0,
  limit: 'ALL',
  data: []
}*/
```

#### getUserTaskListByProcessInstanceId

fetches the list of available userTasks that belong to the processInstance with a given Id. See [here](#about-pagination) for details on `IPagination<T>`.

```TypeScript
// definition
getUserTaskListByProcessInstanceId(processDefId: string, limit?: number, offset?: number): Promise<IPagination<IUserTaskEntity>>

// example
const userTaskList = await bpmnStudioClient.getUserTaskListByProcessInstanceId('645f9869-9b59-4a15-99ee-7a54bbe43aca')

/* userTaskList:
{ count: 2,
  offset: 0,
  limit: 'ALL',
  data: [{
    id: '7bc9457e-7f3a-42b7-9370-2cfc3b91262e',
    name: 'Wähle Fzg.-Klasse',
    key: 'ut_WaehleKlasse',
    type: 'bpmn:UserTask',
    state: 'end',
    participant: null,
    application: null,
    processToken: [Object],
    instanceCounter: 0,
    nodeDef: [Object],
    process: [Object]
  }, {
    id: '4fc24300-5c65-48b7-9b2e-9e2f055490e8',
    name: 'Reservierung abschliessen',
    key: 'ut_Buche',
    type: 'bpmn:UserTask',
    state: 'end',
    participant: null,
    application: null,
    processToken: [Object],
    instanceCounter: 0,
    nodeDef: [Object],
    process: [Object]
  }]
}*/
```

#### getUserTaskConfig

fetches the userTaskConfig of the userTask with a given Id. This userTaskConfig is basically all the interpreted and ready-to-go info you need, to display a userTask on the screen

```TypeScript
// definition
getUserTaskConfig(userTaskId: UserTaskId): Promise<IUserTaskConfig>

// example
const userTaskConfig = await bpmnStudioClient.getUserTaskConfig('11de295d-a592-467a-ab5d-e49bdcb0ceaf'))
/* userTaskConfig:
{
  userTaskEntity: [Object],
  id: '11de295d-a592-467a-ab5d-e49bdcb0ceaf',
  title: 'Wähle Fzg.-Klasse',
  widgetType: 'form',
  widgetConfig: {
    fields: [
      [Object],
      [Object],
      [Object]
    ]
  }
}
*/
```

#### proceedUserTask

Tells the process-engine, that a userTask has been finished, an that the corresponding processInstance can continue

```TypeScript
// definition
proceedUserTask(finishedTask: IUserTaskConfig, proceedAction?: UserTaskProceedAction): Promise<void>

// example
// start a new reservation-process
const processInstanceId = await clientInstance.startProcessByKey('reservation');

// get the list of userTasks for that process
let continueReservationTaskList = await clientInstance.getUserTaskListByProcessInstanceId(processInstanceId);

// get the userTaskConfig for the newest userTask
const newestReservationTask = continueReservationTaskList.data[continueReservationTaskList.data.length - 1];
const continueReservationTaskConfig = await clientInstance.getUserTaskConfig(newestReservationTask.id);

// update a value in that userTask, and tell the process-engine to continue
continueReservationTaskConfig.widgetConfig.fields[0].value = 'smallClass';
await clientInstance.proceedUserTask(continueReservationTaskConfig, 'proceed');
```

#### cancelUserTask

Tells the process-engine to abort a userTask. This will only work, if the corresponding event is modeled on the userTask you're about to cancel

```TypeScript
// definition
cancelUserTask(userTaskToCancel: IUserTaskConfig): Promise<void>;

// example
// start a new createProcess-process
const processInstanceId = await clientInstance.startProcessByKey('CreateProcessDef');

// get the userTaskConfig for the newest userTask
const newestCreateProcessTask = continueReservationTaskList.data[continueReservationTaskList.data.length - 1];
const createProcessTaskConfig = await clientInstance.getUserTaskConfig(newestCreateProcessTask.id);

// change your mind, and tell the process-engine to cancel the userTask
await clientInstance.cancelUserTask(createProcessTaskConfig);
```

### Events

the BpmnStudioClient extends [EventEmitter2](https://github.com/asyncly/EventEmitter2), so you can register
callbacks to be called when events happen. See EventEmitter2's documentation on how to register and unregister events.

#### renderUserTask

Fires, when the process-engine decided, that you could display a userTask

```TypeScript
bpmnStudioClient.on('renderUserTask', (userTaskConfig) => {
  // do something with the userTaskConfig
});
```

#### processEnd

Fires, when the process-engine notified you, that a process ended. The process-engine doesn't tell us what
process ended but using the internal participantId, the bpmnStudioClient can find that out if it interacted
with that process before

```TypeScript
bpmnStudioClient.on('processEnd', (processInstanceId) => {
  // Process with processInstanceId ended.
  // processInstanceId might be undefined, if the bpmnStudioClient
  // couldn't deduce it from the participantId
});
```

#### [channelName]

Every message the bpmnStudioClient receives from the process-engine via messagebus and that is not interpreted
to be a `renderUserTask` or `processEnd` message, is forwarded to you. The name of the event will be the name
of the channel the message was received on, but you can use wildcards to get all the messages

```TypeScript
bpmnStudioClient.on('*', (messagebusMessage) => {
  // get all the messages for me, even when they are not 'renderUserTask' or 'processEnd'
});
```

### About pagination

Any method that returns a `IPagination<T>` object will accept `limit` and `offset` parameters. You can use them to specify how many items you want in
the resulting list. When `limit` is not given all items will be returned.
