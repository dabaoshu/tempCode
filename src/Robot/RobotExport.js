import Tween from '@tweenjs/tween.js';

export class RobotExport {

    constructor(rebootModel, saveDataCb) {
        this.rebootModel = rebootModel
        this.saveDataCb = saveDataCb
    }
    running = undefined
    intervalId = undefined
    startRun = (action) => {
        this.running = true

        const run = async () => {
            try {
                // 调用API接口
                const response = await fetch("http://localhost:5000/api/rov/step", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        n_step: 160,
                        action: action
                    })
                });
                if (!response.ok) {
                    throw new Error("API request failed");
                }
                const data = await response.json();
                console.log("data", data);
                // 解构final_state数组中的位置和角度信息
                const [x, y, z, rotationX, rotationY, rotationZ] = data.data_state || []

                const list = [x, y, z, rotationX, rotationY, rotationZ];
                let resetX = this.rebootModel.position.x + list[0];
                let resetY = this.rebootModel.position.y + list[1];
                let resetZ = this.rebootModel.position.z + list[2];
                let resetRotX = this.rebootModel.rotation.x + list[3];
                let resetRotY = this.rebootModel.rotation.y + list[4];
                let resetRotZ = this.rebootModel.rotation.z + list[5];

                if (this.saveDataCb) {
                    let timePointPosition = {
                        resetX, resetY, resetZ, resetRotX, resetRotY, resetRotZ,
                        time: Date.now()
                    }
                    this.saveDataCb(timePointPosition)
                }
                let position = this.rebootModel.position;
                // 创建一个新的Tween对象，用于更新xyz坐标运动
                let tween = new Tween.Tween(this.rebootModel.position)
                    .to({ x: resetX, y: resetY, z: resetZ }, 1000) // 2秒内移动到指定位置
                    .easing(Tween.Easing.Quadratic.Out) // 使用缓动函数使动画更平滑
                    .start(); // 开始动画

                // 创建一个新的Tween对象，用于更新xyz的角度运动
                let tweenRotation = new Tween.Tween(this.rebootModel.rotation)
                    .to({ x: resetRotX, y: resetRotY, z: resetRotZ }, 1000) // 2秒内旋转到指定角度
                    .easing(Tween.Easing.Quadratic.Out) // 使用缓动函数使动画更平滑
                    .start(); // 开始动画

                console.log("机器人的坐标系position:", position);
                console.log("机器人的坐标系rotation:", this.rebootModel.rotation);
                reTry()
            } catch (error) {
                console.error("API request error:", error);
            }
        }

        const reTry = () => {
            console.log(this.running);
            this.intervalId = setTimeout(async () => {
                if (this.running) {
                    run()
                }
            }, 1000); // 每隔0.1秒调用一次API接口
        }
        run()
    }
    stop = () => {
        this.running = false
        if (this.intervalId) {
            clearInterval(this.intervalId)
        }
    }

    updateModel = (list) => {
        let resetX = this.rebootModel.position.x + list[0];
        let resetY = this.rebootModel.position.y + list[1];
        let resetZ = this.rebootModel.position.z + list[2];
        let resetRotX = this.rebootModel.rotation.x + list[3];
        let resetRotY = this.rebootModel.rotation.y + list[4];
        let resetRotZ = this.rebootModel.rotation.z + list[5];

        this.rebootModel.position.set(resetX, resetY, resetZ);
        this.rebootModel.rotation.set(resetRotX, resetRotY, resetRotZ);
    }
}

