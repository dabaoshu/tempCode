// @ts-nocheck
import React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import Tween from '@tweenjs/tween.js';

import {
  Caustics,
  Environment,
  EnvironmentMap,
  Water,
  WaterSimulation,
} from './model';
import { getPlant, getRandomRockPositions, getRock } from './model/Environment';
import { RobotModel } from './model/reboot';
import { RobotExport } from './RobotExport';
import { eventBus, makeHd } from './utils';
import { usePositionStore } from '@/store/usePositionStore';
import styles from './reboot.module.less';
import classnames from 'classnames';
// Colors
const black = new THREE.Color('black');
const white = new THREE.Color('white');

const shipWallLoader = new THREE.TextureLoader();

// 加载船壁纹理
const shipWallTexture = shipWallLoader.load('assets/shipWallTexture.jpg');

//加载图片材质
const shipWallMaterial = new THREE.MeshPhongMaterial({ map: shipWallTexture });
// const material = new THREE.MeshBasicMaterial();
// const shipWallGeometry = new THREE.BoxGeometry(35, 5, 25);
const shipWallGeometry = new THREE.CylinderGeometry(8, 8, 35, 32);
shipWallGeometry.rotateX(Math.PI / 2);
// 创建一个立方体几何体
const shipWall = new THREE.Mesh(shipWallGeometry, shipWallMaterial);
//将船壁设置为暗色调
shipWallMaterial.color = new THREE.Color(0x333333);
shipWall.position.y = -15;

const water = new Water();
const scene = new THREE.Scene();
const gltfLoader = new GLTFLoader();

const rebootModelAxesHelper = new THREE.AxesHelper(10);
rebootModelAxesHelper.setColors('red', 'blue', 'yellow');
// 将AxesHelper对象添加到模型的场景中
// scene.add(rebootModelAxesHelper);

export default class Robot extends React.Component {
  $robotView!: HTMLElement;
  robotExport: RobotExport;
  stats: Stats;
  sceneRenderer: THREE.WebGLRenderer;
  sceneSmallRenderer: THREE.WebGLRenderer;
  sceneCamera: THREE.PerspectiveCamera;
  temporaryRenderTarget: THREE.WebGLRenderTarget<THREE.Texture>;
  clock: THREE.Clock;
  waterSimulation: WaterSimulation;
  environmentMap: EnvironmentMap;
  environment: Environment;
  caustics: Caustics;

  animateUpdateList: any[];
  disposeList: any[];
  constructor(props: any) {
    super(props);
    this.animateUpdateList = [];
    this.disposeList = [];
  }

  state = { mainScene: 'firstRobotViewScene' };

  async componentDidMount() {
    await this.initializeThreeJS();
    this.addEventListener();
  }

  componentWillUnmount(): void {
    this.disposeList.forEach((fn) => fn());
  }

  /**stats */
  initializeStats = () => {
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = 'unset';
    this.stats.domElement.style.right = '0px';
    this.$robotView.appendChild(this.stats.domElement);
  };

  getEnvGeometries = async () => {
    const envGeometries = [];
    const [rockGeometry, plantGeometry] = await Promise.all([
      getRock(),
      getPlant(),
    ]);
    // 随机生成石头和草
    for (let position of getRandomRockPositions()) {
      const rock = new THREE.BufferGeometry().copy(rockGeometry);
      const factor = (Math.random() * 10).toFixed(2) * 0.01;
      rock.scale(factor, factor, factor);
      rock.translate(position.x, position.y, position.z - 12);
      // group.add(rock);
      envGeometries.push(rock);
    }
    for (let position of getRandomRockPositions()) {
      const plant = new THREE.BufferGeometry().copy(plantGeometry);
      const factor = (Math.random() * 10).toFixed(2) * 0.01;
      plant.scale(factor, factor, factor);
      plant.translate(position.x, position.y, position.z - 12);
      // group.add(plant);
      envGeometries.push(plant);
    }
    return envGeometries;
  };

