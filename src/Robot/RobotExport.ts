import Tween from "@tweenjs/tween.js";
import { eventBus } from "./utils";
import * as THREE from "three";
import throttle from "lodash/throttle";
import rov from "@/motion";
import dayjs from "dayjs";
import { re, resolve } from "mathjs";
// import * as THREE from "three";
// import {ROV} from '../utils/rov_dynamic';

const delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));
let times = 0;
function tweensComplete(tweens: any[]) {
  return new Promise((resolve) => {
    let completed = 0;
    const total = tweens.length;
    const onComplete = () => {
      completed++;
      if (completed === total) {
        resolve(true);
      }
    };

    tweens.forEach((tween) => {
      tween.onComplete(onComplete).start();
    });
  });
}
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
type Task = () => Promise<void>;
class Scheduler {
  private interval: number;
  private callback: () => Promise<unknown>;
  private timeoutId: NodeJS.Timeout | null = null;
  private isAllTasksCompleted: boolean = true;
  private taskQueue: Task[] = []; // 任务队列
  private running: boolean = false;
  // private runningPromise: Promise<void> | null = null;
  // private runningPromiseResolve!: (value: void | PromiseLike<void>) => void;
  constructor(interval: number, callback: () => Promise<unknown>) {
    this.interval = interval;
    this.callback = callback;
  }

  // 添加新任务
  public addTask(task: Task): void {
    this.taskQueue.push(task);
    this.isAllTasksCompleted = false; // 新任务添加，标记为未全部完成
    // this.processTasks(); // 开始处理任务队列
  }
  // 执行任务队列中的任务
  private async processTasks(): Promise<void> {
    while (this.taskQueue.length > 0 && !this.isAllTasksCompleted) {
      const task = this.taskQueue.shift();
      await task!();
    }
    this.checkAllTasksCompleted(); // 检查所有任务是否完成
    if (this.isAllTasksCompleted) {
      this.run(); // 如果所有任务完成，启动定时搜索任务
    }
  }

  private initRunningPromise = () => {
    this.runningPromise = new Promise((resolve) => {
      this.runningPromiseResolve = resolve;
    });
  };

  private run(): void {
    // console.log("run---------isAllTasksCompleted", this.isAllTasksCompleted);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId); // 清除现有的定时器
    }
    if (!this.running) {
      return;
    }
    this.timeoutId = setTimeout(async () => {
      // console.log("run---------isAllTasksCompleted2");
      if (this.isAllTasksCompleted) {
        // console.log("run---------isAllTasksCompleted3");
        // this.initRunningPromise();
        await this.callback();
        // this.runningPromiseResolve();
        // console.log("run---------isAllTasksCompleted4");
        // 任务完成后，检查是否有新的任务加入
        if (this.taskQueue.length > 0) {
          // console.log("run---------isAllTasksCompleted5");
          this.isAllTasksCompleted = false;
          this.processTasks(); // 处理新加入的任务
        } else {
          // console.log("run---------isAllTasksCompleted6");
          this.run(); // 没有新任务，继续执行定时搜索任务
        }
      } else {
        this.processTasks(); // 处理新加入的任务
      }
    }, this.interval);
  }

  private checkAllTasksCompleted(): void {
    if (this.taskQueue.length === 0) {
      this.isAllTasksCompleted = true;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId); // 清除定时器
      }
    }
  }

  public start(): void {
    this.running = true;
    this.run();
  }

  // 停止执行器
  public stop(): void {
    this.running = false;
    this.isAllTasksCompleted = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.taskQueue = [];
  }
}

export class RobotExport {
  rebotModel: THREE.Object3D;
  saveDataCb: (list: number[]) => void;
  originPosition: THREE.Vector3;
  originRotation: THREE.Euler;

  intervalId: any = undefined;
  taskList: any[] = [];
  scheduler: Scheduler;
  constructor(
    { rebotModel }: { rebotModel: THREE.Object3D },
    saveDataCb: () => void
  ) {
    this.originPosition = rebotModel.position.clone();
    this.originRotation = rebotModel.rotation.clone();
    this.rebotModel = rebotModel;
    this.saveDataCb = saveDataCb;
    this.taskList = [];
    this.scheduler = new Scheduler(600, () =>
      this.runAction([0, 0, 0, 0, 0, 0])
    );
    eventBus.on("fetchStart", this.start);
    eventBus.on("fetchStop", this.stop);
    eventBus.on("fetchAction", this.dispatchAction);
    eventBus.on("reset", this.reset);
  }

