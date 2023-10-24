import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const gltfLoader = new GLTFLoader();



export const createReboot = async () => {
  var group = new THREE.Group();
  const Geometry = await gltfLoader.loadAsync("models/reboot.glb")
  const rebotModel = Geometry.scene;
  rebotModel.scale.set(0.3, 0.3, 0.3);
  // 将模型绕 x 轴旋转 180 度
  rebotModel.rotation.x = Math.PI;
  var rebootModelAxesHelper = new THREE.AxesHelper(10);
  rebootModelAxesHelper.setColors('red', 'blue', 'yellow')
  // 将AxesHelper对象添加到模型的场景中
  rebotModel.add(rebootModelAxesHelper);
  group.add(rebotModel)
  group.position.set(0, 0, 30);

  return group
}

