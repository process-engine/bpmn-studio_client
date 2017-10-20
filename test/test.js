const client = require('../dist/commonjs/index.js').ConsumerClient;
const clientInstance = new client();
const util = require('util');

async function run() {
  await clientInstance.initialize();

  //get values
  const value1 = await clientInstance.getUserTaskConfig('dc945627-5d70-46f7-a727-963d6c3295a0');
  const value2 = await clientInstance.getUserTaskConfig('24e80412-7f0e-4313-bd3f-f817c9f126cc');

  // make logs neat
  delete value1.userTaskEntity;
  delete value2.userTaskEntity;

  process.stdout.write('confirm-widget\n');
  process.stdout.write(util.inspect(value1, {depth: null, colors: true}));
  process.stdout.write('\n\nform-widget\n');
  process.stdout.write(util.inspect(value2, {depth: null, colors: true}));

  console.log(await clientInstance.proceedUserTask(value2, 'cancel'))
  //console.log(await clientInstance.startProcessByKey('start'));
}

run();
