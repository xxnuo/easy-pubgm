const { getRandomClickButtonPoint } = require('./utils');

function loop() {
  toastLog('[game-over] 开始检测继续按钮或返回大厅按钮');

  while (true) {
    let result = ocr.detect();
    // log(result);

    // 检查是否已经回到开始游戏界面
    let foundStartGame = false;
    for (let i = 0; i < result.length; i++) {
      if (result[i].label.includes('开始游戏')) {
        foundStartGame = true;
        break;
      }
    }

    if (foundStartGame) {
      toastLog('[game-over] 完成,逻辑结束');
      return;
    }

    let continueButton = null;
    for (let i = 0; i < result.length; i++) {
      if (result[i].label.includes('继续') || result[i].label.includes('返回大厅')) {
        continueButton = result[i];
        break;
      }
    }

    if (continueButton) {
      let clickPoint = getRandomClickButtonPoint(continueButton.bounds);

      toastLog(`[game-over] 检测到按钮，点击: (${clickPoint.x.toFixed(0)}, ${clickPoint.y.toFixed(0)})`);
      press(clickPoint.x, clickPoint.y, 200);

      sleep(1000);
    } else {
      toastLog('[game-over] 未检测到按钮，继续等待');
      sleep(1000);
    }
  }
}

module.exports = {
  loop,
};