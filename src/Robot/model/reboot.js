import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
// import "./word";
import { createViewRender } from "../utils";
const gltfLoader = new GLTFLoader();

export class RobotModel {
  constructor(config) {
    this.config = {
      ...{
        AxesHelper: true,
        scene: undefined,
        position: new THREE.Vector3(0, 0, 0),
        parentDom: null,
        robotEnvViewRender: undefined,
      },
      ...config,
    };

    this.group = new THREE.Group();
    this.loadAxesHelper(this.group, 15);
    window.cs2 = this;
  }

  async loadModel() {
    const Geometry = await gltfLoader.loadAsync("models/reboot.glb");
    this.rebotModel = Geometry.scene;
    this.rebotModel.name = "robotScene";
    this.rebotModel.scale.set(0.3, 0.3, 0.3);
    // 将模型绕 x 轴旋转 180 度
    this.rebotModel.rotation.x = Math.PI;
    // 加载辅助线
    if (this.config.AxesHelper) {
      this.loadAxesHelper(this.rebotModel, 10);
    }
    this.group.add(this.rebotModel);
    this.createCamera();

    // this.createEnvCameraControls()
    this.loadSpotlight();
    this.group.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.createEnv();

    this.config.parentDom.appendChild(this.robotViewRender.domElement);
    this.config.scene.add(this.group);
  }

  loadAxesHelper = (model, size) => {
    return;
    const rebootModelAxesHelper = new THREE.AxesHelper(size);
    rebootModelAxesHelper.setColors("red", "blue", "yellow");
    // 将AxesHelper对象添加到模型的场景中
    model.add(rebootModelAxesHelper);
  };

  /**创建机器人视野 */
  createCamera = () => {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.35, 100);
    this.camera.name = "robotCamera";
    this.camera.up.set(0, -1, 0);
    const lookAtPostion = this.rebotModel.position.clone();
    lookAtPostion.y = lookAtPostion.y - 1;
    this.camera.lookAt(lookAtPostion);
    this.group.add(this.camera);

    this.robotViewRender = createViewRender({
      position: "absolute",
      top: 0,
      height: "25%",
      width: "25%",
      minHeight: "100px",
      maxHeight: "300px",
      minWidth: "100px",
      maxWidth: "300px",
    });
  };

  createEnv = () => {
    this.createEnvCamera();
    this.robotEnvViewRender =
      this.config.robotEnvViewRender ||
      createViewRender({
        position: "absolute",
        top: "0px",
        right: "0px",
        height: "25%",
        width: "25%",
        minHeight: "100px",
        maxHeight: "300px",
        minWidth: "100px",
        maxWidth: "300px",
      });
    this.createEnvCameraControls();
  };

  /**添加到世界场景 */
  createEnvCamera = () => {
    this.envCamera = new THREE.PerspectiveCamera(45, 1, 0.35, 50);
    this.envCamera.name = "envRobotCamera";
    const lookAtPostion = this.group.position.clone();
    this.envCamera.up.set(0, 0, 1);
    this.envCamera.position.set(
      lookAtPostion.x + 0,
      lookAtPostion.y + 2.7,
      lookAtPostion.z + 0.45
    );
    this.envCamera.lookAt(lookAtPostion);
    // this.group.add(this.envCamera);
    // 将AxesHelper对象添加到模型的场景中
    const cameraHelper = new THREE.CameraHelper(this.envCamera);
    // 辅助线加入 场景
    this.config.scene.add(this.envCamera);
    // this.config.scene.add(cameraHelper);
    // this.config.scene.add(this.envCamera);
  };

  /*环境相机控制器*/
  createEnvCameraControls = () => {
    3;
    this.envRobotOrbitcontrols = new OrbitControls(
      this.envCamera,
      this.robotEnvViewRender.domElement
    );
    // this.envRobotOrbitcontrols.enableDamping = true;
    this.updateEnvCamera();
    //  自动旋转
    this.envRobotOrbitcontrols.autoRotate = false;
    // 启用或禁用键盘控制。
    this.envRobotOrbitcontrols.enableKeys = false;
    // 缩放
    // this.envRobotOrbitcontrols.enableZoom = false;
    // 设置相机距离原点的最近距离
    // this.envRobotOrbitcontrols.minDistance = 3;
    //  设置相机距离原点的最远距离
    // this.envRobotOrbitcontrols.maxDistance  =3
    // this.envRobotOrbitcontrols.enablePan = false;

    // this.envRobotOrbitcontrols.minZoom = 0.5;
    // this.envRobotOrbitcontrols.maxZoom = 2;
    // this.envRobotOrbitcontrols.minPolarAngle = 0;
    // this.envRobotOrbitcontrols.maxPolarAngle = Math.PI / 2;

    // this.envRobotOrbitcontrols.minAzimuthAngle = -Math.PI * (100 / 180);
    // this.envRobotOrbitcontrols.maxAzimuthAngle = Math.PI * (100 / 180);
    // const cameraHelper = new THREE.CameraHelper(this.envCamera);
    // 辅助线加入 场景
    this.envRobotOrbitcontrols.addEventListener("change", (obj) => {
      this.updateEnvCamera();
    });
  };

  updateEnvCamera = () => {
    const position = this.group.position.clone();
    if (this.envRobotOrbitcontrols) {
      this.envRobotOrbitcontrols.target.set(position.x, position.y, position.z);
    }
  };

  /**加载聚光灯 */
  loadSpotlight = () => {
    // 添加水下机器人探照灯，默认是白色光源
    // 创建聚光灯
    const spotlight = new THREE.SpotLight(0xffffff, 4, 100);
    this.spotlight = spotlight;
    spotlight.angle = Math.PI / 8; // 缩小光斑角度
    spotlight.penumbra = 0.5; // 轻微软化边缘
    //给水下机器人的正前方设置探照灯
    spotlight.position.set(
      this.group.position.x,
      this.group.position.y,
      this.group.position.z + 1
    );
    const targetPostion = this.camera.position.clone();
    // lookAtPostion.y = lookAtPostion.y - 1;
    targetPostion.y = targetPostion.y - 100;
    spotlight.target.position.copy(targetPostion);
    //将探照灯添加到场景中
    // 将聚光灯添加到场景中
    this.group.add(spotlight);
    this.group.add(spotlight.target);
  };

  controlsUpdate = () => {
    if (this.envRobotOrbitcontrols) {
      this.envRobotOrbitcontrols.update();
    }
  };

  cameraUpdate = () => {
    if (this.envCamera) {
      this.updateEnvCamera();
    }
  };

  viewRenderUpdate = () => {
    if (this.robotEnvViewRender) {
      this.robotEnvViewRender.render(this.config.scene, this.envCamera);
    }
    if (this.robotViewRender) {
      this.robotViewRender.render(this.config.scene, this.camera);
    }
  };

  render = () => {
    const targetPostion = this.camera.position.clone();
    // lookAtPostion.y = lookAtPostion.y - 1;
    targetPostion.y = targetPostion.y - 100;
    this.spotlight.target.position.copy(targetPostion);
    this.controlsUpdate();
    this.cameraUpdate();
    this.viewRenderUpdate();
  };

  getGroup = () => {
    return this.group;
  };
}
