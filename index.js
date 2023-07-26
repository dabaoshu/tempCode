import * as THREE from 'three'
import * as DAT from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { loadFile } from "./utils"

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.domElement)

const width = window.innerWidth
const height = window.innerHeight

// Colors
const black = new THREE.Color('black')
const white = new THREE.Color('white')

// 设置水深100米
const waterPosition = new THREE.Vector3(0, 0, 10)
const near = 0.
const far = 2.
const waterSize = 1024

// Create directional light
// TODO Replace this by a THREE.DirectionalLight and use the provided matrix (check that it's an Orthographic matrix as expected)
const light = [0., 0., -1.]
const lightCamera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, near, far)
lightCamera.position.set(0., 0., 1.5)
lightCamera.lookAt(0, 0, 0)

// Create Renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100)
camera.position.set(6, 2, 20)
camera.up.set(0, 0, 1)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
renderer.setSize(width, height)
renderer.autoClear = false

const canvas = renderer.domElement
document.body.appendChild( canvas )

// Create mouse Controls
const controls = new OrbitControls(
    camera,
    canvas
)

// controls.target = waterPosition
//
// controls.minPolarAngle = 0
// controls.maxPolarAngle = Math.PI / 2. - 0.1
//
// controls.minDistance = 1.5
// controls.maxDistance = 3.

// Target for computing the water refraction
const temporaryRenderTarget = new THREE.WebGLRenderTarget(width, height)

// Clock
const clock = new THREE.Clock()

// Ray caster
const rayCaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const targetGeometry = new THREE.PlaneGeometry(2, 2)
targetGeometry.attributes.position.array[2] = waterPosition.z

const targetMesh = new THREE.Mesh(targetGeometry)

// Geometries
const waterGeometry = new THREE.PlaneGeometry(20, 20, waterSize, waterSize)

// Environment
const floorGeometry = new THREE.PlaneGeometry(10000, 10000, 1, 1)

console.log("floorGeometry", floorGeometry);
const objLoader = new OBJLoader()

// 加载鲨鱼
let shark
const sharkLoaded = new Promise((resolve) => {
    objLoader.load('assets/WhiteShark.obj', (sharkGeometry) => {
        sharkGeometry = sharkGeometry.children[0].geometry
        sharkGeometry.computeVertexNormals()
        sharkGeometry.scale(0.12, 0.12, 0.12)
        sharkGeometry.rotateX(Math.PI / 2.)
        sharkGeometry.rotateZ(-Math.PI / 2.)
        sharkGeometry.translate(0, 0, 0.4)

        shark = sharkGeometry
        resolve()
    })
})

// 加载石头
let rock1
let rock2
const rockLoaded = new Promise((resolve) => {
    objLoader.load('assets/rock.obj', (rockGeometry) => {
        rockGeometry = rockGeometry.children[0].geometry
        rockGeometry.computeVertexNormals()

        rock1 = new THREE.BufferGeometry().copy(rockGeometry)
        rock1.scale(0.05, 0.05, 0.02)
        rock1.translate(0.2, 0., 0.1)

        rock2 = new THREE.BufferGeometry().copy(rockGeometry)
        rock2.scale(0.05, 0.05, 0.05)
        rock2.translate(-0.5, 0.5, 0.2)
        rock2.rotateZ(Math.PI / 2.)

        resolve()
    })
})

// 加载植物
let plant
const plantLoaded = new Promise((resolve) => {
    objLoader.load('assets/plant.obj', (plantGeometry) => {
        plantGeometry = plantGeometry.children[0].geometry
        plantGeometry.computeVertexNormals()

        plant = plantGeometry
        plant.rotateX(Math.PI / 6.)
        plant.scale(0.03, 0.03, 0.03)
        plant.translate(-0.5, 0.5, 0.)

        resolve()
    })
})

// Skybox
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * 天空盒
 */
const skybox = cubeTextureLoader.load([
    'assets/TropicalSunnyDay_px.jpg', 'assets/TropicalSunnyDay_nx.jpg',
    'assets/TropicalSunnyDay_py.jpg', 'assets/TropicalSunnyDay_ny.jpg',
    'assets/TropicalSunnyDay_pz.jpg', 'assets/TropicalSunnyDay_nz.jpg',
])

