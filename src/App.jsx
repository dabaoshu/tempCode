import React, { useContext } from "react";
import "./utils/time";
import FloatRightPane from "./components/FloatPane";
import ButtomPane from "./components/FloatLeftPane/ButtomPane";
import RobotView from "./Robot/robot";
// import RobotView from "./Robot/robot copy";
import FloatLeftPane from "./components/FloatLeftPane";
import styles from "./index.module.less";
import classnames from "classnames";
import { usePositionStore } from "./context";

function App() {
  const { store, setStore } = usePositionStore();
  const pushPosition = (position) => {
    const { list } = store;
    const newList = [...list, position];
    setStore({
      list: newList,
    });
  };
  const initPosition = (position) => {
    const { time } = position;
    setStore({
      list: [position],
      baseTime: time,
    });
  };
  return (
    <div className="w-full h-full relative">
      <div
        className={classnames(
          "w-full h-full relative flex mx-auto",
          styles.content
        )}
      >
        <div>
          <FloatLeftPane></FloatLeftPane>
        </div>
        {/* <div className={`${styles.RobotViewBox}`}> */}
        <div className={`${styles.RobotViewBox} `}>
          <RobotView pushPosition={pushPosition} initPosition={initPosition} />
        </div>
        <FloatRightPane></FloatRightPane>
      </div>
    </div>
  );
}

export default App;
