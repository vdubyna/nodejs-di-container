let DiLibrary = require('../index');

let config = {
  appPath: './app/',
  aliases: {
    _: 'lodash',
    bt: 'BaseTest',
  },
};

let diContainer = new DiLibrary(config);

let baseCheck = diContainer.get('BaseCheck');
console.log(baseCheck);