scene.background = skybox

/**
 * 水流
 */
class WaterSimulation {

    constructor() {
        this._camera = new THREE.OrthographicCamera(0, 0, 1, 0, 0, 2000);

        this._geometry = new THREE.PlaneGeometry(2, 2);

        this._targetA = new THREE.WebGLRenderTarget(waterSize, waterSize, {type: THREE.FloatType})
        this._targetB = new THREE.WebGLRenderTarget(waterSize, waterSize, {type: THREE.FloatType})
        this.target = this._targetA

        const shadersPromises = [
            loadFile('shaders/simulation/vertex.glsl'),
            loadFile('shaders/simulation/drop_fragment.glsl'),
            loadFile('shaders/simulation/update_fragment.glsl'),
        ]

        this.loaded = Promise.all(shadersPromises)
            .then(
                ([
                    vertexShader,
                     dropFragmentShader,
                     updateFragmentShader
                 ]) => {
                const dropMaterial = new THREE.RawShaderMaterial({
                    uniforms: {
                        center: { value: [0, 0] },
                        radius: { value: 0 },
                        strength: { value: 0 },
                        texture: { value: null },
                    },
                    vertexShader: vertexShader,
                    fragmentShader: dropFragmentShader,
                })

                const updateMaterial = new THREE.RawShaderMaterial({
                    uniforms: {
                        delta: { value: [1 / 216, 1 / 216] },  // TODO: Remove this useless uniform and hardcode it in shaders?
                        texture: { value: null },
                    },
                    vertexShader: vertexShader,
                    fragmentShader: updateFragmentShader,
                })

                this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial)
                this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial)
            })
    }

    // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
    addDrop(renderer, x, y, radius, strength) {
        this._dropMesh.material.uniforms['center'].value = [x, y]
        this._dropMesh.material.uniforms['radius'].value = radius
        this._dropMesh.material.uniforms['strength'].value = strength

        this._render(renderer, this._dropMesh)
    }

    stepSimulation(renderer) {
        this._render(renderer, this._updateMesh)
    }

    _render(renderer, mesh) {
        // Swap textures
        const _oldTarget = this.target
        const _newTarget = this.target === this._targetA ? this._targetB : this._targetA

        const oldTarget = renderer.getRenderTarget()

        renderer.setRenderTarget(_newTarget)

        mesh.material.uniforms['texture'].value = _oldTarget.texture

        // TODO Camera is useless here, what should be done?
        renderer.render(mesh, this._camera)

        renderer.setRenderTarget(oldTarget)

        this.target = _newTarget
    }

}


class Water {

    constructor() {
        this.geometry = waterGeometry

        const shadersPromises = [
            loadFile('shaders/water/vertex.glsl'),
            loadFile('shaders/water/fragment.glsl')
        ]

        this.loaded = Promise.all(shadersPromises)
            .then(([vertexShader, fragmentShader]) => {
                this.material = new THREE.ShaderMaterial({
                    uniforms: {
                        light: { value: light },
                        water: { value: null },
                        envMap: { value: null },
                        skybox: { value: skybox },
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                })
                this.material.extensions = {
                    derivatives: true
                }

                this.mesh = new THREE.Mesh(this.geometry, this.material)
                this.mesh.position.set(waterPosition.x, waterPosition.y, waterPosition.z)
            })
    }

    setHeightTexture(waterTexture) {
        this.material.uniforms['water'].value = waterTexture
    }

    setEnvMapTexture(envMap) {
        this.material.uniforms['envMap'].value = envMap
    }

}


// This renders the environment map seen from the light POV.
// The resulting texture contains (posx, posy, posz, depth) in the colors channels.
class EnvironmentMap {

    constructor() {
        this.size = 1024
        this.target = new THREE.WebGLRenderTarget(this.size, this.size, {type: THREE.FloatType})

        const shadersPromises = [
            loadFile('shaders/environment_mapping/vertex.glsl'),
            loadFile('shaders/environment_mapping/fragment.glsl')
        ]

        this._meshes = []

        this.loaded = Promise.all(shadersPromises)
            .then(([vertexShader, fragmentShader]) => {
                this._material = new THREE.ShaderMaterial({
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                })
            })
    }

