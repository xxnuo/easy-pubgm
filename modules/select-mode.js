const { clickText, isFoundText } = require('./utils');


function loop() {
  log('[select-mode] 选择模式');
  clickText('第三人称');
  while (true) {
    if (isFoundText('自动匹配队友')) {
      break;
    }
  }

  // log(clickText('自动匹配队友', 0, 200, false, true));
  // 通用识图有问题，使用特殊方法
  ocr.mode = 'paddle';
  let result = ocr.detect();
  ocr.mode = 'mlkit';
  
  // log(result);
  for (let i = result.length - 1; i >= 0; i--) {
    if (result[i].label.includes('自动匹配队友')) {
      log(result[i]);
      let bounds = result[i].bounds;
      let width = bounds.right - bounds.left;
      let height = bounds.bottom - bounds.top;
      let clickPoint = {
        x: bounds.left + width / 2,
        y: bounds.top + height / 2,
      };
      // log(`clickPoint: (${clickPoint.x.toFixed(0)}, ${clickPoint.y.toFixed(0)})`);
      click(clickPoint.x, clickPoint.y);
      break;
    }
  }

  sleep(200);

  clickText('确定');
  log('[select-mode] 逻辑结束');
}

module.exports = {
  loop,
};