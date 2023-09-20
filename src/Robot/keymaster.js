

class RobotKeymaster {
  constructor(robotExport) {
    this.robotExport = robotExport
  }
  init = () => {
    // 遍历按键映射，将按键与对应的动作绑定
    Object.keys(keyActions).forEach(keyCode => {
      key(keyCode, () => {
        const action = keyActions[keyCode];
        // 执行动作
        this.robotExport.updateModel(action);
      });
    });
  }
}