  createSceneViewRender = () => {
    // 创建第一人称视角
    this.sceneRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: document.getElementById('firstRobotViewScene'),
    });

    this.sceneRenderer.autoClear = false;

    makeHd(this.sceneRenderer);
    // 创建第三人称视角
    this.createThirdSceneRender();
  };

  // 创建第三人称视角
  createThirdSceneRender = (showCameraHelper) => {
    const domElement = document.getElementById('robotViewScene') as HTMLElement;
    const sceneSmallRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: domElement,
    });
    makeHd(sceneSmallRenderer);
    const width = domElement.offsetWidth;
    const height = domElement.offsetHeight;
    this.sceneCamera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
    this.sceneCamera.position.set(6, 2, 20);
    this.sceneCamera.up.set(0, 0, 1);
    const sceneOrbitcontrols = new OrbitControls(this.sceneCamera, domElement);

    this.animateUpdateList.push(() => {
      sceneOrbitcontrols.update();
    });
    this.animateUpdateList.push(() => {
      sceneSmallRenderer.render(scene, this.sceneCamera);
    });
    if (showCameraHelper) {
      const cameraHelper2 = new THREE.CameraHelper(this.sceneCamera);
      // 辅助线加入 场景
      scene.add(cameraHelper2);
      scene.add(this.sceneCamera);
    }
  };

  // 创建机器人
  createRobot = async () => {
    const robot = new RobotModel({
      scene: scene,
      position: new THREE.Vector3(0, 0, 24),
      robotEnvViewRender: this.sceneRenderer,
    });
    this.robot = robot;

    await robot.loadModel();
    const rebotModel = robot.getGroup();

    eventBus.on('robot_play', () => {
      if (robot.player.paused) {
        robot.player.paused = false;
      } else {
        robot.player.play();
      }
    });
    eventBus.on('robot_stop', () => {
      robot.player.paused = true;
    });

    // 加入更新队列
    this.animateUpdateList.push(() => {
      robot.render();
    });
    // 加入销毁队列
    this.disposeList.push(() => {
      robot?.dispose();
    });
    usePositionStore.getState().initStore({
      resetX: rebotModel.position.x,
      resetY: rebotModel.position.y,
      resetZ: rebotModel.position.z,
      resetRotX: rebotModel.rotation.x,
      resetRotY: rebotModel.rotation.y,
      resetRotZ: rebotModel.rotation.z,
      time: Date.now(),
    });

    this.robotExport = new RobotExport(
      { rebotModel },
      usePositionStore.getState().pushPosition
    );
  };

  initializeThreeJS = async () => {
    this.initializeStats();
    const width = this.$robotView.offsetWidth;
    const height = this.$robotView.offsetHeight;
    // 设置水深100米
    const waterPosition = new THREE.Vector3(0, 0, 10);
    // Create Renderer
    this.createSceneViewRender();

    // Create mouse Controls
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

    // 创建一个RGBELoader对象
    const rgbeLoader = new RGBELoader();

    // 创建一个PMREMGenerator对象
    const pmremGenerator = new THREE.PMREMGenerator(this.sceneRenderer);
    pmremGenerator.compileEquirectangularShader();

    // 加载HDR图像
    rgbeLoader.load('assets/pic02.hdr', function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = texture;
      // scene.environment = texture;
      texture.dispose();
      pmremGenerator.dispose();
    });
    // Create a texture loader
    // 将立方体添加到场景中
    scene.add(shipWall);
    this.waterSimulation = new WaterSimulation();

    this.environmentMap = new EnvironmentMap();
    this.environment = new Environment();
    this.caustics = new Caustics();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 设置环境光颜色和强度
    scene.add(ambientLight); // 将环境光添加到场景中
    await this.createRobot();

    // 加载石头
    // const {rock1, rock2} = await getRock();
    const envGeometries = await this.getEnvGeometries();
    // const plant = await getPlant();

    const onMouseMove = (event) => {
      const rect = this.sceneRenderer.domElement.getBoundingClientRect();
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
    };

    const loaded = [
      // waterSimulation.loaded,
      // water.loaded,
      this.environmentMap.loaded,
      this.environment.loaded,
      this.caustics.loaded,
      // sharkLoaded,
    ];

    // Update the water
    // this.animateUpdateList.push(() => {});

    Promise.all(loaded).then((res) => {
      this.environmentMap.setGeometries(envGeometries);
      this.environment.setGeometries(envGeometries);

      this.environment.addTo(scene);
      // scene.add(water.mesh);

      this.caustics.setDeltaEnvTexture(1 / this.environmentMap.size);

      this.sceneRenderer.domElement.addEventListener('mousemove', {
        handleEvent: onMouseMove,
      });
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
  };

  animate = () => {
    this.stats.begin();

    // Update the water
    if (this.clock.getElapsedTime() > 0.032) {
      this.waterSimulation.stepSimulation(this.sceneRenderer);

      const waterTexture = this.waterSimulation.target.texture;

      water.setHeightTexture(waterTexture);

      this.environmentMap.render(this.sceneRenderer);
      const environmentMapTexture = this.environmentMap.target.texture;

      // this.caustics.setTextures(waterTexture, environmentMapTexture);
      this.caustics.render(this.sceneRenderer);
      const causticsTexture = this.caustics.target.texture;

      this.environment.updateCaustics(causticsTexture);

      this.clock.start();
    }

    // 更新Tween，即渲染模型运动
    Tween.update();
    // Render everything but the refractive water
    this.sceneRenderer.setRenderTarget(this.temporaryRenderTarget);
    this.sceneRenderer.setClearColor(black, 1);
    this.sceneRenderer.clear();

    water.mesh.visible = false;

    water.setEnvMapTexture(this.temporaryRenderTarget.texture);

    // Then render the final scene with the refractive water
    this.sceneRenderer.setRenderTarget(null);
    this.sceneRenderer.setClearColor(black, 1);
    this.sceneRenderer.clear();

    water.mesh.visible = true;
    this.animateUpdateList.forEach((update) => update());
    this.stats.end();
    window.requestAnimationFrame(this.animate);
  };

  addEventListener() {
    // 添加窗口变化监听器
    window.addEventListener('resize', () => {
      // 更新修改相机比例
      const width = this.$robotView.offsetWidth;
      const height = this.$robotView.offsetHeight;
      this.sceneCamera.aspect = width / height;
      // 更新摄像机的投影矩阵
      this.sceneCamera.updateProjectionMatrix();
      // 更新画布大小
      this.sceneRenderer.setSize(
        width, // 宽度
        height, // 高度
        false
      );
      // 更新画布像素比
      this.sceneRenderer.setPixelRatio(window.devicePixelRatio);
    });

    // 监听鼠标双击事件
    this.$robotView.addEventListener('dblclick', () => {
      // 获取当前状态
      // const fullscreenElement = document.fullscreenElement;
      // if (fullscreenElement) {
      //   // 退出全屏
      //   document.exitFullscreen();
      //   return;
      // }
      // // 请求画布全屏
      // this.$robotView.requestFullscreen();
    });
  }

  setMainScene = (name) => {
    this.setState({ mainScene: name });
  };

  render() {
    const { mainScene } = this.state;
    return (
      <div className="w-full h-full relative">
        <div
          ref={(v) => (this.$robotView = v)}
          id="RobotView"
          className="w-full h-full relative"
        >
          <canvas
            id="robotFirstViewScene"
            className={styles['left_scene_view']}
          ></canvas>
          <canvas
            id="robotViewScene"
            onDoubleClick={(e) => {
              e.stopPropagation();
              this.setMainScene('robotViewScene');
            }}
            className={
              mainScene === 'robotViewScene'
                ? styles['main_scene_view']
                : styles['right_scene_view']
            }
          ></canvas>
          <canvas
            id="firstRobotViewScene"
            onDoubleClick={(e) => {
              e.stopPropagation();
              this.setMainScene('firstRobotViewScene');
            }}
            className={
              mainScene === 'firstRobotViewScene'
                ? styles['main_scene_view']
                : styles['right_scene_view']
            }
          ></canvas>
        </div>
      </div>
    );
  }
}
