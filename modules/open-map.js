const { getRandomClickPoint } = require('./utils');

function loop() {
  toastLog('[open-map] 开始检测按钮');

  while (true) {
    let result = ocr.detect();
    log(result);

    let taskButton = null;
    for (let i = 0; i < result.length; i++) {
      if (result[i].label.includes('任务')) {
        taskButton = result[i];
        break;
      }
    }

    if (taskButton) {
      // 计算按钮的右上角位置
      let rightX = taskButton.bounds.right;
      let topY = taskButton.bounds.top;

      // 向左上偏移 50 像素才是地图内
      let targetX = rightX - 50;
      let targetY = topY - 50;

      let clickPoint = getRandomClickPoint(targetX, targetY, 2);
      toastLog(`[open-map] 检测到按钮，点击: (${clickPoint.x.toFixed(0)}, ${clickPoint.y.toFixed(0)})`);
      click(clickPoint.x, clickPoint.y);
      toastLog('[open-map] 逻辑结束');
      return;
    } else {
      toastLog('[open-map] 未检测到按钮，继续等待');
      sleep(1000);
    }
  }
}

module.exports = {
  loop,
};