const { getRandomClickButtonPoint } = require('./utils');

function loop() {
  let maxAttempts = 10;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    toastLog(`[start-game] 尝试第 ${attempt} 次`);

    let result = ocr.detect();
    log(result);

    let startGameButton = null;
    for (let i = 0; i < result.length; i++) {
      if (result[i].label.includes('开始游戏')) {
        startGameButton = result[i];
        break;
      }
    }

    if (startGameButton) {
      let clickPoint = getRandomClickButtonPoint(startGameButton.bounds);

      toastLog(`[start-game] 点击按钮: (${clickPoint.x.toFixed(0)}, ${clickPoint.y.toFixed(0)})`);
      press(clickPoint.x, clickPoint.y, 200);

      let matchResult = ocr.detect();
      // log(matchResult);

      let foundMatching = false;
      for (let i = 0; i < matchResult.length; i++) {
        if (matchResult[i].label.includes('匹配') || matchResult[i].label.includes('匹配中')) {
          foundMatching = true;
          break;
        }
      }

      if (foundMatching) {
        toastLog('[start-game] 逻辑结束');
        return;
      } else {
        toastLog('[start-game] 未检测到，继续等待');
        sleep(1000);
      }
    } else {
      toastLog('[start-game] 未找到按钮，继续等待');
      sleep(2000);
    }
  }

  toastLog('[start-game] 达到最大尝试次数，逻辑结束');
}

module.exports = {
  loop,
};