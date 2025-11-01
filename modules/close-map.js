const { getRandomClickButtonPoint } = require('./utils');

function loop() {
  toastLog('[close-map] 开始检测关闭按钮');

  let result = ocr.detect();
  log(result);

  let closeButton = null;
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].label.includes('X') || result[i].label.includes('x')) {
      closeButton = result[i];
      break;
    }
  }

  if (closeButton) {
    let clickPoint = getRandomClickButtonPoint(closeButton.bounds);
    toastLog(`[close-map] 检测到按钮，点击: (${clickPoint.x.toFixed(0)}, ${clickPoint.y.toFixed(0)})`);
    press(clickPoint.x, clickPoint.y, 200);
  } else {
    toastLog('[close-map] 未检测到按钮');
  }
  return;
}


module.exports = {
  loop,
};