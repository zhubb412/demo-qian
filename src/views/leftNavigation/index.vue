<template>
  <!-- 左侧导航主页面：Element Plus 布局 + 菜单 -->
  <el-container class="layout">
    <!-- 侧边栏：左侧导航菜单 -->
    <el-aside width="200px" class="aside">
      <div class="logo">演示系统</div>
      <!-- 菜单：支持展开/收起与选中高亮 -->
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="onSelectMenu"
        :collapse="isCollapsed"
      >
        <el-menu-item index="dashboard">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="class-management">
          <el-icon><Category /></el-icon>
          <span>种类管理</span>
        </el-menu-item>
        <el-menu-item index="crop-rotation">
          <el-icon><Grid /></el-icon>
          <span>作物轮作计划</span>
        </el-menu-item>
        <el-menu-item index="farm-plot">
          <el-icon><MapLocation /></el-icon>
          <span>地块管理</span>
        </el-menu-item>
        <el-menu-item index="agriculture-material">
          <el-icon><Crop /></el-icon>
          <span>农资管理</span>
        </el-menu-item>
        <el-menu-item index="settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧：顶部栏 + 内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <el-button text @click="isCollapsed = !isCollapsed" class="collapse-btn">
          <el-icon><Expand v-if="isCollapsed" /><Fold v-else /> </el-icon>
        </el-button>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="28" class="mr8">U</el-avatar>
              管理员
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区：显示子路由组件 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
// 说明：
// - 本页面为登录后的主页面，包含左侧导航菜单与右侧内容区
// - 使用 Element Plus 布局组件（el-container / el-aside / el-header / el-main）
// - 左侧菜单基于 el-menu，右侧根据 activeMenu 简单切换内容

import { ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
// 引入 Element Plus 图标并在本组件中直接使用
import { House, Setting, Expand, Fold, ArrowDown, Crop, Grid, MapLocation } from '@element-plus/icons-vue'

// 当前选中的菜单项
const activeMenu = ref('dashboard')

// 侧边栏是否折叠
const isCollapsed = ref(false)

const router = useRouter()
const route = useRoute()

// 监听路由变化，更新当前激活的菜单项
watch(() => route.path, (newPath) => {
  const pathToMenuMap: Record<string, string> = {
    '/main/dashboard': 'dashboard',
    '/main/class-management': 'class-management',
    '/main/agriculture-material': 'agriculture-material',
    '/main/crop-rotation': 'crop-rotation',
    '/main/farm-plot': 'farm-plot',
    '/main/settings': 'settings'
  }
  
  const menuKey = pathToMenuMap[newPath]
  if (menuKey) {
    activeMenu.value = menuKey
  }
}, { immediate: true })

// 菜单选择事件：根据 index 进行路由跳转
function onSelectMenu(index: string) {
  activeMenu.value = index
  // 根据菜单项进行路由跳转
  const routeMap: Record<string, string> = {
    'dashboard': '/main/dashboard',
    'class-management': '/main/class-management',
    'agriculture-material': '/main/agriculture-material',
    'crop-rotation': '/main/crop-rotation',
    'farm-plot': '/main/farm-plot',
    'settings': '/main/settings'
  }
  
  const targetRoute = routeMap[index]
  if (targetRoute) {
    router.push(targetRoute)
  }
}

// 跳转到个人中心（示例）
function goProfile() {
  ElMessageBox.alert('这里可以跳转到个人中心路由（示例）', '提示')
}

// 退出登录：清理 token 并回到登录页
function logout() {
  localStorage.removeItem('token')
  router.replace('/login')
}
</script>

<style scoped>
.layout {
  height: 100vh;
}

.aside {
  border-right: 1px solid #f0f0f0;
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 700;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

.collapse-btn {
  margin-left: -6px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mr8 { margin-right: 8px; }

.main {
  background: #f6f7fb;
  padding: 20px;
}
</style>
