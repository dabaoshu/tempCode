import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const objLoader = new OBJLoader();
// Colors
// 加载石头

export const getRock = async () => {
  const Geometry = await objLoader.loadAsync("assets/rock.obj")
  const rockGeometry = Geometry.children[0].geometry;
  rockGeometry.computeVertexNormals();

  const rock1 = new THREE.BufferGeometry().copy(rockGeometry);
  rock1.scale(0.05, 0.05, 0.02);
  rock1.translate(0.2, 0, 0.1);

  const rock2 = new THREE.BufferGeometry().copy(rockGeometry);
  rock2.scale(0.05, 0.05, 0.05);
  rock2.translate(-0.5, 0.5, 0.2);
  rock2.rotateZ(Math.PI / 2);
  return {
    rock1,
    rock2
  }
}

export const getPlant = async () => {
  // 加载植物
  const Geometry = await objLoader.loadAsync("assets/plant.obj")
  const plantGeometry = Geometry.children[0].geometry;
  plantGeometry.computeVertexNormals();

  const plant = plantGeometry;
  plant.rotateX(Math.PI / 6);
  plant.scale(0.03, 0.03, 0.03);
  plant.translate(-0.5, 0.5, 0);
  return plant
}



