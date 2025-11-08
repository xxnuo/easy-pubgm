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

// turnBackLoop();
loopUpLoop();