const client = require('../dist/commonjs/index.js').ConsumerClient;
const clientInstance = new client();
const util = require('util');

function PromiseWait(timeout = 3000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout)
  });
}

async function run() {
  await clientInstance.initialize();
  console.log (await clientInstance.getProcessDefList());
/*
  clientInstance.on('renderUserTask', (userTaskConfig) => {
    console.log('process', userTaskConfig.userTaskEntity.process.id);
  });

  clientInstance.on('processEnd', (processId) => {
    console.log('processEnd', processId);
  });

  const processInstanceId = await clientInstance.startProcessByKey('reservation');
  await PromiseWait();
  let continueReservationTaskList = await clientInstance.getUserTaskListByProcessInstanceId(processInstanceId);
  let continueReservationTask = await clientInstance.getUserTaskConfig(continueReservationTaskList.data[continueReservationTaskList.data.length - 1].id);
  continueReservationTask.widgetConfig.fields[0].value = 'smallClass';
  await clientInstance.proceedUserTask(continueReservationTask, 'proceed');
  await PromiseWait();
  continueReservationTaskList = await clientInstance.getUserTaskListByProcessInstanceId(processInstanceId);
  continueReservationTask = await clientInstance.getUserTaskConfig(continueReservationTaskList.data[continueReservationTaskList.data.length - 1].id);
  await clientInstance.proceedUserTask(continueReservationTask, 'cancel');


*/
  //await clientInstance.login('admin', 'admin');
  //clientInstance.logout();
/*
  const userTasks = await clientInstance.getUserTaskList()
  for (const userTask of userTasks.data) {
    const someUserTask = await clientInstance.getUserTaskConfig(userTasks.data[userTasks.data.length - 1].id)
    await clientInstance.cancelUserTask(someUserTask);
  }

  console.log('task canceled')
  */
}

run().catch(console.log);

