import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const objLoader = new OBJLoader();
// Colors
// 加载石头

export const getRock = async () => {
  const Geometry = await objLoader.loadAsync("assets/rock.obj")
  const rockGeometry = Geometry.children[0].geometry;
  rockGeometry.computeVertexNormals();

  // const rock1 = new THREE.BufferGeometry().copy(rockGeometry);
  // rock1.scale(0.05, 0.05, 0.02);
  // rock1.translate(0.2, 0, 0.1);
  //
  // const rock2 = new THREE.BufferGeometry().copy(rockGeometry);
  // rock2.scale(0.05, 0.05, 0.05);
  // rock2.translate(-0.5, 0.5, 0.2);
  // rock2.rotateZ(Math.PI / 2);
  // return {
  //   rock1,
  //   rock2
  // }


  const rocks = [];
  const rockTemplate = new THREE.BufferGeometry().copy(rockGeometry);
  for (let position of getRandomRockPositions()) {
    const rock = new THREE.BufferGeometry().copy(rockTemplate);
    rock.scale(0.05, 0.05, 0.05);
    rock.translate(position.x, position.y, position.z);
    rocks.push(rock);
  }

  const Geometry2 = await objLoader.loadAsync("assets/plant.obj")
  const plantGeometry = Geometry2.children[0].geometry;
  plantGeometry.computeVertexNormals();
  const plantTemplate = new THREE.BufferGeometry().copy(plantGeometry);
  for (let position of getRandomRockPositions()) {
    const plant = new THREE.BufferGeometry().copy(plantTemplate);
    plant.scale(0.03, 0.03, 0.03);
    plant.translate(position.x, position.y, position.z);
    rocks.push(plant);
  }

  return rocks;
}

export const getPlant = async () => {
  // 加载植物
  const Geometry = await objLoader.loadAsync("assets/plant.obj")
  const plantGeometry = Geometry.children[0].geometry;
  plantGeometry.computeVertexNormals();

  // const plant = plantGeometry;
  // plant.rotateX(Math.PI / 6);
  // plant.scale(0.03, 0.03, 0.03);
  // plant.translate(-0.5, 0.5, 0);
  // return plant

  const plants = [];
  const plantTemplate = new THREE.BufferGeometry().copy(plantGeometry);
  for (let position of getRandomRockPositions()) {
    const plant = new THREE.BufferGeometry().copy(plantTemplate);
    plant.scale(0.03, 0.03, 0.03);
    plant.translate(position.x, position.y, position.z);
    plants.push(plant);
  }
  return plants;
}

// 加载N个石头于随机位置
export const getRandomRockPositions = () => {
  const positions = [];
  for (let i = 0; i < 35; i++) {
    const x = Math.random() * 10 - 5;
    const y = Math.random() * 10 - 5;
    // const z = Math.random() * 10 - 5;
    const z = 0.5;
    positions.push({ x, y, z });
  }
  return positions;
}