    setGeometries(geometries) {
        this._meshes = []

        for (let geometry of geometries) {
            this._meshes.push(new THREE.Mesh(geometry, this._material))
        }
    }

    render(renderer) {
        const oldTarget = renderer.getRenderTarget()

        renderer.setRenderTarget(this.target)
        renderer.setClearColor(black, 0)
        renderer.clear()

        for (let mesh of this._meshes) {
            renderer.render(mesh, lightCamera)
        }

        renderer.setRenderTarget(oldTarget)
    }
}


class Caustics {

    constructor() {
        this.target = new THREE.WebGLRenderTarget(
            waterSize * 3,
            waterSize * 3,
            {type: THREE.FloatType}
        )

        this._waterGeometry = waterGeometry

        const shadersPromises = [
            loadFile('shaders/caustics/water_vertex.glsl'),
            loadFile('shaders/caustics/water_fragment.glsl'),
        ]

        this.loaded = Promise.all(shadersPromises)
            .then(
                ([
                    waterVertexShader,
                     waterFragmentShader
                 ]) => {
                this._waterMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        light: { value: light },
                        env: { value: null },
                        water: { value: null },
                        deltaEnvTexture: { value: null },
                    },
                    vertexShader: waterVertexShader,
                    fragmentShader: waterFragmentShader,
                    transparent: true,
                })

                this._waterMaterial.blending = THREE.CustomBlending

                // Set the blending so that:
                // Caustics intensity uses an additive function
                this._waterMaterial.blendEquation = THREE.AddEquation
                this._waterMaterial.blendSrc = THREE.OneFactor
                this._waterMaterial.blendDst = THREE.OneFactor

                // Caustics depth does not use blending, we just set the value
                this._waterMaterial.blendEquationAlpha = THREE.AddEquation
                this._waterMaterial.blendSrcAlpha = THREE.OneFactor
                this._waterMaterial.blendDstAlpha = THREE.ZeroFactor


                this._waterMaterial.side = THREE.DoubleSide
                this._waterMaterial.extensions = {
                    derivatives: true
                }

                this._waterMesh = new THREE.Mesh(this._waterGeometry, this._waterMaterial)
            })
    }

    setDeltaEnvTexture(deltaEnvTexture) {
        this._waterMaterial.uniforms['deltaEnvTexture'].value = deltaEnvTexture
    }

    setTextures(waterTexture, envTexture) {
        this._waterMaterial.uniforms['env'].value = envTexture
        this._waterMaterial.uniforms['water'].value = waterTexture
    }

    render(renderer) {
        const oldTarget = renderer.getRenderTarget()

        renderer.setRenderTarget(this.target)
        renderer.setClearColor(black, 0)
        renderer.clear()

        renderer.render(this._waterMesh, lightCamera)

        renderer.setRenderTarget(oldTarget)
    }

}


class Environment {

