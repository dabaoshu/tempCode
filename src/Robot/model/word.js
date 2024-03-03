import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
// 创建一个Three.js场景
const scene = new THREE.Scene();

// 创建一个立方体几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 创建一个材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// 创建一个网格对象
const cube = new THREE.Mesh(geometry, material);
const group = new THREE.Group();

group.add(cube)
group.position.set(2,5, 3)

const camera = new THREE.PerspectiveCamera(45, 1, 0.35, 100);

// 将立方体添加到场景中
scene.add(group);


// 设置立方体的世界坐标位置
cube.position.set(2,5, 3);

// 创建一个点表示世界坐标
const worldPoint = new THREE.Vector3(3, 0, 0);
console.log('cube Point:', cube.position);
console.log('World Point:', worldPoint);

// 将世界坐标转换为局部坐标
const localPoint = cube.worldToLocal(worldPoint);

console.log('Local Point:', localPoint);
console.log('Local Point:', cube.position);


const globalPoint = cube.localToWorld(localPoint);

console.log('global Point:', globalPoint);
//2  5  3
//3  0  0
//1 -5 -3