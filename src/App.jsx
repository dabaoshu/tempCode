import React from "react";
import FloatRightPane from "./FloatPane";
import ButtomPane from "./components/ButtomPane";
import RobotView from "./Robot/robot";
import FloatLeftPane from "./components/FloatLeftPane";
function App() {
  return (
    <>
      <div className="w-full h-full relative">
        <RobotView></RobotView>
      </div>

      {/* <FloatLeftPane></FloatLeftPane>
      <FloatRightPane></FloatRightPane>
      <ButtomPane></ButtomPane> */}
    </>
  );
}

export default App;
