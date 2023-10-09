export class RobotExport {
  running = undefined
  intervalId = undefined
  startRun = (action) => {
      const run = async () => {
          this.running = true
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
  
              // 解构final_state数组中的位置和角度信息
              const [x, y, z, rotationX, rotationY, rotationZ] = data.data_state || []
  
              const list = [x, y, z, rotationX, rotationY, rotationZ];
              console.log("list:" + list);
              let resetX = rebootModel.position.x + list[0];
              let resetY = rebootModel.position.y + list[1];
              let resetZ = rebootModel.position.z + list[2];
              let resetRotX = rebootModel.rotation.x + list[3];
              let resetRotY = rebootModel.rotation.y + list[4];
              let resetRotZ = rebootModel.rotation.z + list[5];
              let position = rebootModel.position;
              // 创建一个新的Tween对象，用于更新xyz坐标运动
              let tween = new Tween.Tween(rebootModel.position)
                  .to({ x: resetX, y: resetY, z: resetZ }, 1000) // 2秒内移动到指定位置
                  .easing(Tween.Easing.Quadratic.Out) // 使用缓动函数使动画更平滑
                  .start(); // 开始动画
              
              // 创建一个新的Tween对象，用于更新xyz的角度运动
              let tweenRotation = new Tween.Tween(rebootModel.rotation)
                  .to({ x: resetRotX, y: resetRotY, z: resetRotZ }, 1000) // 2秒内旋转到指定角度
                  .easing(Tween.Easing.Quadratic.Out) // 使用缓动函数使动画更平滑
                  .start(); // 开始动画
              
              console.log("机器人的坐标系position:", position);
              console.log("机器人的坐标系rotation:", rebootModel.rotation);
              reTry()
          } catch (error) {
              console.error("API request error:", error);
          }
      }
  
      const reTry = () => {
          this.intervalId = setTimeout(async () => {
              if (this.running) {
                  run()
              }
          }, 1000); // 每隔0.1秒调用一次API接口
      }
      run()
  }
  // startRun = (action) => {
  //     const run = () => {
  //         return new Promise(async (resolve, reject) => {
  //             this.running = true
  //             try {
  //                 // 调用API接口
  //                 const response = await fetch("http://localhost:5000/api/rov/step", {
  //                     method: "POST",
  //                     headers: {
  //                         "Content-Type": "application/json"
  //                     },
  //                     body: JSON.stringify({
  //                         n_step: 20,
  //                         action: action
  //                     })
  //                 });
  //                 if (!response.ok) {
  //                     throw new Error("API request failed");
  //                 }
  //                 const data = await response.json();

  //                 // 解构final_state数组中的位置和角度信息
  //                 const [x, y, z, rotationX, rotationY, rotationZ] = data.data_state || []

  //                 const list = [x, y, z, rotationX, rotationY, rotationZ];
  //                 console.log("list:" + list);

  //                 resolve(list); // 解析list
  //             } catch (error) {
  //                 console.error("API request error:", error);
  //                 reject(error); // 如果有错误，拒绝Promise
  //             }
  //         });
  //     }

  // }
  stop = () => {
      this.running = false
      if (this.intervalId) {
          clearInterval(this.intervalId)
      }
  }

  updateModel = (list) => {
      let resetX = rebootModel.position.x + list[0];
      let resetY = rebootModel.position.y + list[1];
      let resetZ = rebootModel.position.z + list[2];
      let resetRotX = rebootModel.rotation.x + list[3];
      let resetRotY = rebootModel.rotation.y + list[4];
      let resetRotZ = rebootModel.rotation.z + list[5];

      rebootModel.position.set(resetX, resetY, resetZ);
      rebootModel.rotation.set(resetRotX, resetRotY, resetRotZ);
  }
}