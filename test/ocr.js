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
            return [REGION_WIDTH, 0, REGION_WIDTH, REGION_HEIGHT];
        case ScreenRegion.BOTTOM_LEFT:
            return [0, REGION_HEIGHT, REGION_WIDTH, REGION_HEIGHT];
        case ScreenRegion.BOTTOM_RIGHT:
            return [REGION_WIDTH, REGION_HEIGHT, REGION_WIDTH, REGION_HEIGHT];
        default:
            return [0, 0, SCREEN_WIDTH, SCREEN_HEIGHT];
    }
}

images.requestScreenCapture();

// console.log('ocr.mode = "mlkit"')
// let result = ocr.detect(getRegion(ScreenRegion.TOP_RIGHT));
// console.log(result)

ocr.mode = 'paddle';
console.log('ocr.mode = "paddle"')
let result2 = ocr.detect(getRegion(ScreenRegion.ALL));
console.log(result2)
