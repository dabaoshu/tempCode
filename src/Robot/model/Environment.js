import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const objLoader = new OBJLoader();
// Colors
// 加载石头

export const getRock = async () => {
// 加载obj文件，并将其赋值给变量Geometry
  const Geometry = await objLoader.loadAsync("assets/rock.obj")
  // 获取Geometry的第一个子元素的geometry属性，并将其赋值给变量rockGeometry
  const rockGeometry = Geometry.children[0].geometry;
  // 计算rockGeometry的顶点法向量
  rockGeometry.computeVertexNormals();
  return rockGeometry
}

export const getPlant = async () => {
  // 加载植物
  const Geometry = await objLoader.loadAsync("assets/plant.obj")
  const plantGeometry = Geometry.children[0].geometry;
  plantGeometry.computeVertexNormals();
  return plantGeometry
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



