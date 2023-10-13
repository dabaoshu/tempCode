import React, { useContext } from "react";
import FloatRightPane from "./components/FloatPane";
import ButtomPane from "./components/FloatLeftPane/ButtomPane";
import RobotView from "./Robot/robot";
// import RobotView from "./Robot/robot copy";
import FloatLeftPane from "./components/FloatLeftPane";
import styles from "./index.module.less";
import classnames from "classnames";
import { usePositionStore } from "./context";


function App() {
  const { store, setStore } = usePositionStore()
  const pushPosition = (position) => {
    const { list } = store
    const newList = [...list, position]
    setStore({
      list: newList
    })
  }
  const initPosition = (position) => {
    setStore({
      list: [position]
    })
  }
  console.log(store.list);
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
        <div className={`${styles.RobotViewBox} max-w-screen-xl`}>
          <RobotView pushPosition={pushPosition} initPosition={initPosition}></RobotView>
        </div>
        <div>
          <FloatRightPane></FloatRightPane>
        </div>
      </div>
    </div>
  );
}

export default App;
