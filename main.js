const openAppModule = require('./modules/open-app');
const selectModeModule = require('./modules/select-mode');
const startGameModule = require('./modules/start-game');

autojs.setRootMode(true);

device.wakeUpIfNeeded();
device.wakeUp();

while (true) {
  openAppModule.loop();
  sleep(300);

  selectModeModule.loop();
  sleep(200);

  startGameModule.loop();
  sleep(1000);
}