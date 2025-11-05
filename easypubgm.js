// ============ Utils ============

const ScreenRegion = {
    ALL: 0,
    TOP_LEFT: 1,
    TOP_RIGHT: 2,
    BOTTOM_LEFT: 3,
    BOTTOM_RIGHT: 4,
}
const SCREEN_WIDTH = device.width;
const SCREEN_HEIGHT = device.height;
const REGION_WIDTH = SCREEN_WIDTH / 2 | 0;
const REGION_HEIGHT = SCREEN_HEIGHT / 2 | 0;

// 将屏幕分为四个区域，计算每个区域的 region
// @param {number} region - 区域索引，0-3 分别对应左上、右上、左下、右下
// @returns {number[]} - 区域坐标 [X 坐标, Y 坐标, 宽, 高]
function getRegion(region) {
    switch (region) {
        case ScreenRegion.TOP_LEFT:
            return [0, 0, REGION_WIDTH, REGION_HEIGHT];
        case ScreenRegion.TOP_RIGHT:
            return [REGION_WIDTH, 0, SCREEN_WIDTH, REGION_HEIGHT];
        case ScreenRegion.BOTTOM_LEFT:
            return [0, REGION_HEIGHT, REGION_WIDTH, SCREEN_HEIGHT];
        case ScreenRegion.BOTTOM_RIGHT:
            return [REGION_WIDTH, REGION_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT];
        default:
            return [0, 0, SCREEN_WIDTH, SCREEN_HEIGHT];
    }
}

// 计算按钮中心点并添加随机偏移
function getRandomClickButtonPoint(bounds, maxOffset = 10) {
    return {
        x: ((bounds.left + bounds.right) / 2) + (Math.random() * maxOffset * 2 - maxOffset),
        y: ((bounds.top + bounds.bottom) / 2) + (Math.random() * maxOffset * 2 - maxOffset)
    };
}

// 在指定坐标点添加随机偏移
function getRandomClickPoint(x, y, maxOffset = 10) {
    return {
        x: x + (Math.random() * maxOffset * 2 - maxOffset),
        y: y + (Math.random() * maxOffset * 2 - maxOffset)
    };
}

// 杀死指定应用，需要 Shizuku 权限或者 Root 权限
function killApp(packageName) {
    shell('am force-stop ' + packageName);
}

// 等待文本出现
function waitText(text, maxCycle = 30, sleepTime = 700, region = ScreenRegion.ALL) {
    let cycle = 0;
    let found = false;
    while (!found && cycle < maxCycle) {
        let result = ocr.detect(getRegion(region));
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
function isFoundText(text, region = ScreenRegion.ALL) {
    return waitText(text, maxCycle = 1, sleepTime = 0, region);
}

// 点击文本
function clickText(text, maxOffset = 1, clickTime = 200, fullTextMatch = false, reverse = false, region = ScreenRegion.ALL) {
    let result = ocr.detect(getRegion(region));
    for (let i = reverse ? 0 : result.length - 1; i >= 0 && i < result.length; i += reverse ? 1 : -1) {
        if (fullTextMatch ? result[i].label === text : result[i].label.includes(text)) {
            let clickPoint = getRandomClickButtonPoint(result[i].bounds, maxOffset);
            press(clickPoint.x, clickPoint.y, clickTime);
            return true;
        }
    }
    return false;
}

// 关闭 X 按钮，限定 MLKit 模式才能将关闭按钮识别为 X
function closeX(region = ScreenRegion.ALL) {
    clickText('X', maxOffset = 1, clickTime = 200, fullTextMatch = true, reverse = true, region);
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
        let result = ocr.detect(getRegion(ScreenRegion.ALL));
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

        waitText('X', region = ScreenRegion.TOP_RIGHT);
        closeX(region = ScreenRegion.TOP_RIGHT);
        // sleep(200);
    }

    log('[open-app] 逻辑结束');
}

// ============ Select Mode Module ============

function selectModeLoop() {
    log('[select-mode] 选择模式');
    clickText('第三人称', region = ScreenRegion.TOP_LEFT);
    while (true) {
        if (isFoundText('自动匹配队友', region = ScreenRegion.TOP_RIGHT)) {
            break;
        }
        sleep(500);
    }

    // log(clickText('自动匹配队友', 0, 200, false, true));
    // 通用识图有问题，使用特殊方法
    ocr.mode = 'paddle';
    let result = ocr.detect(getRegion(ScreenRegion.TOP_RIGHT));
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

    clickText('确定', region = ScreenRegion.BOTTOM_RIGHT);
    log('[select-mode] 逻辑结束');
}

// ============ Start Game Module ============

function startGameLoop() {
    log('[start-game] 进入大厅');
    while (true) {
        if (isFoundText('开始游戏', region = ScreenRegion.TOP_LEFT)) {
            break;
        }
        sleep(500);
    }
    clickText('开始游戏', region = ScreenRegion.TOP_LEFT);
    sleep(200);
    log('[start-game] 等待人数');
    while (true) {
        if (isFoundText('人数', region = ScreenRegion.TOP_LEFT)) {
            break;
        }
        sleep(1000);
    }
    log('[start-game] 等待跳伞');
    while (true) {
        if (isFoundText('离开', region = ScreenRegion.BOTTOM_LEFT)) {
            break;
        }
        sleep(2000);
    }
    clickText('离开', region = ScreenRegion.BOTTOM_LEFT);
    sleep(200);
    log('[start-game] 逻辑结束');
}

// ============ Main ============

// 等待无障碍服务
auto.waitFor()

// 请求屏幕截图权限
images.requestScreenCapture();

while (true) {
    openAppLoop();
    sleep(300);

    selectModeLoop();
    sleep(200);

    startGameLoop();
    sleep(1500);
}
