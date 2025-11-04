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
