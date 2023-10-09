import React from "react";
import FloatRightPane from "./components/FloatPane";
import ButtomPane from "./components/ButtomPane";
import RobotView from "./Robot/robot";
import FloatLeftPane from "./components/FloatLeftPane";
import styles from "./index.module.less";
import classnames from "classnames";
function App() {
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
          <RobotView></RobotView>
        </div>
        <div>
          <FloatRightPane></FloatRightPane>
        </div>
        <ButtomPane></ButtomPane>
      </div>
    </div>
  );
}

export default App;
