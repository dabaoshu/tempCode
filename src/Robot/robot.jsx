import React, { createRef, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import Tween from "@tweenjs/tween.js";
export default class Robot extends React.Component {
  $robotView;
  componentDidMount() {
    this.initializeThreeJS();
  }

  initializeThreeJS() {
    /**stats */
    const stats = new Stats();
    stats.showPanel(0);
    this.$robotView.appendChild(stats.domElement);

    // Colors
    const black = new THREE.Color("black");
    const white = new THREE.Color("white");

    // 设置水深100米
    const waterPosition = new THREE.Vector3(0, 0, 10);
    const near = 0;
    const far = 2;
    const waterSize = 1024;


    // Create directional light
    // TODO Replace this by a THREE.DirectionalLight and use the provided matrix (check that it's an Orthographic matrix as expected)
    const light = [0, 0, -1];
    const lightCamera = new THREE.OrthographicCamera(
        -1.2,
        1.2,
        1.2,
        -1.2,
        near,
        far
    );
    lightCamera.position.set(0, 0, 1.5);
    lightCamera.lookAt(0, 0, 0);


    

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // Set up your Three.js scene, camera, and renderer here
    // ...

    this.threeScene = scene;
    this.threeCamera = camera;
    this.threeRenderer = renderer;

    // Append the Three.js canvas to the component's DOM element
    this.$robotView.appendChild(renderer.domElement);

    // Add event listeners, animations, and other functionality here
    // ...

    // Start rendering loop
    this.animate();
  }

  animate() {
    // Implement your animation logic here, e.g., updating object positions, rotations, etc.

    // Render the scene
    this.threeRenderer.render(this.threeScene, this.threeCamera);

    // Request the next frame
    requestAnimationFrame(this.animate);
  }

  componentWillUnmount() {
    // Clean up resources, remove event listeners, etc. here
    // ...

    // Dispose of Three.js objects to prevent memory leaks
    this.threeRenderer.dispose();
  }

  //   addEventListener() {
  //     // 添加窗口变化监听器
  //     this.RobotViewRef.addEventListener("resize", () => {
  //       // 更新修改相机比例
  //       camera.aspect = window.innerWidth / window.innerHeight;
  //       // 更新摄像机的投影矩阵
  //       camera.updateProjectionMatrix();
  //       // 更新画布大小
  //       renderer.setSize(
  //         window.innerWidth, // 宽度
  //         window.innerHeight // 高度
  //       );
  //       // 更新画布像素比
  //       renderer.setPixelRatio(window.devicePixelRatio);
  //     });

  //     // 监听鼠标双击事件
  //     this.RobotViewRef.addEventListener("dblclick", () => {
  //       // 获取当前状态
  //       const fullscreenElement = document.fullscreenElement;
  //       if (fullscreenElement) {
  //         // 退出全屏
  //         document.exitFullscreen();

  //         return;
  //       }
  //       // 请求画布全屏
  //       renderer.domElement.requestFullscreen();
  //     });
  //   }

  render() {
    return (
      <div
        className="w-full h-full"
        ref={(v) => (this.$robotView = v)}
        id="RobotView"
      >
        R
      </div>
    );
  }
}
