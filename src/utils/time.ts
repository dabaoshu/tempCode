import * as dayjs from 'dayjs'
import * as isLeapYear from 'dayjs/plugin/isLeapYear' // 导入插件
import * as duration from 'dayjs/plugin/duration' // 导入插件
import 'dayjs/locale/zh-cn' // 导入本地化语言

dayjs.extend(isLeapYear) // 使用插件
dayjs.extend(duration) // 使用插件
dayjs.locale('zh-cn') // 使用本地化语言
console.log(
  
dayjs(1697785858408).format("HH:mm:ss")
);
