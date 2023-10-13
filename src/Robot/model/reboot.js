import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const gltfLoader = new GLTFLoader();



export const getReboot = async () => {
  const Geometry = await gltfLoader.loadAsync("models/reboot.glb")
  const rebootModel = Geometry.scene;
  rebootModel.scale.set(0.3, 0.3, 0.3);
  rebootModel.position.set(0, 0, 2);
  // 将模型绕 x 轴旋转 180 度
  rebootModel.rotation.x = Math.PI;
  // rebootModel.rotation.x = rotationX;
  // rebootModel.rotation.y = Math.PI/2;
  // rebootModel.rotation.y = rotationZ;
  var rebootModelAxesHelper = new THREE.AxesHelper(10);
  rebootModelAxesHelper.setColors('red', 'blue', 'yellow')
  // 将AxesHelper对象添加到模型的场景中
  rebootModel.add(rebootModelAxesHelper);
  return rebootModel
}