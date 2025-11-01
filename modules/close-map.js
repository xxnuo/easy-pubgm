const { getRandomClickPoint, getAssetsDir } = require('./utils');

function loop() {
  toastLog('[close-map] 开始检测关闭按钮');

  let assetsDir = getAssetsDir();
  let closeMapImage = images.read(assetsDir + '/close-map.png');

  let result = images.findImage(captureScreen(), closeMapImage, {
    threshold: 0.6
  });
  console.log(result);
  if (result) {
    toastLog('[close-map] 检测到关闭按钮');
    let clickPoint = getRandomClickPoint(result.x, result.y, 2); // 使用很小的偏移值
    press(clickPoint.x, clickPoint.y, 200);
  } else {
    toastLog('[close-map] 未检测到关闭按钮');
  }

  return;

  while (true) {
    //请求横屏截图
    requestScreenCapture(true);
    //截图并找图
    var p = findImage(captureScreen(), wx, {
      region: [0, 50],
      threshold: 0.8
    });
    if (p) {
      toast("在桌面找到了微信图标啦: " + p);
    } else {
      toast("在桌面没有找到微信图标");
    }

    // 最终清理，防止内存泄漏
  }
}

module.exports = {
  loop,
};