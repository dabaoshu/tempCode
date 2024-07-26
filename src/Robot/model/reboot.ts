import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import * as dat from 'dat.gui';
// import "./word";
import { guiContainerId } from "@/utils/dom";
const gltfLoader = new GLTFLoader();

export class RobotModel {
  group: THREE.Group<THREE.Object3DEventMap>
  rebotModel?: THREE.Group<THREE.Object3DEventMap>
  mixer?: THREE.AnimationMixer
  player: any;
  camera?: THREE.PerspectiveCamera
  robotEnvViewRender?: THREE.WebGLRenderer
  envCamera?: THREE.PerspectiveCamera
  envRobotOrbitcontrols?: OrbitControls
  disposeList: any[] = []
  updateList: any[] = []
  constructor(public config: {
    AxesHelper: boolean,
    scene: THREE.Scene,
    position: THREE.Vector3,
    robotEnvViewRender: THREE.WebGLRenderer,
  }) {
    this.config = {
      ...{
        AxesHelper: true,
        scene: undefined,
        position: new THREE.Vector3(0, 0, 0),
        robotEnvViewRender: undefined,
      },
      ...config,
    };

    this.group = new THREE.Group();
    this.loadAxesHelper(this.group, 15);
    this.disposeList = []
  }

  addActionGui = (model) => {
    // model.rotation.y -= THREE.MathUtils.degToRad(-60)
    const gui = new dat.GUI({
      autoPlace: false,
    });
    const guiContainer = document.getElementById(guiContainerId);
    guiContainer!.appendChild(gui.domElement);
    gui.domElement.classList.add('customer-dat-gui')

    const bone = model.getObjectByName('Bone')
    const bone1 = model.getObjectByName('Bone001')
    const bone2 = model.getObjectByName('Bone002')
    const bone3 = model.getObjectByName('Bone003')
    // const bone4 = model.getObjectByName('Bone004')
    const bone5 = model.getObjectByName('Bone005')
    const bone6 = model.getObjectByName('Bone006')
    const bone7 = model.getObjectByName('Bone007')
    const bone8 = model.getObjectByName('Bone008')

    const bone9 = model.getObjectByName('Bone009')
    const bone11 = model.getObjectByName('Bone011')

    gui.add(bone1.rotation, 'z', -0.2, 1.8, 0.1).name('关节1')
    gui.add(bone2.rotation, 'x', -3.2, -1.6, 0.1).name('关节2')
    gui.add(bone3.rotation, 'x', -4, -1.6, 0.1).name('关节3')
    // gui.add(bone4.rotation, 'z', 1.5, 4.7, 0.1).name('关节4')
    gui.add(bone5.rotation, 'z', -1.6, 1.6, 0.1).name('关节5')
    gui.add(bone6.rotation, 'x', -1.6, 0, 0.1).name('关节6')
    gui.add(bone7.rotation, 'y', -2, 2, 0.1).name('关节7')
    gui.add(bone8.rotation, 'z', -0.4, 0.4, 0.1).name('关节8')

    const leftClip = gui.add(bone9.rotation, 'z', 0.6, 1.8, 0.01).name('夹')
    const rightClip = gui.add(bone11.rotation, 'y', 0, 0.9, 0.01).name('夹2').remove()
    leftClip.onChange(value => {
      const leftDefault = 0.91
      const count = value - leftDefault
      const rightDefault = 0.65
      rightClip.setValue(rightDefault - count)
    })
    const skeletonHelper = new THREE.SkeletonHelper(bone)
    this.config.scene.add(skeletonHelper)
    this.disposeList.push(() => {
      gui.destroy()
    })
    return skeletonHelper
  }

