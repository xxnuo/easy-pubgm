// 原理：自动跳伞往圈外飞，毒死或者淹死

// 跳伞后回头滑动的起始坐标和结束坐标，可在特训岛打开指针位置然后将视角从南移到北测试得到，需要耐心多次调试得到合适的数值
const TURN_BACK_START_POINT = [2760, 800];
const TURN_BACK_END_POINT = [2135, 800];

// 跳伞后回头完往天上看的滑动的起始坐标和结束坐标，让跳伞飞的更远
// 没有什么限制，只要在右半侧滑动让角色往天上尽可能多看即可
const LOOP_UP_START_POINT = [2543, 1209];
const LOOP_UP_END_POINT = [2567, 531];

// 将左摇杆从起始点移动到冲刺点，让角色冲刺、飞行更远
// 格式是 [x, y]，建议 y 坐标设置为摇杆的中心点 y 值，开始和结束的 x 从屏幕的底部滑到顶部
// 因为受限于无障碍权限只能做到滑动做不到滑动后按住，这样达到通过一分钟的缓慢长滑动达到飞得更远的效果
// 因此建议摇杆和冲刺的位置都尽可能的靠近屏幕底边，触发冲刺更快
const SPRINT_START_POINT = [600, 1400];
const SPRINT_END_POINT = [600, 30];

// 等待无障碍服务
auto.waitFor()

// 请求屏幕截图权限, 不限定屏幕方向
images.requestScreenCapture();
ocr.mode = 'paddle';

// 数据统计
let totalLostScore = 0;
let currentLevel = '';

// 初始化静态提示悬浮窗
var window = floaty.rawWindow(
    <frame gravity="center">
        <card w="auto" cardCornerRadius="10dp" cardBackgroundColor="#AA000000">
            <text id="statusText" text="脚本已启动" textSize="16sp" textColor="#FFFFFF" />
        </card>
    </frame>
);
window.setSize(device.width, -2);
window.setPosition(0, 1); // 初始位置，顶部向下偏移 1px
window.setTouchable(false);   // 设置为不可触摸，防止遮挡

// 脚本结束时关闭悬浮窗
events.on("exit", function () {
    window.close();
});

// 重写 tip 函数，改为更新悬浮窗内容
tip = function (msg) {
    ui.run(function () {
        window.statusText.setText('[' + totalLostScore + '][' + currentLevel + ']' + ' ' + String(msg));
    });
    log('[' + totalLostScore + '][' + currentLevel + ']' + ' ' + String(msg)); // 保留控制台日志
};

// 默认跳伞后视角与飞机航线相同，该函数将视角旋转 180 度，朝向飞机航线相反方向
// 其实有更高效的办法，就是判断当前位置距离东西南北哪个边界最近然后往那边飞，但是这就涉及到识别地图了，有些复杂
// 这样虽然不是最高效的方法，但是比较简单，最后也能往毒边跑，仅有部分情况可能会出现有石头挡住路不能前进
// gestures 函数添加延时执行会导致手机死机重启，不知道为什么，所以现在分开成三个函数
function directionLoop() {
    tip(`回头`);
    gesture(500, TURN_BACK_START_POINT, TURN_BACK_END_POINT);
    sleep(Math.random() * 1000);
    tip(`往上看`);
    gesture(500, LOOP_UP_START_POINT, LOOP_UP_END_POINT);
    tip(`冲刺`);

    let gameOver = false;
    let endSprint = false;
    let sprintThread = threads.start(function () {
        tip("开始冲刺");
        while (!gameOver && !endSprint) {
            gesture(1 * 60 * 1000, getRandomOffset(SPRINT_START_POINT, 5), getRandomOffset(SPRINT_END_POINT, 5));
        }
    });

    tip("等待成盒");
    while (!gameOver) {
        try {
            let img = images.captureScreen();
            if (img) {
                let result = ocr.detect(getRegion(ScreenRegion.ALL, img));
                img.recycle();
                for (let i = 0; i < result.length; i++) {
                    let label = result[i].label;
                    if (label.includes('分享名次') || label.includes('退出观战')) {
                        gameOver = true;
                        sprintThread.interrupt();
                        break;
                    }
                    if (label.includes('下潜')) {
                        endSprint = true;
                        clickText('下潜', region = ScreenRegion.BOTTOM_RIGHT);
                    }
                }
            }
        } catch (error) {
            tip('OCR 检测失败: ' + error);
        }
        sleep(2000);
    }
    tip("游戏结算");
}

