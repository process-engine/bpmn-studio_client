const client = require('../dist/commonjs/index.js').ConsumerClient;
const clientInstance = new client();
const util = require('util');

async function run() {
  await clientInstance.initialize();

  clientInstance.on('*', (userTaskConfig) => {
    console.log(userTaskConfig);
  });

  clientInstance.cancelUserTask('b14e283a-0b44-405f-8e80-cf563f21832a');
}

run();

