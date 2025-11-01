const { getRandomClickButtonPoint } = require('./utils');

function loop() {
  toastLog('[start-game] 开始检测按钮');

  // 第一步：检测开始游戏按钮
  let result = ocr.detect();
  // log(result);

  let startGameButton = null;
  for (let i = 0; i < result.length; i++) {
    if (result[i].label.includes('开始游戏')) {
      startGameButton = result[i];
      let clickPoint = getRandomClickButtonPoint(startGameButton.bounds);
      toastLog(`[start-game] 点击按钮: (${clickPoint.x.toFixed(0)}, ${clickPoint.y.toFixed(0)})`);
      click(clickPoint.x, clickPoint.y);
      started = true;
      break;
    }
  }

  // 第三步：检测是否进入等待状态
  while (true) {
    let matchResult = ocr.detect();
    // log(matchResult);

    let foundMatching = false;
    let foundPlayerCount = false;

    for (let i = 0; i < matchResult.length; i++) {
      let label = matchResult[i].label;

      // 检测是否有"匹配中"字样
      if (label.includes('匹配中')) {
        foundMatching = true;
      }

      // 检测是否有人数字样（如 "1/4", "2/4" 等）
      if (label.includes('人数')) {
        foundPlayerCount = true;
      }
    }

    if (foundPlayerCount) {
      toastLog('[start-game] 已进入房间，逻辑结束');
      return;
    }

    if (foundMatching) {
      toastLog('[start-game] 等待中');
      sleep(1000);
      continue;
    }

    toastLog('[start-game] 继续检测');
    sleep(1000);
  }
}

module.exports = {
  loop,
};