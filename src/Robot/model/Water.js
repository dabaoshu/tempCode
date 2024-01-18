import * as THREE from "three";
import { loadFile } from "../utils";
const black = new THREE.Color("black");
// Skybox
// 创建一个CubeTextureLoader对象
const cubeTextureLoader = new THREE.CubeTextureLoader();
/**
 * 天空盒
 */
const skybox = cubeTextureLoader.load([
  "assets/TropicalSunnyDay_px.jpg",
  "assets/TropicalSunnyDay_nx.jpg",
  "assets/TropicalSunnyDay_py.jpg",
  "assets/TropicalSunnyDay_ny.jpg",
  "assets/TropicalSunnyDay_pz.jpg",
  "assets/TropicalSunnyDay_nz.jpg",
]);

const light = [0, 0, -1];
export const lightCamera = new THREE.OrthographicCamera(
    -1.2,
    1.2,
    1.2,
    -1.2,
    0,
    2
);
lightCamera.position.set(0, 0, 1.5);
lightCamera.lookAt(0, 0, 0);


// 设置水深100米
const waterPosition = new THREE.Vector3(0, 0, 10);
const waterSize = 1024;

// Geometries
const waterGeometry = new THREE.PlaneGeometry(20, 20, waterSize, waterSize);
/**
 * 水流
 */
export class WaterSimulation {
  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 0, 1, 0, 0, 2000);

    this._geometry = new THREE.PlaneGeometry(2, 2);

    this._targetA = new THREE.WebGLRenderTarget(waterSize, waterSize, {
      type: THREE.FloatType,
    });
    this._targetB = new THREE.WebGLRenderTarget(waterSize, waterSize, {
      type: THREE.FloatType,
    });
    this.target = this._targetA;

    const shadersPromises = [
      loadFile("shaders/simulation/vertex.glsl"),
      loadFile("shaders/simulation/drop_fragment.glsl"),
      loadFile("shaders/simulation/update_fragment.glsl"),
    ];

    this.loaded = Promise.all(shadersPromises).then(
      ([vertexShader, dropFragmentShader, updateFragmentShader]) => {
        const dropMaterial = new THREE.RawShaderMaterial({
          uniforms: {
            center: { value: [0, 0] },
            radius: { value: 0 },
            strength: { value: 0 },
            texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: dropFragmentShader,
        });

        const updateMaterial = new THREE.RawShaderMaterial({
          uniforms: {
            delta: { value: [1 / 216, 1 / 216] }, // TODO: Remove this useless uniform and hardcode it in shaders?
            texture: { value: null },
          },
          vertexShader: vertexShader,
          fragmentShader: updateFragmentShader,
        });

        this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
        this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
      }
    );
  }

  // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
  addDrop(renderer, x, y, radius, strength) {
    this._dropMesh.material.uniforms["center"].value = [x, y];
    this._dropMesh.material.uniforms["radius"].value = radius;
    this._dropMesh.material.uniforms["strength"].value = strength;

    this._render(renderer, this._dropMesh);
  }

  stepSimulation(renderer) {
    this._render(renderer, this._updateMesh);
  }

  _render(renderer, mesh) {
    // Swap textures
    const _oldTarget = this.target;
    const _newTarget =
      this.target === this._targetA ? this._targetB : this._targetA;

    const oldTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(_newTarget);

    mesh.material.uniforms["texture"].value = _oldTarget.texture;

    // TODO Camera is useless here, what should be done?
    renderer.render(mesh, this._camera);

    renderer.setRenderTarget(oldTarget);

    this.target = _newTarget;
  }
}

export class Water {
  constructor() {
    this.geometry = waterGeometry;

    const shadersPromises = [
      loadFile("shaders/water/vertex.glsl"),
      loadFile("shaders/water/fragment.glsl"),
    ];

    this.loaded = Promise.all(shadersPromises).then(
      ([vertexShader, fragmentShader]) => {
        this.material = new THREE.ShaderMaterial({
          uniforms: {
            light: { value: light },
            water: { value: null },
            envMap: { value: null },
            skybox: { value: skybox },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        });
        this.material.extensions = {
          derivatives: true,
        };

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(
          waterPosition.x,
          waterPosition.y,
          waterPosition.z
        );
      }
    );
  }

  setHeightTexture(waterTexture) {
    this.material.uniforms["water"].value = waterTexture;
  }

  setEnvMapTexture(envMap) {
    this.material.uniforms["envMap"].value = envMap;
  }
}

export class Caustics {
  constructor() {
    this.target = new THREE.WebGLRenderTarget(waterSize * 3, waterSize * 3, {
      type: THREE.FloatType,
    });

    this._waterGeometry = waterGeometry;

    const shadersPromises = [
      loadFile("shaders/caustics/water_vertex.glsl"),
      loadFile("shaders/caustics/water_fragment.glsl"),
    ];

    this.loaded = Promise.all(shadersPromises).then(
      ([waterVertexShader, waterFragmentShader]) => {
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
        });

        this._waterMaterial.blending = THREE.CustomBlending;

        // Set the blending so that:
        // Caustics intensity uses an additive function
        this._waterMaterial.blendEquation = THREE.AddEquation;
        this._waterMaterial.blendSrc = THREE.OneFactor;
        this._waterMaterial.blendDst = THREE.OneFactor;

        // Caustics depth does not use blending, we just set the value
        this._waterMaterial.blendEquationAlpha = THREE.AddEquation;
        this._waterMaterial.blendSrcAlpha = THREE.OneFactor;
        this._waterMaterial.blendDstAlpha = THREE.ZeroFactor;

        this._waterMaterial.side = THREE.DoubleSide;
        this._waterMaterial.extensions = {
          derivatives: true,
        };

        this._waterMesh = new THREE.Mesh(
          this._waterGeometry,
          this._waterMaterial
        );
      }
    );
  }

  setDeltaEnvTexture(deltaEnvTexture) {
    this._waterMaterial.uniforms["deltaEnvTexture"].value = deltaEnvTexture;
  }

  setTextures(waterTexture, envTexture) {
    this._waterMaterial.uniforms["env"].value = envTexture;
    this._waterMaterial.uniforms["water"].value = waterTexture;
  }

  render(renderer) {
    const oldTarget = renderer.getRenderTarget();

   // 设置渲染目标
    renderer.setRenderTarget(this.target);
    // 设置清空颜色，alpha值为0
    renderer.setClearColor(black, 0);
    renderer.clear();

    renderer.render(this._waterMesh, lightCamera);

    renderer.setRenderTarget(oldTarget);
  }
}
