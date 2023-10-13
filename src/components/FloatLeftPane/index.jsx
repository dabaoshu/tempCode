import React from "react";
import styles from "./index.module.less";
import * as echarts from "echarts";
import AutoChart from "../chart";
import classnames from "classnames";
import ButtomPane from "./ButtomPane";

const PositionChart = () => {
  return (
    <div className={classnames(styles.chart, styles.PositionChart)}>
      <AutoChart
        option={{
          title: {
            text: "位置曲线",
          },
          tooltip: {
            trigger: "axis",
          },
          legend: {
            data: ["X", "Y", "Z"],
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
          },
          toolbox: {
            feature: {
              saveAsImage: {},
            },
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: ["0s", "10s", "20s", "30s", "40s", "50s", "60s"],
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              name: "X",
              type: "line",
              stack: "Total",
              data: [10, 12, 11, 14, 26, 23, 20],
            },
            {
              name: "Y",
              type: "line",
              stack: "Total",
              data: [22, 18, 11, 24, 20, 30, 31],
            },
            {
              name: "Z",
              type: "line",
              stack: "Total",
              data: [10, 23, 20, 15, 19, 33, 41],
            },
          ],
        }}
      ></AutoChart>
    </div>
  );
};

const PostureChart = () => {
  return (
    <div className={classnames(styles.chart, styles.PostureChart)}>
      <AutoChart
        option={{
          title: {
            text: "姿态曲线",
          },
          tooltip: {
            trigger: "axis",
          },
          legend: {
            data: ["rotX", "rotY", "rotZ"],
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
          },
          toolbox: {
            feature: {
              saveAsImage: {},
            },
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: ["0s", "10s", "20s", "30s", "40s", "50s", "60s"],
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              name: "rotX",
              type: "line",
              stack: "Total",
              data: [12, 13, 10, 13, 9, 23, 21],
            },
            {
              name: "rotY",
              type: "line",
              stack: "Total",
              data: [22, 18, 19, 23, 29, 33, 31],
            },
            {
              name: "rotZ",
              type: "line",
              stack: "Total",
              data: [15, 23, 20, 15, 19, 33, 41],
            },
          ],
        }}
      ></AutoChart>
    </div>
  );
};

export default function FloatLeftPane() {
  return (
    <div className={styles.FloatLeftPane}>
      <PositionChart></PositionChart>
      <PostureChart></PostureChart>
      <ButtomPane></ButtomPane>

    </div>
  );
}