  runAction = async (action: number[]) => {
    // 调用API接口
    // const data_state = await getData(action);
    console.log("run,", times++, action, dayjs().format("YYYY-MM-DD HH:mm:ss"));

    //调用JS中的step函数
    // const data_state = rov.step(160, action);
    const action2 = nj.array(action);
    const data = rov.step(160, action2);
    const { data: data_state } = data.selection;
    const [x, y, z, rotationX, rotationY, rotationZ] = data_state || [];
    const list = [x, y, z, rotationX, rotationY, rotationZ];
    await this.updateModel(list);
  };

  start = () => {
    this.scheduler.start();
  };

  stop = () => {
    this.scheduler.stop();
  };

  /**更新位置 */
  updateModel = async (list: number[]) => {
    let resetX = this.rebotModel.position.x + list[0];
    let resetY = this.rebotModel.position.y + list[1];
    let resetZ = this.rebotModel.position.z + list[2];
    let resetRotX = this.rebotModel.rotation.x + list[3];
    let resetRotY = this.rebotModel.rotation.y + list[4];
    let resetRotZ = this.rebotModel.rotation.z + list[5];
    var rebotModelPosition = new Tween.Tween(this.rebotModel.position)
      .to({ x: resetX, y: resetY, z: resetZ }, 1000) // 2秒内移动到指定位置
      .easing(Tween.Easing.Quadratic.Out);
    // 使用缓动函数使动画更平滑

    // 创建一个新的Tween对象，用于更新xyz的角度运动
    var rebotModelRotation = new Tween.Tween(this.rebotModel.rotation)
      .to({ x: resetRotX, y: resetRotY, z: resetRotZ }, 1000) // 2秒内旋转到指定角度
      .easing(Tween.Easing.Quadratic.Out);

    // 使用缓动函数使动画更平滑

    // [rebotModelPosition, rebotModelRotation].forEach((tween) => {
    //   tween.start();
    // });
    const res = await tweensComplete([rebotModelPosition, rebotModelRotation]);
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
    return res;
  };

  dispatchAction = (type: string) => {
    this.scheduler.addTask(async () => this.fetchAction(type));
  };

  fetchAction = async (type: string) => {
    const actions = {
      up: [0.0, 0.0, 1500.0, 0.0, 0.0, 0.0],
      down: [0.0, 0.0, -1500.0, 0.0, 0.0, 0.0],
      left: [0.0, 1500.0, 0.0, 0.0, 0.0, 0.0],
      right: [0.0, -1500.0, 0.0, 0.0, 0.0, 0.0],
      ahead: [1500.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      behind: [-1500.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      roll_plus: [0.0, 0.0, 0.0, 800.0, 0.0, 0.0],
      roll_minus: [0.0, 0.0, 0.0, -800.0, 0.0, 0.0],
      pitch_plus: [0.0, 0.0, 0.0, 0.0, 800.0, 0.0],
      pitch_minus: [0.0, 0.0, 0.0, 0.0, -800.0, 0.0],
      yaw_plus: [0.0, 0.0, 0.0, 0.0, 0.0, 800.0],
      yaw_minus: [0.0, 0.0, 0.0, 0.0, 0.0, -800.0],
      // 其他操作...
    };
    const action = actions[type] as any;
    console.info("fetchAction", type, action);
    if (action) {
      console.log(type);
      await this.runAction(action);
    } else {
      console.log("ActionType not found");
    }
  };

  reset = () => {
    // this.rebotModel.position.set(this.originPosition)
    // this.rebotModel.rotation.set(this.originRotation)
    // console.log( this.rebotModel);

    if (this.saveDataCb) {
      let resetX = this.originPosition.x;
      let resetY = this.originPosition.y;
      let resetZ = this.originPosition.z;
      let resetRotX = this.originRotation.x;
      let resetRotY = this.originRotation.y;
      let resetRotZ = this.originRotation.z;
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
    // rov.reset(nj.array([0,0,0,0,0,0]))
  };
}
