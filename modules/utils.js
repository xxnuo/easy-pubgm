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
  log(assetsDir);
  return assetsDir;
}

module.exports = {
  getRandomClickButtonPoint,
  getRandomClickPoint,
  getAssetsDir,
};
