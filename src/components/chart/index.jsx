import React from "react"
import * as  echarts from 'echarts';

const AutoChart = (props) => {
  const chartRef = React.useRef(null);

  const [chart, setChart] = React.useState();

  const handleResize = () => chart?.resize();
  const init = () => {
    if (chart) {
      // 建议替换为 ResizeObserver （2023.5.25）
      window.removeEventListener('resize', handleResize);
    }

    const _chart = echarts.init(chartRef.current);
    _chart.setOption(props.option);
    window.addEventListener('resize', handleResize);
    setChart(_chart);
  };

  React.useEffect(() => {
    init();
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [props.option]);

  return <div ref={chartRef} style={{ height: '100%', width: '100%' }} />;
};

export default AutoChart;