const startGameModule = require('./modules/start-game');
const gameOverModule = require('./modules/game-over');
const closeMapModule = require('./modules/close-map');

autojs.setRootMode(true);

device.wakeUpIfNeeded();
device.wakeUp();

// 进入开始游戏逻辑
// startGameModule.loop();

closeMapModule.loop();

// 进入游戏结束逻辑
// gameOverModule.loop();

