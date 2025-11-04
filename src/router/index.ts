import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('@/views/leftNavigation/index.vue'),
    children: [
      {
        path: '',
        redirect: '/main/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        path: 'class-management',
        name: 'ClassManagement',
        component: () => import('@/views/classManagement/index.vue')
      },
      {
        path: 'agriculture-material',
        name: 'AgricultureMaterial',
        component: () => import('@/views/agricultureMaterial/index.vue')
      },
      {
        path: 'crop-rotation',
        name: 'CropRotation',
        component: () => import('@/views/cropRotation/index.vue')
      },
      {
        path: 'farm-plot',
        name: 'FarmPlot',
        component: () => import('@/views/farmPlot/index.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue')
      },
      {
        path: 'task',
        name: 'Task',
        component: () => import('@/views/task/management.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router


