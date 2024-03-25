import React, { useMemo } from "react";
import styles from "./index.module.less";
import * as echarts from "echarts";
import AutoChart from "../chart";
import classnames from "classnames";
import ButtomPane from "./ButtomPane";
import dayjs from "dayjs";
import { usePositionStore } from "@/store/usePositionStore";
/**
 * 根据传入的时间戳获取格式化时间
 * @param {*} stamp 时间戳 可通过 new Date().getTime() 获取
 * @returns
 */
export const getFormatTime = (stamp) => {
  let year = new Date(stamp).getFullYear();
  let month = new Date(stamp).getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  let date = new Date(stamp).getDate();
  date = date < 10 ? "0" + date : date;
  return (
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    new Date(stamp).toLocaleTimeString("chinese", { hour12: false })
  );
};
const PositionChart = ({ timeList, XList, YList, ZList }) => {
  return (
    <div
      className={classnames(
        styles.chart,
        styles.PositionChart,
        "blue-box-shadow"
      )}
    >
      <div className={styles.chartContent}>
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
              boundaryGap: false,
              data: timeList,
              axisLabel: {
                formatter: (value, index) => {
                  return value;
                },
                inside: false,
                color: "#fff",
                fontWeight: "bold",
              },
            },
            yAxis: {
              type: "value",
            },
            series: [
              {
                name: "X",
                type: "line",
                stack: "Total",
                data: XList,
              },
              {
                name: "Y",
                type: "line",
                stack: "Total",
                data: YList,
              },
              {
                name: "Z",
                type: "line",
                stack: "Total",
                data: ZList,
              },
            ],
          }}
        ></AutoChart>
      </div>
    </div>
  );
};

const PostureChart = ({ resetXList, resetYList, resetZList, timeList }) => {
  return (
    <div
      className={classnames(
        styles.chart,
        styles.PostureChart,
        "blue-box-shadow"
      )}
    >
      <div className={styles.chartContent}>
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
              boundaryGap: false,
              data: timeList,
              axisLabel: {
                formatter: (value, index) => {
                  return value;
                },
                inside: false,
                color: "#fff",
                fontWeight: "bold",
              },
            },
            yAxis: {
              type: "value",
            },
            series: [
              {
                name: "rotX",
                type: "line",
                stack: "Total",
                data: resetXList,
              },
              {
                name: "rotY",
                type: "line",
                stack: "Total",
                data: resetYList,
              },
              {
                name: "rotZ",
                type: "line",
                stack: "Total",
                data: resetZList,
              },
            ],
          }}
        ></AutoChart>
      </div>
    </div>
  );
};

export default function FloatLeftPane() {
  const { list, baseTime } = usePositionStore();
  const baseTime2 = dayjs(baseTime);
  const { timeList, resetXList, resetYList, resetZList, XList, YList, ZList } =
    useMemo(() => {
      // const timeList = list.map(o => o.time)
      const timeList = [];
      const XList = [];
      const YList = [];
      const ZList = [];
      const resetXList = [];
      const resetYList = [];
      const resetZList = [];
      list.forEach((o) => {
        XList.push(o.resetX);
        YList.push(o.resetY);
        ZList.push(o.resetZ);
        resetXList.push(o.resetRotX);
        resetYList.push(o.resetRotY);
        resetZList.push(o.resetRotZ);
        const difftime = dayjs(o.time);
        timeList.push(dayjs.duration(difftime.diff(baseTime2)).format("mm:ss"));
      });
      return {
        timeList,
        resetXList,
        resetYList,
        resetZList,
        XList,
        YList,
        ZList,
      };
    }, [list]);
  return (
    <div className={styles.FloatLeftPane}>
      <PositionChart
        timeList={timeList}
        XList={XList}
        YList={YList}
        ZList={ZList}
      ></PositionChart>
      <PostureChart
        timeList={timeList}
        resetXList={resetXList}
        resetYList={resetYList}
        resetZList={resetZList}
      ></PostureChart>
      <ButtomPane list={list}></ButtomPane>
    </div>
  );
}
