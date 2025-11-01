const startGameModule = require('./modules/start-game');
const gameOverModule = require('./modules/game-over');
const closeMapModule = require('./modules/close-map');
const openMapModule = require('./modules/open-map');

autojs.setRootMode(true);

device.wakeUpIfNeeded();
device.wakeUp();

// 进入开始游戏逻辑
// startGameModule.loop();
// openMapModule.loop();
// sleep(1000);
closeMapModule.loop();

// 进入游戏结束逻辑
// gameOverModule.loop();

