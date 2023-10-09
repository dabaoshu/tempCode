import React, { createRef, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import Tween from "@tweenjs/tween.js";
import { Caustics, Environment, EnvironmentMap, Water, WaterSimulation } from "./model";

// Colors
const black = new THREE.Color("black");
const white = new THREE.Color("white");

const water = new Water();
const scene = new THREE.Scene();
export default class Robot extends React.Component {
  $robotView;
  componentDidMount() {
    this.initializeThreeJS();
    this.addEventListener()
  }

  /**stats */
  initializeStats = () => {
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.$robotView.appendChild(this.stats.domElement);
  }


  /**Create Renderer */
  createRenderer = () => {

  }



  initializeThreeJS() {
    const width = this.$robotView.innerWidth;
    const height = this.$robotView.innerHeight;
    this.initializeStats()
    // 设置水深100米
    const waterPosition = new THREE.Vector3(0, 0, 10);
    const waterSize = 1024;

    // TODO Replace this by a THREE.DirectionalLight and use the provided matrix (check that it's an Orthographic matrix as expected)
    const lightCamera = new THREE.OrthographicCamera(
      -1.2,
      1.2,
      1.2,
      -1.2,
      0,
      2
    );
    lightCamera.position.set(0, 0, 1.5);
    lightCamera.lookAt(0, 0, 0);
    // this.animate();
    // Create Renderer

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
    this.camera.position.set(6, 2, 20);
    this.camera.up.set(0, 0, 1);
    scene.add(this.camera);


    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(width, height);
    this.renderer.autoClear = false;

    const canvas = this.renderer.domElement;
    this.$robotView.appendChild(canvas);
    // Create mouse Controls
    this.controls = new OrbitControls(this.camera, canvas);
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

    console.log("floorGeometry", floorGeometry);
    const objLoader = new OBJLoader();

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

    scene.background = skybox;


    this.waterSimulation = new WaterSimulation();


    this.environmentMap = new EnvironmentMap();
    this.environment = new Environment();
    this.caustics = new Caustics();

    // 创建一个新的相机（第一人称是摄像机）
    this.camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera2.position.set(6, 2, 20);

    // 创建一个新的渲染器（第一人称的视角）
    this.renderer2 = new THREE.WebGLRenderer();
    this.renderer2.setSize(window.innerWidth / 4, window.innerHeight / 4); // 设置渲染器的大小


    this.FirControls = new OrbitControls(this.camera2, canvas);

    // 将渲染器的DOM元素添加到你的HTML页面中
    this.$robotView.appendChild(this.renderer2.domElement);

    // 使用CSS将其定位在左上角
    // this.renderer2.domElement.style.position = 'absolute';
    this.renderer2.domElement.style.width = '1220px';
    this.renderer2.domElement.style.height = '1220px';

    const axesHelper = new THREE.AxesHelper(250);
    axesHelper.setColors('red', 'blue', 'yellow')
    scene.add(axesHelper); //网格模型添加到场景中

    const light1 = new THREE.DirectionalLight(0xffffff, 1); // 设置光源颜色和强度
    light1.position.set(1, 1, 1); // 设置光源位置
    scene.add(light1);

    const loader = new GLTFLoader();
    // 加载船体
    loader.load("models/chuang.glb", function (gltf1) {
      const chuangModel = gltf1.scene;
      // 将模型缩小为原始大小的一半
      chuangModel.scale.set(0.001, 0.001, 0.001);
      scene.add(chuangModel);
    });

    let rebootModel;
    let rebootModelPosition;
    // 加载水下机器人
    loader.load("models/reboot.glb", async (gltf2) => {

      // const response = fetch("http://localhost:5000/api/rov/state", {
      //     method: "GET",
      //     headers: {
      //         "Content-Type": "application/json"
      //     }
      // });
      // console.log(response)
      // console.log("获取初始状态:", data)
      // const [x, y, z, rotationX, rotationY, rotationZ] = data.state_list || []
      rebootModel = gltf2.scene;
      // 将模型缩小为原始大小的一半
      rebootModel.scale.set(0.3, 0.3, 0.3);
      rebootModel.position.set(0, 0, 20);
      // 将模型绕 x 轴旋转 180 度
      rebootModel.rotation.x = Math.PI;
      // rebootModel.rotation.x = rotationX;
      // rebootModel.rotation.y = Math.PI/2;
      // rebootModel.rotation.y = rotationZ;
      // 将摄像头位置设置为与rebootModel相同
      rebootModelPosition = rebootModel.position;
      console.log(this.camera);
      this.camera.position.copy(rebootModelPosition);
      this.camera.position.x += 2;
      this.camera.position.y += 2;
      this.camera.position.z += 2;
      // 将摄像头朝向设置为rebootModel的位置
      this.camera.lookAt(rebootModel.position);
      // 创建一个AxesHelper对象
      var rebootModelAxesHelper = new THREE.AxesHelper(5);

      // 将AxesHelper对象添加到模型的场景中
      rebootModel.add(rebootModelAxesHelper);
      scene.add(rebootModel);
    });



    // 加载石头
    let rock1;
    let rock2;
    const rockLoaded = new Promise((resolve) => {
      objLoader.load("assets/rock.obj", (rockGeometry) => {
        rockGeometry = rockGeometry.children[0].geometry;
        rockGeometry.computeVertexNormals();

        rock1 = new THREE.BufferGeometry().copy(rockGeometry);
        rock1.scale(0.05, 0.05, 0.02);
        rock1.translate(0.2, 0, 0.1);

        rock2 = new THREE.BufferGeometry().copy(rockGeometry);
        rock2.scale(0.05, 0.05, 0.05);
        rock2.translate(-0.5, 0.5, 0.2);
        rock2.rotateZ(Math.PI / 2);

        resolve();
      });
    });

    // 加载植物
    let plant;
    const plantLoaded = new Promise((resolve) => {
      objLoader.load("assets/plant.obj", (plantGeometry) => {
        plantGeometry = plantGeometry.children[0].geometry;
        plantGeometry.computeVertexNormals();

        plant = plantGeometry;
        plant.rotateX(Math.PI / 6);
        plant.scale(0.03, 0.03, 0.03);
        plant.translate(-0.5, 0.5, 0);

        resolve();
      });
    });

    const loaded = [
      // waterSimulation.loaded,
      // water.loaded,
      this.environmentMap.loaded,
      this.environment.loaded,
      this.caustics.loaded,
      // sharkLoaded,
      rockLoaded,
      plantLoaded,
    ];


    function onMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) * 2) / width - 1;
      mouse.y = (-(event.clientY - rect.top) * 2) / height + 1;

      rayCaster.setFromCamera(mouse, camera);

      const intersects = rayCaster.intersectObject(targetMesh);

      for (let intersect of intersects) {
        waterSimulation.addDrop(
          renderer,
          intersect.point.x,
          intersect.point.y,
          0.03,
          0.02
        );
      }
    }
    Promise.all(loaded).then(() => {
      const envGeometries = [floorGeometry, rock1, rock2, plant];

      this.environmentMap.setGeometries(envGeometries);
      this.environment.setGeometries(envGeometries);

      this.environment.addTo(scene);
      scene.add(water.mesh);

      this.caustics.setDeltaEnvTexture(1 / this.environmentMap.size);

      canvas.addEventListener("mousemove", { handleEvent: onMouseMove });

      for (var i = 0; i < 5; i++) {
        this.waterSimulation.addDrop(
          this.renderer,
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
      this.waterSimulation.stepSimulation(this.renderer);

      const waterTexture = this.waterSimulation.target.texture;

      water.setHeightTexture(waterTexture);

      this.environmentMap.render(this.renderer);
      const environmentMapTexture = this.environmentMap.target.texture;

      this.caustics.setTextures(waterTexture, environmentMapTexture);
      this.caustics.render(this.renderer);
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
    this.renderer.setRenderTarget(this.temporaryRenderTarget);
    this.renderer.setClearColor(white, 1);
    this.renderer.clear();

    water.mesh.visible = false;
    this.renderer.render(scene, this.camera);

    water.setEnvMapTexture(this.temporaryRenderTarget.texture);

    // Then render the final scene with the refractive water
    this.renderer.setRenderTarget(null);
    this.renderer.setClearColor(white, 1);
    this.renderer.clear();

    water.mesh.visible = true;
    this.renderer.render(scene, this.camera);

    this.controls.update();
    this.FirControls.update();

    this.stats.end();


    this.renderer2.render(scene, this.camera2);

    window.requestAnimationFrame(this.animate);
  }

  componentWillUnmount() {
    // Clean up resources, remove event listeners, etc. here
    // ...

    // Dispose of Three.js objects to prevent memory leaks
    this.threeRenderer.dispose();
  }

  addEventListener() {
    // 添加窗口变化监听器
    this.$robotView.addEventListener("resize", () => {
      // 更新修改相机比例
      this.camera.aspect = window.innerWidth / window.innerHeight;
      // 更新摄像机的投影矩阵
      this.camera.updateProjectionMatrix();
      // 更新画布大小
      this.renderer.setSize(
        window.innerWidth, // 宽度
        window.innerHeight // 高度
      );
      // 更新画布像素比
      this.renderer.setPixelRatio(window.devicePixelRatio);
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
      this.renderer.domElement.requestFullscreen();
    });
  }

  render() {
    return (
      <div
        className="w-full h-full"
        ref={(v) => (this.$robotView = v)}
        id="RobotView"
      >
      </div>
    );
  }
}
