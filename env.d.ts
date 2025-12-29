/// <reference types="vite/client" />

/**
 * Vue3 + TypeScript 类型声明
 * 用于让 TypeScript 识别 .vue 文件的导入
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/**
 * ECharts 类型声明占位
 * 这里简单声明一个模块，避免在项目中引入 'echarts' 时 TS 提示找不到类型声明。
 * 实际运行时会使用 node_modules 中真实的 ECharts 实现。
 */
declare module 'echarts' {
  const echarts: any
  export = echarts
}