function returnHome() {
    tip("退出结算")
    while (true) {
        try {
            let img = images.captureScreen();
            if (!img) {
                tip('截图失败，跳过本次检测');
                sleep(300);
                continue;
            }

            let result = ocr.detect(getRegion(ScreenRegion.ALL, img));
            img.recycle();

            let foundStartGame = false;
            let foundThirdPerson = false;
            let foundDive = false;
            let foundContinue = false;
            let foundReturnHome = false;
            let foundOK = false;
            let foundExitWatch = false;
            let foundGroup = false;

            for (let i = 0; i < result.length; i++) {
                let label = result[i].label;
                if (label.includes('开始游戏')) {
                    foundStartGame = true;
                } else if (label.includes('第三人称') || label.includes('限定挑战')) {
                    foundThirdPerson = true;
                }
                else if (label.includes('下潜')) {
                    foundDive = true;
                }
                else if (label.includes('总积分')) {
                    totalLostScore += matchScore(label);
                    tip('结算');
                } else if (label.includes('热血青铜') || label.includes('不屈白银') || label.includes('英勇黄金') || label.includes('坚韧铂金') || label.includes('不朽星钻') || label.includes('荣耀皇冠') || label.includes('超级王牌') || label.includes('无敌战神')) {
                    currentLevel = label.trim();
                    tip('结算');
                } else if (label.includes('继续')) {
                    foundContinue = true;
                } else if (label.includes('返回大厅')) {
                    foundReturnHome = true;
                } else if (label.includes('确定')) {
                    foundOK = true;
                } else if (label.includes('退出观战')) {
                    foundExitWatch = true;
                } else if (label.includes('暂不需要')) {
                    foundGroup = true;
                }
            }

            if (foundDive) {
                clickText('下潜', region = ScreenRegion.BOTTOM_RIGHT);
                sleep(1000);
                continue;
            }

            if (foundContinue) {
                clickText('继续');
                sleep(300);
                continue;
            }
            if (foundReturnHome) {
                clickText('返回大厅');
                sleep(300);
                continue;
            }
            if (foundOK) {
                clickText('确定');
                sleep(300);
                continue;
            }
            if (foundExitWatch) {
                clickText('退出观战');
                sleep(300);
                continue;
            }
            if (foundGroup) {
                clickText('暂不需要');
                sleep(300);
                continue;
            }
            if (foundStartGame && foundThirdPerson) {
                tip('回到大厅');
                return;
            }
        } catch (error) {
            tip('OCR 检测失败: ' + error);
        }
        sleep(300);
    }
}


function startGameLoop() {
    // 防止误触取消，点击时间缩短为 50ms
    clickText('开始游戏', clickTime = 50, region = ScreenRegion.TOP_LEFT);
    let startGameTime = new Date().getTime();
    let needRematch = false;
    sleep(200);
    tip('等待匹配完成');
    if (isFoundText('开始游戏', region = ScreenRegion.TOP_LEFT)) {
        // 断触，需要重新点击开始游戏
        clickText('开始游戏', clickTime = 50, region = ScreenRegion.TOP_LEFT);
    }
    if (isFoundText('匹配中', region = ScreenRegion.TOP_LEFT)) {
        while (true) {
            if (needRematch) {
                tip('需要重新匹配');
                clickText('匹配中', region = ScreenRegion.TOP_LEFT);
                sleep(500);
                clickText('开始游戏', region = ScreenRegion.TOP_LEFT);
                needRematch = false;
            } else if (isFoundText('人数', region = ScreenRegion.TOP_LEFT)) {
                break;
            } else {
                needRematch = new Date().getTime() - startGameTime > 20 * 1000;
            }
            sleep(1000);
        }
    }

    tip('等待可跳伞');
    if (!isFoundText('剩余', region = ScreenRegion.TOP_LEFT)) {
        while (true) {
            if (isFoundText('剩余', region = ScreenRegion.TOP_LEFT)) {
                break;
            }
            sleep(4000);
        }
    }
    tip('等待跳伞');
    if (!isFoundText('离开', region = ScreenRegion.BOTTOM_LEFT)) {
        while (true) {
            if (isFoundText('离开', region = ScreenRegion.BOTTOM_LEFT)) {
                break;
            }
            sleep(500);
        }
    }
    clickText('离开', region = ScreenRegion.BOTTOM_LEFT);
    sleep(2000);
    tip('跳伞完成');
}

// 主函数循环
function mainLoop() {
    while (true) {
        if (isFoundText("继续|剩余", region = ScreenRegion.ALL)) {
            returnHome();
            sleep(500);
        }
        if (isFoundText("匹配中", region = ScreenRegion.TOP_LEFT)) {
            clickText('匹配中', region = ScreenRegion.TOP_LEFT);
            sleep(500);
        }
        startGameLoop();
        sleep(500);
        directionLoop();
        returnHome();
        sleep(500);
    }
}

