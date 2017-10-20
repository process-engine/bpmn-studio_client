const client = require('../dist/commonjs/index.js').ConsumerClient;
const clientInstance = new client();
const util = require('util');

async function run() {
  await clientInstance.initialize();
  const eventHandler = (eventName, ...parameter) => {
    console.log('message', eventName, ...parameter);
  };
  clientInstance.on('*', function(...parameter) {
    eventHandler(this.event, ...parameter);
  });
}

run();

