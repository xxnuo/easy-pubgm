const { clickText, isFoundText } = require('./utils');

function loop() {
  log('[start-game] 进入大厅');
  while (true) {
    if (isFoundText('开始游戏')) {
      break;
    }
  }
  clickText('开始游戏');
  sleep(200);
  log('[start-game] 等待人数');
  while (true) {
    if (isFoundText('人数')) {
      break;
    }
    sleep(1000);
  }
  log('[start-game] 等待跳伞');
  while (true) {
    if (isFoundText('离开')) {
      break;
    }
    sleep(1000);
  }
  clickText('离开');
  sleep(200);
  log('[start-game] 逻辑结束');
}

module.exports = {
  loop,
};