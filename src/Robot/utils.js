import * as THREE from "three";

export function loadFile(filename) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
}
export const createViewRender = (style) => {
  // 创建一个新的渲染器（第一人称的视角）
  const viewRender = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  // 使用CSS将其定位在左上角
  Object.keys(style).forEach((key) => {
    viewRender.domElement.style[key] = style[key];
  });
  // console.log(viewRender.domElement.style.height);
  return viewRender;
};


class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      if (callback) {
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
      } else {
        delete this.events[event];
      }
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }
}

export const eventBus = new EventBus();