// 工具函数
const ScreenRegion = {
    ALL: 0,
    TOP_LEFT: 1,
    TOP_RIGHT: 2,
    BOTTOM_LEFT: 3,
    BOTTOM_RIGHT: 4,
    TOP: 5,
    BOTTOM: 6,
}

// 将屏幕分为六个区域，计算每个区域的 region
// @param {number} region - 区域索引，0-3 分别对应左上、右上、左下、右下，5 对应屏幕上半部分，6 对应屏幕下半部分
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

    let regionWidth = width / 2 | 0;
    let regionHeight = height / 2 | 0;

    switch (region) {
        case ScreenRegion.TOP_LEFT:
            return [0, 0, regionWidth, regionHeight];
        case ScreenRegion.TOP_RIGHT:
            return [regionWidth, 0, regionWidth, regionHeight];
        case ScreenRegion.BOTTOM_LEFT:
            return [0, regionHeight, regionWidth, regionHeight];
        case ScreenRegion.BOTTOM_RIGHT:
            return [regionWidth, regionHeight, regionWidth, regionHeight];
        case ScreenRegion.TOP:
            return [0, 0, width, regionHeight];
        case ScreenRegion.BOTTOM:
            return [0, regionHeight, width, regionHeight];
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

// 在指定坐标点添加随机偏移
function getRandomOffset(point, maxOffset = 10) {
    return [
        point[0] + (Math.random() * maxOffset * 2 - maxOffset),
        point[1] + (Math.random() * maxOffset * 2 - maxOffset)
    ];
}

// 等待文本出现
// 支持 "文本1|文本2" 的或语法，匹配任意一个即返回 true
function waitText(text, maxCycle = 30, sleepTime = 700, region = ScreenRegion.ALL) {
    let texts = text.includes('|') ? text.split('|').map(t => t.trim()) : [text];
    let cycle = 0;
    let found = false;
    while (!found && cycle < maxCycle) {
        try {
            let img = images.captureScreen();
            if (!img) {
                tip('截图失败，跳过本次检测');
                cycle++;
                sleep(sleepTime);
                continue;
            }

            let result = ocr.detect(getRegion(region, img));
            img.recycle();

            for (let i = 0; i < result.length; i++) {
                for (let j = 0; j < texts.length; j++) {
                    if (result[i].label.includes(texts[j])) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        } catch (error) {
            tip('OCR 检测失败: ' + error);
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
// 支持 "文本1|文本2" 的或语法，匹配任意一个即返回 true
function isFoundText(text, region = ScreenRegion.ALL) {
    return waitText(text, maxCycle = 1, sleepTime = 0, region);
}

// 点击文本
function clickText(text, maxOffset = 1, clickTime = 200, fullTextMatch = false, reverse = false, region = ScreenRegion.ALL) {
    try {
        let img = images.captureScreen();
        if (!img) {
            tip('截图失败');
            return false;
        }

        let result = ocr.detect(getRegion(region, img));
        img.recycle();

        for (let i = reverse ? 0 : result.length - 1; i >= 0 && i < result.length; i += reverse ? 1 : -1) {
            if (fullTextMatch ? result[i].label === text : result[i].label.includes(text)) {
                let clickPoint = getRandomClickButtonPoint(result[i].bounds, maxOffset);
                press(clickPoint.x, clickPoint.y, clickTime);
                return true;
            }
        }
        return false;
    } catch (error) {
        tip('OCR 检测失败: ' + error);
        return false;
    }
}

// 匹配文本
let matchScoreDebounce = 0;
function matchScore(text) {
    // log('matchScore: ' + text);

    // 防抖：30秒内仅有一次输入有效
    let now = Date.now();
    if (now - matchScoreDebounce < 30000) {
        log('matchScore: 防抖中，忽略本次调用');
        return 0;
    }

    // 提供文本：总积分-16 或 总积分-16排名分-15淘汰分-7 或 总积分+4 或 总积分+4排名分+1淘汰分+2
    let idx = text.indexOf('总积分');
    if (idx === -1) return 0;

    idx += 3;
    let sign = text[idx];

    if (sign === '—' || sign === '一') {
        sign = '-';
    } else if (sign !== '+' && sign !== '-') {
        return 0;
    }

    idx++;
    let numStr = '';
    while (idx < text.length && text[idx] >= '0' && text[idx] <= '9') {
        numStr += text[idx];
        idx++;
    }

    if (numStr === '') return 0;

    // 更新防抖时间戳
    matchScoreDebounce = now;

    // log('matchedScore: ' + sign + numStr);
    return parseInt(sign + numStr);
}

// 主函数循环
mainLoop();