    constructor() {
        const shadersPromises = [
            loadFile('shaders/environment/vertex.glsl'),
            loadFile('shaders/environment/fragment.glsl')
        ]

        this._meshes = []

        this.loaded = Promise.all(shadersPromises).then(
            ([vertexShader, fragmentShader]) => {
            this._material = new THREE.ShaderMaterial({
                uniforms: {
                    light: { value: light },
                    caustics: { value: null },
                    lightProjectionMatrix: { value: lightCamera.projectionMatrix },
                    lightViewMatrix: { value: lightCamera.matrixWorldInverse  }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
            })
        })
    }

    setGeometries(geometries) {
        this._meshes = []

        for (let geometry of geometries) {
            this._meshes.push(new THREE.Mesh(geometry, this._material))
        }
    }

    updateCaustics(causticsTexture) {
        this._material.uniforms['caustics'].value = causticsTexture
    }

    addTo(scene) {
        for (let mesh of this._meshes) {
            scene.add(mesh)
        }
    }

}



const waterSimulation = new WaterSimulation()

const water = new Water()

const environmentMap = new EnvironmentMap()
const environment = new Environment()
const caustics = new Caustics()


// Main rendering loop
function animate() {
    stats.begin()

    // Update the water
    if (clock.getElapsedTime() > 0.032) {
        waterSimulation.stepSimulation(renderer)

        const waterTexture = waterSimulation.target.texture

        water.setHeightTexture(waterTexture)

        environmentMap.render(renderer)
        const environmentMapTexture = environmentMap.target.texture

        caustics.setTextures(waterTexture, environmentMapTexture)
        caustics.render(renderer)
        const causticsTexture = caustics.target.texture

        environment.updateCaustics(causticsTexture)

        clock.start()
    }

    // Render everything but the refractive water
    renderer.setRenderTarget(temporaryRenderTarget)
    renderer.setClearColor(white, 1)
    renderer.clear()

    water.mesh.visible = false
    renderer.render(scene, camera)

    water.setEnvMapTexture(temporaryRenderTarget.texture)

    // Then render the final scene with the refractive water
    renderer.setRenderTarget(null)
    renderer.setClearColor(white, 1)
    renderer.clear()

    water.mesh.visible = true
    renderer.render(scene, camera)

    controls.update()

    stats.end()

    window.requestAnimationFrame(animate)
}

function onMouseMove(event) {
    const rect = canvas.getBoundingClientRect()
    mouse.x = (event.clientX - rect.left) * 2 / width - 1
    mouse.y = - (event.clientY - rect.top) * 2 / height + 1

    rayCaster.setFromCamera(mouse, camera)

    const intersects = rayCaster.intersectObject(targetMesh)

    for (let intersect of intersects) {
        waterSimulation.addDrop(renderer, intersect.point.x, intersect.point.y, 0.03, 0.02)
    }
}

const light1 = new THREE.DirectionalLight(0xffffff, 1); // 设置光源颜色和强度
light1.position.set(1, 1, 1); // 设置光源位置
scene.add(light1);

const loader = new GLTFLoader();
// 加载船体
loader.load('models/chuang.glb', function(gltf1) {
    const chuangModel = gltf1.scene;
    // 将模型缩小为原始大小的一半
    chuangModel.scale.set(0.001, 0.001, 0.001);
    scene.add(chuangModel);
});

// 加载水下机器人
loader.load('models/reboot.glb', function(gltf2) {
    const rebootModel = gltf2.scene;
    // 将模型缩小为原始大小的一半
    rebootModel.scale.set(0.3, 0.3, 0.3);
    rebootModel.position.set(0, 0, 0.5);
    // 将模型绕 x 轴旋转 180 度
    rebootModel.rotation.x = Math.PI;
    scene.add(rebootModel);
});



const loaded = [
    // waterSimulation.loaded,
    // water.loaded,
    environmentMap.loaded,
    environment.loaded,
    caustics.loaded,
    // sharkLoaded,
    rockLoaded,
    plantLoaded,
]

Promise.all(loaded).then(() => {
    const envGeometries = [floorGeometry, rock1, rock2, plant]

    environmentMap.setGeometries(envGeometries)
    environment.setGeometries(envGeometries)

    environment.addTo(scene)
    scene.add(water.mesh)

    caustics.setDeltaEnvTexture(1. / environmentMap.size)

    canvas.addEventListener('mousemove', { handleEvent: onMouseMove })

    for (var i = 0; i < 5; i++) {
        waterSimulation.addDrop(
            renderer,
            Math.random() * 2 - 1, Math.random() * 2 - 1,
            0.03, (i & 1) ? 0.02 : -0.02
        )
    }

    animate()
})


// 添加窗口变化监听器
addEventListener('resize', () => {
    // 更新修改相机比例
    camera.aspect = window.innerWidth / window.innerHeight
    // 更新摄像机的投影矩阵
    camera.updateProjectionMatrix()
    // 更新画布大小
    renderer.setSize(
        window.innerWidth, // 宽度
        window.innerHeight // 高度
    );
    // 更新画布像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})


// 监听鼠标双击事件
addEventListener('dblclick', () => {
    // 获取当前状态
    const fullscreenElement = document.fullscreenElement
    if(fullscreenElement){
        // 退出全屏
        document.exitFullscreen()

        return
    }
    // 请求画布全屏
    renderer.domElement.requestFullscreen()
})