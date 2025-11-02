const { killApp, waitText, closeX, isFoundText, clickText } = require('./utils');


function loop() {
  const appPackageName = 'com.tencent.tmgp.pubgmhd';
  log('[open-app] 杀掉应用');
  killApp(appPackageName);
  sleep(300);
  log('[open-app] 启动应用');
  app.launch(appPackageName)
  waitText('公告');
  log('[open-app] 关闭公告');
  while (true) {
    if (isFoundText('开始游戏')) {
      break;
    }
    if (isFoundText('取消')) {
      clickText('取消');
      continue;
    }
    if (isFoundText('已结束')) {
      clickText('确定');
      continue;
    }
    waitText('X');
    closeX();
    sleep(200);
  }

  log('[open-app] 逻辑结束');
}

module.exports = {
  loop,
};