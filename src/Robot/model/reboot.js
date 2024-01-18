import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const gltfLoader = new GLTFLoader();

export const createReboot = async () => {
  var group = new THREE.Group();
  const Geometry = await gltfLoader.loadAsync("models/reboot.glb");
  const rebotModel = Geometry.scene;
  rebotModel.scale.set(0.3, 0.3, 0.3);
  // 将模型绕 x 轴旋转 180 度
  rebotModel.rotation.x = Math.PI;
  var rebootModelAxesHelper = new THREE.AxesHelper(10);
  rebootModelAxesHelper.setColors("red", "blue", "yellow");
  // 将AxesHelper对象添加到模型的场景中
  rebotModel.add(rebootModelAxesHelper);
  group.add(rebotModel);
  group.position.set(0, 0, 30);

  return group;
};

export class Robot2 {
  constructor(config = { AxesHelper: true }) {
    this.config = config;
    this.group = new THREE.Group();
    this.loadAxesHelper(this.group, 15);
  }

  async loadModel() {
    const Geometry = await gltfLoader.loadAsync("models/reboot.glb");
    this.rebotModel = Geometry.scene;
    this.rebotModel.scale.set(0.3, 0.3, 0.3);
    // 将模型绕 x 轴旋转 180 度
    this.rebotModel.rotation.x = Math.PI;
    // 加载辅助线
    if (this.config.AxesHelper) {
      this.loadAxesHelper(this.rebotModel, 10);
    }
    this.group.add(this.rebotModel);

    this.visual();
    this.loadSpotlight()
    this.group.position.set(0, 0, 30);
  }

  loadAxesHelper = (model, size) => {
    return
    const rebootModelAxesHelper = new THREE.AxesHelper(size);
    rebootModelAxesHelper.setColors("red", "blue", "yellow");
    // 将AxesHelper对象添加到模型的场景中
    model.add(rebootModelAxesHelper);
  };

  /**创建机器人视野 */
  visual = () => {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.35, 100);
    this.camera.up.set(0, -1, 0);
    const lookAtPostion = this.camera.position.clone();
    lookAtPostion.y = lookAtPostion.y - 1;
    this.camera.lookAt(lookAtPostion);
    this.group.add(this.camera);
  };

  /**加载聚光灯 */
  loadSpotlight = () => {
    // 添加水下机器人探照灯，默认是白色光源
    // 创建聚光灯
    const spotlight = new THREE.SpotLight(0xffffff, 4, 100);
    this.spotlight=spotlight
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

  render = (scene) => {
    const targetPostion = this.camera.position.clone();
    // lookAtPostion.y = lookAtPostion.y - 1;
    targetPostion.y = targetPostion.y - 100;
    this.spotlight.target.position.copy(targetPostion);
  };

  getGroup=()=>{
    return this.group
  }

}

/**
 * 
 *  createRobotCamera = () => {
        // const k = 1; //canvas画布宽高比
        // const s = 0.5;//控制left, right, top, bottom范围大小
        // this.robotCamera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 0.01, 100);
        this.robotCamera = new THREE.PerspectiveCamera(45, 1, 0.35, 100);
        //
        this.robotCamera.up.set(0, 1, 0);

        // 将AxesHelper对象添加到模型的场景中
        // const cameraHelper = new THREE.CameraHelper(this.robotCamera);
        // // 辅助线加入 场景
        // scene.add(cameraHelper);

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
        // this.FirControls = new OrbitControls(this.robotCamera, this.robotViewRender.domElement);
        // this.FirControls.movementSpeed = 150;
        // this.FirControls.lookSpeed = 0.1;
        this.$robotView.appendChild(this.robotViewRender.domElement);
        const lookAtPostion = this.robotCamera.position.clone();
        lookAtPostion.y = lookAtPostion.y - 1;
        this.robotCamera.lookAt(lookAtPostion);
        this.rebotModel.add(this.robotCamera)
    };
 */
