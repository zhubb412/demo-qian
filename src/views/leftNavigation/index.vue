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
        <el-sub-menu index="data">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>数据中心</span>
          </template>
          <el-menu-item index="data-list">数据列表</el-menu-item>
          <el-menu-item index="data-report">数据报表</el-menu-item>
        </el-sub-menu>
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

      <!-- 内容区：简单路由占位或本页内容 -->
      <el-main class="main">
        <div v-if="activeMenu === 'dashboard'" class="card">欢迎来到仪表盘</div>
        <div v-else-if="activeMenu === 'data-list'" class="card">
          <!-- 示例：内嵌现有页面 src/views/index.vue -->
          <IndexView />
        </div>
        <div v-else-if="activeMenu === 'data-report'" class="card">数据报表（示例占位）</div>
        <div v-else-if="activeMenu === 'settings'" class="card">系统设置（示例占位）</div>
        <div v-else class="card">请选择左侧菜单</div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
// 说明：
// - 本页面为登录后的主页面，包含左侧导航菜单与右侧内容区
// - 使用 Element Plus 布局组件（el-container / el-aside / el-header / el-main）
// - 左侧菜单基于 el-menu，右侧根据 activeMenu 简单切换内容

import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
// 引入 Element Plus 图标并在本组件中直接使用
import { House, DataAnalysis, Setting, Expand, Fold, ArrowDown } from '@element-plus/icons-vue'

// 当前选中的菜单项
const activeMenu = ref('dashboard')

// 侧边栏是否折叠
const isCollapsed = ref(false)

const router = useRouter()

// 菜单选择事件：根据 index 切换右侧内容区（示例里不换路由，仅切内容）
function onSelectMenu(index: string) {
  activeMenu.value = index
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
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}
</style>
