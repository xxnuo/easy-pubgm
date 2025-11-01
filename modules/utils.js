/**
 * 计算按钮中心点并添加随机偏移
 * @param {Object} bounds - 包含 left, right, top, bottom 的边界对象
 * @param {number} [maxOffset=10] - 最大偏移像素值
 * @returns {Object} - 包含 x, y 的点击坐标对象
 */
function getRandomClickButtonPoint(bounds, maxOffset = 10) {
  // 计算按钮中心点
  let centerX = (bounds.left + bounds.right) / 2;
  let centerY = (bounds.top + bounds.bottom) / 2;

  // 添加随机偏移
  let offsetX = Math.random() * maxOffset * 2 - maxOffset;
  let offsetY = Math.random() * maxOffset * 2 - maxOffset;

  // log(`getRandomClickButtonPoint: (${centerX + offsetX}, ${centerY + offsetY})`);

  return {
    x: centerX + offsetX,
    y: centerY + offsetY
  };
}

/**
 * 在指定坐标点添加随机偏移
 * @param {number} x - x 坐标
 * @param {number} y - y 坐标
 * @param {number} [maxOffset=10] - 最大偏移像素值
 * @returns {Object} - 包含 x, y 的点击坐标对象
 */
function getRandomClickPoint(x, y, maxOffset = 10) {
  // 添加随机偏移
  let offsetX = Math.random() * maxOffset * 2 - maxOffset;
  let offsetY = Math.random() * maxOffset * 2 - maxOffset;

  return {
    x: x + offsetX,
    y: y + offsetY
  };
}


/**
 * 获取资产目录
 * @returns {string} - 资产目录路径
 */
function getAssetsDir() {
  let projectDir = files.cwd();
  let assetsDir = projectDir + '/assets';
  // log(assetsDir);
  return assetsDir;
}

// 停止APP
function killApp(packageName) {
  shell('am force-stop ' + packageName, true);
};

// 等待文本出现
function waitText(text, maxCycle = 10, sleepTime = 500) {
  let result = ocr.detect();
  // log(result);

  let cycle = 0;
  let found = false;
  while (!found && cycle < maxCycle) {
    for (let i = 0; i < result.length; i++) {
      if (result[i].label.includes(text)) {
        found = true;
        break;
      }
    }
    if (found) {
      return true;
    } else {
      cycle++;
      sleep(sleepTime);
    }
  }
  return false;
}

// 当前屏幕是否包含指定文本
function isFoundText(text) {
  return waitText(text, maxCycle = 1, sleepTime = 0);
}

// 点击文本
function clickText(text, maxOffset = 1, clickTime = 200, fullTextMatch = false, reverse = false) {
  let result = ocr.detect();
  // log(result);
  for (let i = reverse ? 0 : result.length - 1; i >= 0 && i < result.length; i += reverse ? 1 : -1) {
    if (fullTextMatch ? result[i].label === text : result[i].label.includes(text)) {
      let clickPoint = getRandomClickButtonPoint(result[i].bounds, maxOffset);
      press(clickPoint.x, clickPoint.y, clickTime);
      return true;
    }
  }
  return false;
}

// 关闭X按钮
function closeX() {
  clickText('X', maxOffset = 1, clickTime = 200, fullTextMatch = true, reverse = true);
}


module.exports = {
  getRandomClickButtonPoint,
  getRandomClickPoint,
  getAssetsDir,
  killApp,
  waitText,
  isFoundText,
  clickText,
  closeX,
};
