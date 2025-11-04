// ============ Utils ============

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
    return assetsDir;
}

/* 
 * 杀死指定应用
 * @param {string} packageName - 应用包名
 */
function killApp(packageName) {
    shell('am force-stop ' + packageName, true);
}

/* 
 * 等待文本出现
 * @param {string} text - 等待的文本
 * @param {number} maxCycle - 最大等待周期
 * @param {number} sleepTime - 等待间隔时间
 * @returns {boolean} - 是否找到文本
 */
function waitText(text, maxCycle = 30, sleepTime = 700) {
    let cycle = 0;
    let found = false;
    while (!found && cycle < maxCycle) {
        let result = ocr.detect();
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

/* 
 * 当前屏幕是否包含指定文本
 * @param {string} text - 指定的文本
 * @returns {boolean} - 是否找到文本
 */
function isFoundText(text) {
    return waitText(text, maxCycle = 1, sleepTime = 0);
}

/* 
 * 点击文本
 * @param {string} text - 点击的文本
 * @param {number} maxOffset - 最大偏移像素值
 * @param {number} clickTime - 点击时间
 * @param {boolean} fullTextMatch - 是否全文本匹配
 * @param {boolean} reverse - 是否反向查找
 * @returns {boolean} - 是否找到文本
 */
function clickText(text, maxOffset = 1, clickTime = 200, fullTextMatch = false, reverse = false) {
    let result = ocr.detect();
    for (let i = reverse ? 0 : result.length - 1; i >= 0 && i < result.length; i += reverse ? 1 : -1) {
        if (fullTextMatch ? result[i].label === text : result[i].label.includes(text)) {
            let clickPoint = getRandomClickButtonPoint(result[i].bounds, maxOffset);
            press(clickPoint.x, clickPoint.y, clickTime);
            return true;
        }
    }
    return false;
}

/* 
 * 关闭X按钮
 */
function closeX() {
    clickText('X', maxOffset = 1, clickTime = 200, fullTextMatch = true, reverse = true);
}

// ============ Open App Module ============

function openAppLoop() {
    const appPackageName = 'com.tencent.tmgp.pubgmhd';
    log('[open-app] 杀掉应用');
    killApp(appPackageName);
    sleep(300);
    log('[open-app] 启动应用');
    app.launch(appPackageName)
    waitText('公告');
    log('[open-app] 关闭公告');
    while (true) {
        let result = ocr.detect();
        let foundStartGame = false;
        let foundCancel = false;
        let foundFinished = false;

        for (let i = 0; i < result.length; i++) {
            if (result[i].label.includes('开始游戏')) {
                foundStartGame = true;
            }
            if (result[i].label.includes('取消')) {
                foundCancel = true;
            }
            if (result[i].label.includes('已结束')) {
                foundFinished = true;
            }
        }

        if (foundStartGame) {
            break;
        }
        if (foundCancel) {
            clickText('取消');
            sleep(300);
            continue;
        }
        if (foundFinished) {
            clickText('确定');
            sleep(300);
            continue;
        }

        sleep(500);
        closeX();
    }

    log('[open-app] 逻辑结束');
}

// ============ Select Mode Module ============

function selectModeLoop() {
    log('[select-mode] 选择模式');
    clickText('第三人称');
    while (true) {
        if (isFoundText('自动匹配队友')) {
            break;
        }
        sleep(500);
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
            let height = bounds.bottom - bounds.top;
            let clickPoint = {
                x: bounds.left + 10,
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

// ============ Start Game Module ============

function startGameLoop() {
    log('[start-game] 进入大厅');
    while (true) {
        if (isFoundText('开始游戏')) {
            break;
        }
        sleep(500);
    }
    clickText('开始游戏');
    sleep(200);
    log('[start-game] 等待人数');
    while (true) {
        if (isFoundText('人数')) {
            break;
        }
        sleep(1000);
    }
    log('[start-game] 等待跳伞');
    while (true) {
        if (isFoundText('离开')) {
            break;
        }
        sleep(1000);
    }
    clickText('离开');
    sleep(200);
    log('[start-game] 逻辑结束');
}

// ============ Main ============

autojs.setRootMode(true);

device.wakeUpIfNeeded();
device.wakeUp();

requestScreenCapture();

while (true) {
    openAppLoop();
    sleep(300);

    selectModeLoop();
    sleep(200);

    startGameLoop();
    sleep(1500);
}

