import React, { useCallback, useEffect, useState } from "react";
import { eventBus } from "../../Robot/utils";
import styles from './index.module.less'
import classnames from 'classnames'
import keymaster from 'keymaster'
const keyActions = [
  { label: "上", type: "up", keyCode: "w" },
  { label: "下", type: "down", keyCode: "s" },
  { label: "左", type: "left", keyCode: "a" },
  { label: "右", type: "right", keyCode: "d" },
  { label: "前", type: "ahead", keyCode: "shift" },
  { label: "后", type: "behind", keyCode: "ctrl" },
  { label: "roll+", type: "roll+", keyCode: 'Numpad1' },
  { label: "roll-", type: "roll-", keyCode: 'Numpad2' },
  { label: "pitch+", type: "pitch+", keyCode: 'Numpad4' },
  { label: "pitch-", type: "pitch-", keyCode: 'Numpad5' },
  { label: "yaw+", type: "yaw+", keyCode: 'Numpad7' },
  { label: "yaw-", type: "yaw-", keyCode: 'Numpad8' },
];

const TypeSelect = () => {
  return (
    <div className="flex justify-center items-center">
      <select id="select" className="px-4 py-1 border rounded focus:outline-none">
        <option value="option1">基于面板控制</option>
        <option value="option2">选择遥控器</option>
      </select>
    </div>
  );
};


const postMessage = (eventName, type) => {
  eventBus.emit(eventName, type);
}


const disabledClass = `disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed`


export default function FloatPane() {
  const [runing, setRunning] = useState(false);

  const [activeKey, setActiveKey] = useState();
  const postClickMessage = useCallback((type) => {
    if (!runing) {
      return
    }
    console.log(type);
    postMessage("click1", type)
  }, [runing])
  const start = () => {
    setRunning(true);
    postMessage("click1", "start")
  };

  const stop = () => {
    setRunning(false);
    postMessage("click1", 'stop')
  };

  const reset = () => {
    postMessage("click1", 'reset')
  }

  useEffect(() => {
    keyActions.forEach(keyAction => {
      const { keyCode, label, type } = keyAction
      keymaster(keyCode, () => {
        postClickMessage(type)
      });
    });
    return () => {
      keyActions.forEach(keyAction => {
        const { keyCode, label, type } = keyAction
        keymaster.unbind(keyCode);
      });
    }
  }, [runing])


  return (
    <div className={styles.FloatPane}>
      {/* <div className="bg-white">
        <nav className="flex flex-col sm:flex-row">
          <button
            className={`text-gray-600 text-sm block hover:text-blue-500 focus:outline-none   ${
              activeKey === "hand" ? activeClass : ""
            }`}
          >
            手动控制模式
          </button>
          <button
            className={`text-gray-600 text-sm ml-1 block hover:text-blue-500 focus:outline-none ${
              activeKey === "hand" ? activeClass : ""
            } `}
          >
            自动控制模式
          </button>
        </nav>
      </div> */}
      <TypeSelect />
      <div className="p-4">
        <div className="flex  flex-wrap justify-center">
          <button
            onClick={() => start()}
            className="bg-blue-500 hover:bg-blue-600 w-20 text-white py-2 px-4 rounded-md m-1"
          >
            开始
          </button>
          <button
            disabled={!runing}
            onClick={() => stop()}
            className={classnames("bg-pink-500 hover:bg-pink-600 w-20 text-white py-2 px-4 rounded-md m-1", disabledClass)}
          >
            暂停
          </button>
          <button
            onClick={() => reset()}
            className={classnames("bg-teal-500 hover:bg-teal-600 w-20 text-white py-2 px-4 rounded-md m-1", disabledClass)}
          >
            重置
          </button>
        </div>
        <div className={styles.contaner}>
          <div className={classnames("flex flex-wrap justify-center", styles.btnGroup)} >
            {keyActions.map((o) => (
              <button
                disabled={!runing}
                onClick={() => postClickMessage(o.type)}
                key={o.type}
                className={classnames("bg-green-500 hover:bg-green-600 w-16 text-white py-2 px-4 rounded-md m-1 text-sm", disabledClass)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
