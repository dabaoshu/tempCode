import Tween from "@tweenjs/tween.js";
import { eventBus } from "./utils";
import throttle from "lodash/throttle";
import rov from "@/motion";
// import * as THREE from "three";
// import {ROV} from '../utils/rov_dynamic';

const getData = async (action) => {
  // 调用API接口
  const response = await fetch(`${url}/api/rov/step`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      n_step: 160,
      action: action,
    }),
  });
  if (!response.ok) {
    throw new Error("API request failed");
  }
  const data = await response.json();

  return data.data_state || [];
};

const url = `http://8.134.105.135:7890`;
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
export class RobotExport {
  constructor({ rebotModel }, saveDataCb) {
    this.rebotModel = rebotModel;
    this.saveDataCb = saveDataCb;
    this.fetchAction = throttle(this.fetchAction, 200, {
      leading: true,
      trailing: false,
    });
    eventBus.on("click1", this.fetchAction);
  }
  running = undefined;
  intervalId = undefined;
  startRun = (action, alawy = false) => {
    this.running = true;

    const run = async () => {
      try {
        // 调用API接口
        const data_state = await getData(action);

        //调用JS中的step函数
        // const data_state = rov.step(160, action);

        const [x, y, z, rotationX, rotationY, rotationZ] = data_state || [];

        const list = [x, y, z, rotationX, rotationY, rotationZ];
        // let resetX = this.rebootModel.position.x + list[0];
        // let resetY = this.rebootModel.position.y + list[1];
        // let resetZ = this.rebootModel.position.z + list[2];
        // let resetRotX = this.rebootModel.rotation.x + list[3];
        // let resetRotY = this.rebootModel.rotation.y + list[4];
        // let resetRotZ = this.rebootModel.rotation.z + list[5];

        this.updateModel(list);

        // this.runAnimate({ resetX, resetY, resetZ, resetRotX, resetRotY, resetRotZ, })

        // console.log("机器人的坐标系position:", this.rebotModel.position);
        // console.log("机器人的坐标系rotation:", this.rebotModel.rotation);
        if (alawy) {
          reTry();
        }
      } catch (error) {
        console.error("API request error:", error);
      }
    };

    const reTry = () => {
      console.log(this.running);
      this.intervalId = setTimeout(async () => {
        if (this.running) {
          run();
        }
      }, 1000); // 每隔0.1秒调用一次API接口
    };
    run();
  };
  stop = () => {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  };

  updateModel = (list) => {
    let resetX = this.rebotModel.position.x + list[0];
    let resetY = this.rebotModel.position.y + list[1];
    let resetZ = this.rebotModel.position.z + list[2];
    let resetRotX = this.rebotModel.rotation.x + list[3];
    let resetRotY = this.rebotModel.rotation.y + list[4];
    let resetRotZ = this.rebotModel.rotation.z + list[5];

    var rebotModelPosition = new Tween.Tween(this.rebotModel.position)
      .to({ x: resetX, y: resetY, z: resetZ }, 1000) // 2秒内移动到指定位置
      .easing(Tween.Easing.Quadratic.Out); // 使用缓动函数使动画更平滑

    // 创建一个新的Tween对象，用于更新xyz的角度运动
    var rebotModelRotation = new Tween.Tween(this.rebotModel.rotation)
      .to({ x: resetRotX, y: resetRotY, z: resetRotZ }, 1000) // 2秒内旋转到指定角度
      .easing(Tween.Easing.Quadratic.Out); // 使用缓动函数使动画更平滑

    [rebotModelPosition, rebotModelRotation].forEach((tween) => {
      tween.start();
    });

    if (this.saveDataCb) {
      let timePointPosition = {
        resetX,
        resetY,
        resetZ,
        resetRotX,
        resetRotY,
        resetRotZ,
        time: Date.now(),
      };
      this.saveDataCb(timePointPosition);
    }
  };

  fetchAction = async (type) => {
    let action = [];
    switch (type) {
      case "start":
        action = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.startRun(action, true);
        break;
      case "up":
        action = [0.0, 0.0, 1500.0, 0.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "down":
        action = [0.0, 0.0, -1500.0, 0.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "left":
        action = [0.0, 1500.0, 0.0, 0.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "right":
        action = [0.0, -1500.0, 0.0, 0.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "ahead":
        action = [1500.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "behind":
        action = [-1500.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "roll+":
        action = [0.0, 0.0, 0.0, 800.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "roll-":
        action = [0.0, 0.0, 0.0, -800.0, 0.0, 0.0];
        this.startRun(action);
        break;
      case "pitch+":
        action = [0.0, 0.0, 0.0, 0.0, 800.0, 0.0];
        this.startRun(action);
        break;
      case "pitch-":
        action = [0.0, 0.0, 0.0, 0.0, -800.0, 0.0];
        this.startRun(action);
        break;
      case "yaw+":
        action = [0.0, 0.0, 0.0, 0.0, 0.0, 800.0];
        this.startRun(action);
        break;
      case "yaw-":
        action = [0.0, 0.0, 0.0, 0.0, 0.0, -800.0];
        this.startRun(action);
        break;
      case "stop":
        this.stop();
        break;
      // 其他case...
    }
    // console.log("action:", action);
  };
}
