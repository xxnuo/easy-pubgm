// 原理：荣都自动往毒外飞毒死

// 跳伞后回头滑动的起始坐标和结束坐标，可在特训岛打开指针位置然后将视角从南移到北测试得到，需要耐心多次调试得到合适的数值
const TURN_BACK_START_POINT = [2760, 835];
const TURN_BACK_END_POINT = [2305, 842];

// 跳伞后回头完往天上看的滑动的起始坐标和结束坐标，让跳伞飞的更远
const LOOP_UP_START_POINT = [1860, 1276];
const LOOP_UP_END_POINT = [1853, 454];

// 将左摇杆从起始点移动到冲刺点，让角色冲刺飞行
const SPRINT_START_POINT = [1853, 454];
const SPRINT_END_POINT = [1860, 1276];

// turnBackLoop: 默认跳伞后视角与飞机航线相同，该函数将视角旋转 180 度，朝向飞机航线相反方向
// 其实有更高效的办法，就是判断当前位置距离东西南北哪个边界最近然后往那边飞，但是这就涉及到识别地图了，有些复杂
// 这样虽然不是最高效的方法，但是比较简单，最后也能往毒边跑，仅有部分情况可能会出现有石头挡住路不能前进

function turnBackLoop() {
    toastLog(`回头 1s: ${JSON.stringify(TURN_BACK_START_POINT)}, ${JSON.stringify(TURN_BACK_END_POINT)}`);
    gesture(1000, TURN_BACK_START_POINT, TURN_BACK_END_POINT);
}

function loopUpLoop() {
    toastLog(`往上看 1s: ${JSON.stringify(LOOP_UP_START_POINT)}, ${JSON.stringify(LOOP_UP_END_POINT)}`);
    gesture(1000, LOOP_UP_START_POINT, LOOP_UP_END_POINT);
}

function sprintLoop() {
    toastLog(`冲刺 1s: ${JSON.stringify(SPRINT_START_POINT)}, ${JSON.stringify(SPRINT_END_POINT)}`);
    gesture(1000, SPRINT_START_POINT, SPRINT_END_POINT);
}

// 主函数循环
// turnBackLoop();
function mainLoop() {

}

// 工具函数

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

mainLoop();