import React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import Stats from "three/examples/jsm/libs/stats.module";
import Tween from "@tweenjs/tween.js";
import { Caustics, Environment, EnvironmentMap, Water, WaterSimulation } from "./model";
import { getPlant, getRock } from "./model/Environment";
import { loadFile, eventBus } from "./utils";
import { getReboot } from "./model/reboot";
import { RobotExport } from './RobotExport'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
// Colors
const black = new THREE.Color("black");
const white = new THREE.Color("white");

const water = new Water();
const scene = new THREE.Scene();
const gltfLoader = new GLTFLoader();
export default class Robot extends React.Component {
  $robotView;
  async componentDidMount() {
    await this.initializeThreeJS();
    this.addEventListener()
    this.robotExport = new RobotExport(this.rebootModel, this.saveDataCb)
    const fn = async (type) => {
      let action = [];
      console.log("type:", type)
      switch (type) {
        case "start":
          action = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
          this.robotExport.startRun(action, true)
          break;
        case "up":
          action = [0.0, 0.0, 1500.0, 0.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "down":
          action = [0.0, 0.0, -1500.0, 0.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "left":
          action = [0.0, 1500.0, 0.0, 0.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "right":
          action = [0.0, -1500.0, 0.0, 0.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "ahead":
          action = [1500.0, 0.0, 0.0, 0.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "behind":
          action = [-1500.0, 0.0, 0.0, 0.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "roll+":
          action = [0.0, 0.0, 0.0, 800.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "roll-":
          action = [0.0, 0.0, 0.0, -800.0, 0.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "pitch+":
          action = [0.0, 0.0, 0.0, 0.0, 800.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "pitch-":
          action = [0.0, 0.0, 0.0, 0.0, -800.0, 0.0];
          this.robotExport.startRun(action)
          break;
        case "yaw+":
          action = [0.0, 0.0, 0.0, 0.0, 0.0, 800.0];
          this.robotExport.startRun(action)
          break;
        case "yaw-":
          action = [0.0, 0.0, 0.0, 0.0, 0.0, -800.0];
          this.robotExport.startRun(action)
          break;
        case "stop":
          this.robotExport.stop()
          break;
        // 其他case...
      }
      console.log("action:", action)
    };
    eventBus.on("click1", fn);
  }

  saveDataCb = (position) => {
    const { pushPosition } = this.props
    pushPosition(position)
  }

  /**stats */
  initializeStats = () => {
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.domElement.style.position = "absolute"
    this.stats.domElement.style.left = "unset"
    this.stats.domElement.style.right = "0px"
    this.$robotView.appendChild(this.stats.domElement);
  }


  /**Create Renderer */
  createRenderer = () => {

  }

  createRobotCamera = (rebootModelPosition) => {
    // 创建一个新的相机（第一人称是摄像机）
    this.robotCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.robotCamera.position.set(6, 2, 20);
    // this.robotCamera = new THREE.PerspectiveCamera(75, 1, 0.01, 100);
    // this.robotCamera.position.copy(rebootModelPosition);
    // this.robotCamera.up.set(0, 0, 1)
    // // const lookAtPostion = this.robotCamera.position.clone()
    // // lookAtPostion.x = -lookAtPostion.x
    // // lookAtPostion.y = lookAtPostion.y + 10
    // this.robotCamera.position.y = this.robotCamera.position.y - 1
    // this.robotCamera.lookAt(rebootModelPosition.x, rebootModelPosition.y - 1, rebootModelPosition.z);
    // console.log(rebootModelPosition);
    // // this.robotCamera.lookAt(0,0,0)
    // console.log("robotCamera", this.robotCamera.position);
    // // console.log("lookAtPostion", lookAtPostion);
    // const cameraHelper = new THREE.CameraHelper(this.robotCamera)
    // // 辅助线加入 场景
    // scene.add(cameraHelper)
    // 创建一个新的渲染器（第一人称的视角）
    this.robotViewRender = new THREE.WebGLRenderer();
    // 使用CSS将其定位在左上角
    this.robotViewRender.domElement.style.position = 'absolute';
    this.robotViewRender.domElement.style.top = '0px';
    this.robotViewRender.domElement.style.height = '25%';
    this.robotViewRender.domElement.style.width = '25%';
    this.robotViewRender.domElement.style.minHeight = '100px';
    this.robotViewRender.domElement.style.maxHeight = '300px';
    this.robotViewRender.domElement.style.minWidth = '300px';
    this.robotViewRender.domElement.style.maxWidth = '300px';
    // 将渲染器的DOM元素添加到你的HTML页面中
    this.FirControls = new OrbitControls(this.robotCamera, this.sceneRenderer.domElement);
    // this.FirControls = new FirstPersonControls(this.robotCamera, this.robotViewRender.domElement);
    // this.FirControls.movementSpeed = 150;
    // this.FirControls.lookSpeed = 0.1;
    this.$robotView.appendChild(this.robotViewRender.domElement);
  }

  initializeThreeJS = async () => {
    const width = this.$robotView.offsetWidth;
    const height = this.$robotView.offsetHeight;
    this.initializeStats()
    // 设置水深100米
    const waterPosition = new THREE.Vector3(0, 0, 10);

    // this.animate();
    // Create Renderer

    this.sceneCamera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
    this.sceneCamera.position.set(6, 2, 20);
    this.sceneCamera.up.set(0, 0, 1);
    // const cameraHelper2 = new THREE.CameraHelper(this.sceneCamera)
    // // 辅助线加入 场景
    // scene.add(cameraHelper2)
    scene.add(this.sceneCamera);


    this.sceneRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.sceneRenderer.setSize(width, height);
    this.sceneRenderer.autoClear = false;

    const canvas = this.sceneRenderer.domElement;
    this.$robotView.appendChild(canvas);
    // Create mouse Controls
    this.orbitcontrols = new OrbitControls(this.sceneCamera, canvas);
    // Target for computing the water refraction
    this.temporaryRenderTarget = new THREE.WebGLRenderTarget(width, height);

    // Clock
    this.clock = new THREE.Clock();

    // Ray caster
    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const targetGeometry = new THREE.PlaneGeometry(2, 2);
    targetGeometry.attributes.position.array[2] = waterPosition.z;

    const targetMesh = new THREE.Mesh(targetGeometry);


    // Environment
    const floorGeometry = new THREE.PlaneGeometry(10000, 10000, 1, 1);
    console.log(floorGeometry);
    // Skybox
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    /**
      * 天空盒
     */
    const skybox = cubeTextureLoader.load([
      "assets/TropicalSunnyDay_px.jpg",
      "assets/TropicalSunnyDay_nx.jpg",
      "assets/TropicalSunnyDay_py.jpg",
      "assets/TropicalSunnyDay_ny.jpg",
      "assets/TropicalSunnyDay_pz.jpg",
      "assets/TropicalSunnyDay_nz.jpg",
    ]);

    // 创建一个RGBELoader对象
    const rgbeLoader = new RGBELoader();

  // 创建一个PMREMGenerator对象
    const pmremGenerator = new THREE.PMREMGenerator(this.sceneRenderer);
    pmremGenerator.compileEquirectangularShader();

  // 加载HDR图像
    rgbeLoader.load('pic02.hdr', function (texture) {
      console.log("texture: ", texture)
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = texture;
      // scene.environment = texture;
      texture.dispose();
      pmremGenerator.dispose();
    });

    scene.background = skybox;

    this.waterSimulation = new WaterSimulation();


    this.environmentMap = new EnvironmentMap();
    this.environment = new Environment();
    this.caustics = new Caustics();



    const axesHelper = new THREE.AxesHelper(250);
    axesHelper.setColors('red', 'blue', 'yellow')
    scene.add(axesHelper); //网格模型添加到场景中

    const light1 = new THREE.DirectionalLight(0xffffff, 1); // 设置光源颜色和强度
    light1.position.set(1, 1, 1); // 设置光源位置
    // light1.target.position.set(-5, 0, 0)
    scene.add(light1);
    // scene.add(light1.target)

    // // 加载船体
    // gltfLoader.load("models/chuang.glb", function (gltf1) {
    //   const chuangModel = gltf1.scene;
    //   // 将模型缩小为原始大小的一半
    //   chuangModel.scale.set(0.001, 0.001, 0.001);
    //   scene.add(chuangModel);
    // });

    // 创建一个立方体几何体
    const geometry = new THREE.BoxGeometry(35, 5, 25);

// 创建一个材质
    const material = new THREE.MeshBasicMaterial({color: 0x210707});

// 创建一个网格（Mesh）对象
    const cube = new THREE.Mesh(geometry, material);

    cube.position.y = 15;

// 将立方体添加到场景中
    scene.add(cube);

    // let rebootModel;
    // 加载水下机器人

    this.rebootModel = await getReboot()
    const rebootModelPosition = this.rebootModel.position;
    const { initPosition } = this.props
    let resetX = this.rebootModel.position.x
    let resetY = this.rebootModel.position.y
    let resetZ = this.rebootModel.position.z
    let resetRotX = this.rebootModel.rotation.x
    let resetRotY = this.rebootModel.rotation.y
    let resetRotZ = this.rebootModel.rotation.z
    initPosition({
      resetX, resetY, resetZ, resetRotX, resetRotY, resetRotZ,
      time: Date.now()
    })
    this.sceneCamera.position.copy(rebootModelPosition);
    const f = 10
    this.sceneCamera.position.x += f;
    this.sceneCamera.position.y += f;
    this.sceneCamera.position.z += f;
    // console.log(this.sceneCamera.position);

    this.createRobotCamera(rebootModelPosition)


    // 将AxesHelper对象添加到模型的场景中
    scene.add(this.rebootModel);

    // 加载石头
    const { rock1, rock2 } = await getRock()
    const plant = await getPlant()


    const onMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) * 2) / width - 1;
      mouse.y = (-(event.clientY - rect.top) * 2) / height + 1;

      rayCaster.setFromCamera(mouse, this.sceneCamera);

      const intersects = rayCaster.intersectObject(targetMesh);

      for (let intersect of intersects) {
        this.waterSimulation.addDrop(
          this.sceneRenderer,
          intersect.point.x,
          intersect.point.y,
          0.03,
          0.02
        );
      }
    }


    const loaded = [
      // waterSimulation.loaded,
      // water.loaded,
      this.environmentMap.loaded,
      this.environment.loaded,
      this.caustics.loaded,
      // sharkLoaded,
    ];
    Promise.all(loaded).then((res) => {
      const envGeometries = [rock1, rock2, plant];

      this.environmentMap.setGeometries(envGeometries);
      this.environment.setGeometries(envGeometries);

      this.environment.addTo(scene);
      scene.add(water.mesh);

      this.caustics.setDeltaEnvTexture(1 / this.environmentMap.size);

      canvas.addEventListener("mousemove", { handleEvent: onMouseMove });
      // console.log(this.waterSimulation);
      for (var i = 0; i < 5; i++) {
        this.waterSimulation.addDrop(
          this.sceneRenderer,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          0.03,
          i & 1 ? 0.02 : -0.02
        );
      }

      this.animate();
    });
  }

  animate = () => {
    this.stats.begin();


    // Update the water
    if (this.clock.getElapsedTime() > 0.032) {
      this.waterSimulation.stepSimulation(this.sceneRenderer);

      const waterTexture = this.waterSimulation.target.texture;

      water.setHeightTexture(waterTexture);

      this.environmentMap.render(this.sceneRenderer);
      const environmentMapTexture = this.environmentMap.target.texture;

      this.caustics.setTextures(waterTexture, environmentMapTexture);
      this.caustics.render(this.sceneRenderer);
      const causticsTexture = this.caustics.target.texture;

      this.environment.updateCaustics(causticsTexture);

      this.clock.start();
    }

    // 更新Tween，即渲染模型运动
    Tween.update();
    // camera.position.copy(rebootModelPosition);
    // camera.position.x += 2;
    // camera.position.y += 2;
    // camera.position.z += 2;

    // Render everything but the refractive water
    this.sceneRenderer.setRenderTarget(this.temporaryRenderTarget);
    this.sceneRenderer.setClearColor(white, 1);
    this.sceneRenderer.clear();

    water.mesh.visible = false;
    this.sceneRenderer.render(scene, this.sceneCamera);

    water.setEnvMapTexture(this.temporaryRenderTarget.texture);

    // Then render the final scene with the refractive water
    this.sceneRenderer.setRenderTarget(null);
    this.sceneRenderer.setClearColor(white, 1);
    this.sceneRenderer.clear();

    water.mesh.visible = true;
    this.sceneRenderer.render(scene, this.sceneCamera);

    this.orbitcontrols.update();
    this.FirControls.update();

    this.stats.end();


    this.robotViewRender.render(scene, this.robotCamera);

    window.requestAnimationFrame(this.animate);
  }

  componentWillUnmount() {
    // Clean up resources, remove event listeners, etc. here
    // ...

    // Dispose of Three.js objects to prevent memory leaks
    // this.threeRenderer.dispose();
  }

  addEventListener() {
    // 添加窗口变化监听器
    window.addEventListener("resize", () => {
      // 更新修改相机比例
      const width = this.$robotView.offsetWidth;
      const height = this.$robotView.offsetHeight;
      this.sceneCamera.aspect = width / height;
      // 更新摄像机的投影矩阵
      this.sceneCamera.updateProjectionMatrix();
      // 更新画布大小
      this.sceneRenderer.setSize(
        width, // 宽度
        height // 高度
      );
      // 更新画布像素比
      this.sceneRenderer.setPixelRatio(window.devicePixelRatio);
    });

    // 监听鼠标双击事件
    this.$robotView.addEventListener("dblclick", () => {
      // 获取当前状态
      const fullscreenElement = document.fullscreenElement;
      if (fullscreenElement) {
        // 退出全屏
        document.exitFullscreen();

        return;
      }
      // 请求画布全屏
      this.sceneRenderer.domElement.requestFullscreen();
    });
  }

  render() {
    return (
      <div
        className="w-full h-full relative"
        ref={(v) => (this.$robotView = v)}
        id="RobotView"
      >
      </div>
    );
  }
}
