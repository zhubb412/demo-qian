// 导入Vue Router相关函数和类型
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 定义路由配置数组：所有路由都使用懒加载方式
const routes: Array<RouteRecordRaw> = [
  // 根路径：重定向到登录页
  {
    path: '/', // 路由路径：根路径
    redirect: '/login' // 重定向目标：登录页
  },
  // 登录页路由：不需要token验证
  {
    path: '/login', // 路由路径：登录页
    name: 'Login', // 路由名称：用于编程式导航
    component: () => import('@/views/login/index.vue') // 懒加载登录组件
  },
  // 主页面路由：需要token验证，包含多个子路由
  {
    path: '/main', // 路由路径：主页面
    name: 'Main', // 路由名称
    component: () => import('@/views/leftNavigation/index.vue'), // 懒加载主布局组件
    children: [ // 子路由配置
      // 默认子路由：重定向到仪表盘
      {
        path: '', // 空路径，匹配父路由
        redirect: '/main/dashboard' // 重定向到仪表盘
      },
      // 仪表盘页面
      {
        path: 'dashboard', // 子路由路径（相对于父路由）
        name: 'Dashboard', // 路由名称
        component: () => import('@/views/dashboard/index.vue') // 懒加载仪表盘组件
      },
      // 班级管理页面
      {
        path: 'class-management', // 子路由路径
        name: 'ClassManagement', // 路由名称
        component: () => import('@/views/classManagement/index.vue') // 懒加载班级管理组件
      },
      // 农资管理页面
      {
        path: 'agriculture-material', // 子路由路径
        name: 'AgricultureMaterial', // 路由名称
        component: () => import('@/views/agricultureMaterial/index.vue') // 懒加载农资管理组件
      },
      // 轮作管理页面
      {
        path: 'crop-rotation', // 子路由路径
        name: 'CropRotation', // 路由名称
        component: () => import('@/views/cropRotation/index.vue') // 懒加载轮作管理组件
      },
      // 农田地块管理页面
      {
        path: 'farm-plot', // 子路由路径
        name: 'FarmPlot', // 路由名称
        component: () => import('@/views/farmPlot/index.vue') // 懒加载农田地块组件
      },
      // 设置页面
      {
        path: 'settings', // 子路由路径
        name: 'Settings', // 路由名称
        component: () => import('@/views/settings/index.vue') // 懒加载设置组件
      },
      // 员工管理页面
      {
        path: 'settings/employee', // 子路由路径
        name: 'SettingsEmployee', // 路由名称
        component: () => import('@/views/settings/employee.vue') // 懒加载员工管理组件
      },
      // 任务管理页面
      {
        path: 'task', // 子路由路径
        name: 'Task', // 路由名称
        component: () => import('@/views/task/management.vue') // 懒加载任务管理组件
      },
      // 收获管理页面
      {
        path: 'harvest', // 子路由路径
        name: 'Harvest', // 路由名称
        component: () => import('@/views/harvest/index.vue') // 懒加载收获管理组件
      },
      // 销售管理页面
      {
        path: 'sell', // 子路由路径
        name: 'Sell', // 路由名称
        component: () => import('@/views/sell/index.vue') // 懒加载销售管理组件
      },
      // 历史记录页面
      {
        path: 'history', // 子路由路径
        name: 'History', // 路由名称
        component: () => import('@/views/History/index.vue') // 懒加载历史记录组件
      },
      // 账单管理页面
      {
        path: 'bill', // 子路由路径
        name: 'Bill', // 路由名称
        component: () => import('@/views/Bill/index.vue') // 懒加载账单管理组件
      }
    ]
  }
]

// 创建Vue Router实例
const router = createRouter({
  history: createWebHashHistory(), // 使用Hash模式（URL中带#号），兼容性更好
  routes // 路由配置数组
})

// 路由守卫：在路由跳转前进行拦截和验证
router.beforeEach((to, from, next) => {
  // to: 即将要进入的目标路由对象
  // from: 当前导航正要离开的路由对象
  // next: 控制路由跳转的函数
  
  // 从本地存储中获取token
  const token = localStorage.getItem('token')
  
  // 定义不需要token验证的白名单路由
  const whiteList = ['/login'] // 登录页不需要token
  
  // 判断目标路由是否在白名单中
  if (whiteList.includes(to.path)) {
    // 如果目标路由在白名单中，直接放行
    next()
    return
  }
  
  // 如果目标路由不在白名单中，需要验证token
  if (token) {
    // token存在，允许访问
    next()
  } else {
    // token不存在，跳转到登录页
    // 使用replace而不是push，避免在历史记录中留下未授权访问的记录
    next({
      path: '/login', // 跳转到登录页
      // 携带当前路径作为查询参数，登录成功后可以跳转回来
      query: {
        redirect: to.fullPath // 保存完整的目标路径（包含查询参数和哈希）
      }
    })
  }
})

// 导出路由实例，供其他模块使用
export default router


