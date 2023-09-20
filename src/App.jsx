import React from "react";
import FloatRightPane from "./FloatPane";
import ButtomPane from "./components/ButtomPane";
import './Robot'
import FloatLeftPane from "./components/FloatLeftPane";
function App() {
  return (
    <>
      <FloatLeftPane></FloatLeftPane>
      <FloatRightPane></FloatRightPane>
      <ButtomPane></ButtomPane>
    </>
  );
}

export default App;
