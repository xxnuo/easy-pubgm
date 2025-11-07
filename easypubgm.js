// ============ Utils ============

const ScreenRegion = {
    ALL: 0,
    TOP_LEFT: 1,
    TOP_RIGHT: 2,
    BOTTOM_LEFT: 3,
    BOTTOM_RIGHT: 4,
}

// 将屏幕分为四个区域，计算每个区域的 region
// @param {number} region - 区域索引，0-3 分别对应左上、右上、左下、右下
// @param {Image} img - 可选的图像对象，用于获取实际图像尺寸
// @returns {number[]} - 区域坐标 [X 坐标, Y 坐标, 宽, 高]
function getRegion(region, img) {
    let width, height;

    // 如果提供了图像，使用图像的实际尺寸，否则使用设备尺寸
    if (img) {
        width = img.width;
        height = img.height;
    } else {
        width = device.width;
        height = device.height;
    }

    const regionWidth = width / 2 | 0;
    const regionHeight = height / 2 | 0;

    switch (region) {
        case ScreenRegion.TOP_LEFT:
            return [0, 0, regionWidth, regionHeight];
        case ScreenRegion.TOP_RIGHT:
            return [regionWidth, 0, regionWidth, regionHeight];
        case ScreenRegion.BOTTOM_LEFT:
            return [0, regionHeight, regionWidth, regionHeight];
        case ScreenRegion.BOTTOM_RIGHT:
            return [regionWidth, regionHeight, regionWidth, regionHeight];
        default:
            return [0, 0, width, height];
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
    try {
        shizuku("am force-stop " + packageName);
    } catch (error) {
        try {
            shell('am force-stop ' + packageName, true);
        } catch (error) {
            toastLog('[kill-app] 杀死应用失败: ' + error);
            exit();
        }
    }
}

// 等待文本出现
function waitText(text, maxCycle = 30, sleepTime = 700, region = ScreenRegion.ALL) {
    let cycle = 0;
    let found = false;
    while (!found && cycle < maxCycle) {
        try {
            // 先截图，然后基于实际图像尺寸计算区域
            let img = images.captureScreen();
            if (!img) {
                toastLog('[waitText] 截图失败，跳过本次检测');
                cycle++;
                sleep(sleepTime);
                continue;
            }

            let result = ocr.detect(getRegion(region, img));
            img.recycle(); // 释放图像资源

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
        } catch (error) {
            toastLog('[waitText] OCR 检测失败: ' + error);
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
    try {
        // 先截图，然后基于实际图像尺寸计算区域
        let img = images.captureScreen();
        if (!img) {
            toastLog('[clickText] 截图失败');
            return false;
        }

        let result = ocr.detect(getRegion(region, img));
        img.recycle(); // 释放图像资源

        for (let i = reverse ? 0 : result.length - 1; i >= 0 && i < result.length; i += reverse ? 1 : -1) {
            if (fullTextMatch ? result[i].label === text : result[i].label.includes(text)) {
                let clickPoint = getRandomClickButtonPoint(result[i].bounds, maxOffset);
                press(clickPoint.x, clickPoint.y, clickTime);
                return true;
            }
        }
        return false;
    } catch (error) {
        toastLog('[clickText] OCR 检测失败: ' + error);
        return false;
    }
}

// 关闭 X 按钮，限定 MLKit 模式才能将关闭按钮识别为 X
function closeX(region = ScreenRegion.ALL) {
    clickText('X', maxOffset = 1, clickTime = 200, fullTextMatch = true, reverse = true, region);
}

// ============ Open App Module ============

function openAppLoop() {
    const appPackageName = 'com.tencent.tmgp.pubgmhd';
    toastLog('[open-app] 杀掉应用');
    killApp(appPackageName);
    sleep(500);
    toastLog('[open-app] 启动应用');
    app.launch(appPackageName)
    sleep(10e3);
    waitText('公告');
    toastLog('[open-app] 关闭公告');
    while (true) {
        try {
            // 先截图，然后基于实际图像尺寸计算区域
            let img = images.captureScreen();
            if (!img) {
                toastLog('[open-app] 截图失败，跳过本次检测');
                sleep(300);
                continue;
            }

            let result = ocr.detect(getRegion(ScreenRegion.ALL, img));
            img.recycle(); // 释放图像资源

            let foundStartGame = false;
            let foundThirdPerson = false;
            let foundCancel = false;
            let foundClose = false;
            let foundFinished = false;

            for (let i = 0; i < result.length; i++) {
                if (result[i].label.includes('开始游戏')) {
                    foundStartGame = true;
                }
                if (result[i].label.includes('第三人称')) {
                    foundThirdPerson = true;
                }
                if (result[i].label.includes('取消')) {
                    foundCancel = true;
                }
                if (result[i].label.includes('关闭')) {
                    foundClose = true;
                }
                if (result[i].label.includes('已结束')) {
                    foundFinished = true;
                }
            }

            if (foundStartGame && foundThirdPerson) {
                break;
            }
            if (foundCancel) {
                clickText('取消');
                sleep(300);
                continue;
            }
            if (foundClose) {
                clickText('关闭');
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
            sleep(300);
        } catch (error) {
            toastLog('[open-app] OCR 检测失败: ' + error);
            sleep(300);
        }
    }

    toastLog('[open-app] 逻辑结束');
}

// ============ Select Mode Module ============

function selectModeLoop() {
    toastLog('[select-mode] 选择模式');
    
    // 先关闭可能存在的公告弹窗（没有标题，只有X）
    toastLog('[select-mode] 检查并关闭残留公告');
    let maxAttempts = 5; // 最多尝试5次
    for (let i = 0; i < maxAttempts; i++) {
        if (isFoundText('X', region = ScreenRegion.TOP_RIGHT)) {
            closeX(region = ScreenRegion.TOP_RIGHT);
            sleep(300);
        } else {
            break;
        }
    }
    
    clickText('第三人称', region = ScreenRegion.TOP_LEFT);
    while (true) {
        if (isFoundText('自动匹配队友', region = ScreenRegion.TOP_RIGHT)) {
            break;
        }
        sleep(500);
    }

    // toastLog(clickText('自动匹配队友', 0, 200, false, true));
    // 通用识图有问题，使用特殊方法
    try {
        // 先截图，然后基于实际图像尺寸计算区域
        let img = images.captureScreen();
        if (!img) {
            toastLog('[select-mode] 截图失败');
        } else {
            ocr.mode = 'paddle';
            let result = ocr.detect(getRegion(ScreenRegion.TOP_RIGHT, img));
            ocr.mode = 'mlkit';
            img.recycle(); // 释放图像资源

            // toastLog(result);
            for (let i = result.length - 1; i >= 0; i--) {
                if (result[i].label.includes('自动匹配队友')) {
                    toastLog(result[i]);
                    let bounds = result[i].bounds;
                    let height = bounds.bottom - bounds.top;
                    let clickPoint = {
                        x: bounds.left + 10,
                        y: bounds.top + height / 2,
                    };
                    // toastLog(`clickPoint: (${clickPoint.x.toFixed(0)}, ${clickPoint.y.toFixed(0)})`);
                    click(clickPoint.x, clickPoint.y);
                    break;
                }
            }
        }
    } catch (error) {
        toastLog('[select-mode] OCR 检测失败: ' + error);
    }

    sleep(200);

    clickText('确定', region = ScreenRegion.BOTTOM_RIGHT);
    toastLog('[select-mode] 逻辑结束');
}

// ============ Start Game Module ============

function startGameLoop() {
    toastLog('[start-game] 进入大厅');
    while (true) {
        if (isFoundText('开始游戏', region = ScreenRegion.TOP_LEFT)) {
            break;
        }
        sleep(500);
    }
    clickText('开始游戏', region = ScreenRegion.TOP_LEFT);
    sleep(200);
    toastLog('[start-game] 等待人数');
    while (true) {
        if (isFoundText('人数', region = ScreenRegion.TOP_LEFT)) {
            break;
        }
        sleep(1000);
    }
    toastLog('[start-game] 等待跳伞');
    while (true) {
        if (isFoundText('离开', region = ScreenRegion.BOTTOM_LEFT)) {
            break;
        }
        sleep(2000);
    }
    clickText('离开', region = ScreenRegion.BOTTOM_LEFT);
    sleep(200);
    toastLog('[start-game] 逻辑结束');
}

// ============ Main ============

// 等待无障碍服务
auto.waitFor()

// 请求屏幕截图权限, 不限定屏幕方向
images.requestScreenCapture();

while (true) {
    openAppLoop();
    sleep(300);

    selectModeLoop();
    sleep(200);

    startGameLoop();
    sleep(1500);
}
