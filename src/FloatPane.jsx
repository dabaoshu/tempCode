import React, { useState } from "react";
import { eventBus } from "../utils";
const list = [
  { label: "上", type: "up" },
  { label: "下", type: "down" },
  { label: "左", type: "left" },
  { label: "右", type: "right" },
  { label: "前", type: "ahead" },
  { label: "后", type: "behind" },
  { label: "roll+", type: "roll+" },
  { label: "roll-", type: "roll-" },
  { label: "pitch+", type: "pitch+" },
  { label: "pitch-", type: "pitch-" },
  { label: "yaw+", type: "yaw+" },
  { label: "yaw-", type: "yaw-" },
];

const Select = () => {
  return (
    <div class="flex justify-center items-center">
      <select id="select" class="px-4 py-1 border rounded focus:outline-none">
        <option value="option1">基于面板控制</option>
        <option value="option2">选择遥控器</option>
      </select>
    </div>
  );
};

export default function FloatPane() {
  const [runing, setRunning] = useState(false);
  const [activeKey, setActiveKey] = useState();
  const Btnclick = (type) => {
    eventBus.emit("click1", type);
  };

  const start = () => {
    setRunning(true);
    eventBus.emit("click1", 'start');
  };

  const end = () => {
    setRunning(false);
    eventBus.emit("click1", 'end');
  };

  //   const activeClass = `border-b-2 font-medium text-blue-500 border-blue-500`;

  return (
    <div class={"w-52"}>
      {/* <div class="bg-white">
        <nav class="flex flex-col sm:flex-row">
          <button
            class={`text-gray-600 text-sm block hover:text-blue-500 focus:outline-none   ${
              activeKey === "hand" ? activeClass : ""
            }`}
          >
            手动控制模式
          </button>
          <button
            class={`text-gray-600 text-sm ml-1 block hover:text-blue-500 focus:outline-none ${
              activeKey === "hand" ? activeClass : ""
            } `}
          >
            自动控制模式
          </button>
        </nav>
      </div> */}
      <Select></Select>

      <div class=" p-4">
        <div class="flex  flex-wrap justify-center">
          <button
            onClick={() => start()}
            class="bg-blue-500 hover:bg-blue-600 w-20 text-white py-2 px-4 rounded-md m-1"
          >
            开始
          </button>
          <button
            disabled={!runing}
            onClick={() => end()}
            class="bg-pink-500 hover:bg-pink-600 w-20 text-white py-2 px-4 rounded-md m-1 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            结束
          </button>
          {list.map((o) => (
            <button
              onClick={() => Btnclick(o.type)}
              key={o.type}
              class="bg-green-500 hover:bg-green-600 w-16 text-white py-2 px-4 rounded-md m-1 text-sm"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