  async loadModel() {
    const Geometry = await gltfLoader.loadAsync("models/reboot.glb");
    this.rebotModel = Geometry.scene;
    this.addActionGui(this.rebotModel)

    this.rebotModel.name = "robotScene";


    this.rebotModel.scale.set(0.3, 0.3, 0.3);
    // 将模型绕 x 轴旋转 180 度

    this.rebotModel.rotation.x = Math.PI / 2;
    this.mixer = new THREE.AnimationMixer(this.rebotModel);

    this.player = this.mixer.clipAction(Geometry.animations[0]);
    this.group.add(this.rebotModel);
    // const cylinderGeometry = new THREE.CylinderGeometry(2, 1, 3, 32);

    // const cylinderMaterial = new THREE.MeshBasicMaterial({
    //   color: 0xffffff,
    //   transparent: true,
    //   opacity: 0.5,
    //   emissive: 0xffffff, // 设置发光颜色
    // });

    // const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    // this.group.add(cylinderMesh);
    this.createCamera();

    // this.createEnvCameraControls()
    this.loadSpotlight();
    this.group.position.set(
      this.config.position.x,
      this.config.position.y,
      this.config.position.z
    );
    this.createEnv();

    this.config.scene.add(this.group);


    // 加载辅助线
    if (this.config.AxesHelper) {
      this.loadAxesHelper(this.rebotModel, 10);
    }
  }

  loadAxesHelper = (model, size) => {
    return;
    const rebootModelAxesHelper = new THREE.AxesHelper(size);
    rebootModelAxesHelper.setColors("red", "blue", "yellow");
    // 将AxesHelper对象添加到模型的场景中
    model.add(rebootModelAxesHelper);
  };

  /**创建机器人的第一人视野 */
  createCamera = () => {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.35, 100);
    this.camera.name = "robotCamera";
    this.camera.up.set(0, -1, 0);
    this.camera.position.set(0, -1, 0)
    const lookAtPostion = this.rebotModel!.position.clone();
    lookAtPostion.y = lookAtPostion.y - 1;
    this.camera.lookAt(lookAtPostion);
    this.group.add(this.camera);
    const domElement = document.getElementById('robotFirstViewScene') as HTMLElement;
    const robotViewRender = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: domElement,
    });
    this.updateList.push(() => {
      if (robotViewRender) {
        robotViewRender.render(this.config.scene, this.camera);
      }
    })
  };

  createEnv = () => {
    this.createEnvCamera();
    this.robotEnvViewRender =
      this.config.robotEnvViewRender
    // createViewRender({
    //   position: "absolute",
    //   top: "0px",
    //   right: "0px",
    //   height: "25%",
    //   width: "25%",
    //   minHeight: "100px",
    //   maxHeight: "300px",
    //   minWidth: "100px",
    //   maxWidth: "300px",
    // });
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
    this.updateList.push(() => {
      if (this.envRobotOrbitcontrols) {
        this.envRobotOrbitcontrols.update()
      }
    })
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
    spotlight.angle = Math.PI / 8; // 缩小光斑角度
    spotlight.penumbra = 0.5; // 轻微软化边缘
    //给水下机器人的正前方设置探照灯
    spotlight.position.set(
      this.group.position.x,
      this.group.position.y - 0.1,
      this.group.position.z
    );
    const targetPostion = this.camera.position.clone();
    // lookAtPostion.y = lookAtPostion.y - 1;
    targetPostion.y = targetPostion.y - 100;
    spotlight.target.position.copy(targetPostion);
    console.log(spotlight);
    //将探照灯添加到场景中
    // 将聚光灯添加到场景中
    this.group.add(spotlight);
    this.group.add(spotlight.target);
    // const spotLightHelper = new THREE.SpotLightHelper(this.spotlight);
    // this.config.scene.add(spotLightHelper);
    this.updateList.push(() => {
      const targetPostion = this.camera.position.clone();
      // lookAtPostion.y = lookAtPostion.y - 1;
      targetPostion.y = targetPostion.y - 100;
      spotlight.target.position.copy(targetPostion);
    })
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

  };

  playerUpdate = () => {
    if (this.player && this.mixer) {
      this.mixer.update(0.01);
    }
  }

  render = () => {

    this.cameraUpdate();
    this.viewRenderUpdate();
    this.updateList.forEach(fn => {
      fn()
    });
    this.playerUpdate();

  };

  getGroup = () => {
    return this.group;
  };

  dispose = () => {
    this.disposeList.forEach(fn => fn())
  }
}
