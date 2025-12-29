<template>
  <!-- 左侧导航主页面：Element Plus 布局 + 菜单 -->
  <el-container class="layout">
    <!-- 侧边栏：左侧导航菜单 -->
    <el-aside width="200px" class="aside">
      <!-- 系统 Logo 显示区域 -->
      <div class="logo">农场地块信息与作物轮作管理系统</div>
      <!-- 菜单：支持展开/收起与选中高亮 -->
      <!-- default-active 绑定当前激活菜单；@select 响应菜单点击；collapse 控制折叠 -->
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="onSelectMenu"
        :collapse="isCollapsed"
      >
        <!-- 仪表盘菜单项 -->
        <el-menu-item index="dashboard">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <!-- 农资管理菜单项 -->
        <el-menu-item index="agriculture-material">
          <el-icon><Crop /></el-icon>
          <span>农资管理</span>
        </el-menu-item>
        <!-- 种类管理 -->
        <el-menu-item index="class-management">
          <el-icon><Calendar /></el-icon>
          <span>种类管理</span>
        </el-menu-item>
        <!-- 作物轮作计划 -->
        <el-menu-item index="crop-rotation">
          <el-icon><Grid /></el-icon>
          <span>作物轮作计划</span>
        </el-menu-item>
        <!-- 地块管理 -->
        <el-menu-item index="farm-plot">
          <el-icon><MapLocation /></el-icon>
          <span>地块管理</span>
        </el-menu-item>
        <!-- 种植任务 -->
        <el-menu-item index="task">
          <el-icon><Crop /></el-icon>
          <span>种植任务</span>
        </el-menu-item>
        <!-- 收获管理 -->
        <el-menu-item index="harvest">
          <el-icon><Crop /></el-icon>
          <span>收获管理</span>
        </el-menu-item>
        <!-- 销售记录 -->
        <el-menu-item index="sell">
          <el-icon><Document /></el-icon>
          <span>销售记录</span>
        </el-menu-item>
        <!-- 账单管理 -->
        <el-menu-item index="bill">
          <el-icon><Document /></el-icon>
          <span>账单管理</span>
        </el-menu-item>
        <!-- 历史种植 -->
        <el-menu-item index="history">
          <el-icon><Document /></el-icon>
          <span>历史种植</span>
        </el-menu-item>
        <!-- 位置管理 -->
        <!-- <el-menu-item index="location">
          <el-icon><MapLocation /></el-icon>
          <span>位置管理</span>
        </el-menu-item> -->
        <!-- 系统设置折叠菜单 -->
        <el-sub-menu index="settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <!-- 员工管理子项 -->
          <el-menu-item index="settings-employee">
            <el-icon><User /></el-icon>
            <span>员工管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 右侧：顶部栏 + 内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <!-- 折叠按钮 -->
        <el-button text @click="isCollapsed = !isCollapsed" class="collapse-btn">
          <el-icon><Expand v-if="isCollapsed" /><Fold v-else /></el-icon>
        </el-button>
        <div class="header-right">
          <!-- 用户下拉 -->
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="28" class="mr8" :src="userAvatar">U</el-avatar>
              {{ userName || '管理员' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <!-- 下拉菜单内容 -->
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

  <!-- 个人中心弹窗 -->
  <!-- v-model 绑定弹窗显示状态 -->
  <el-dialog v-model="profileDialogVisible" title="个人中心" width="520px">
    <!-- 表单用于编辑用户信息 -->
    <el-form label-width="90px" :model="profileForm" v-loading="profileLoading">
      <el-form-item label="账号">
        <el-input v-model="profileForm.username" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="profileForm.password" placeholder="请输入密码" type="password" show-password />
      </el-form-item>
      <el-form-item label="电话号码">
        <el-input v-model="profileForm.number" placeholder="请输入电话号码" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="头像地址">
        <!-- show-file-list 关闭列表；auto-upload 关闭自动上传；accept 限制图片；on-change 捕获文件 -->
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="customAvatarUpload"
          :disabled="avatarUploading"
          accept="image/*"
        >
          <!-- 有头像时展示图片 -->
          <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" alt="avatar" />
          <!-- 没有头像时展示占位 -->
          <div v-else class="avatar-placeholder">
            <el-icon><Plus /></el-icon>
            <span>点击上传图片</span>
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
    <!-- 底部操作按钮 -->
    <template #footer>
      <el-button @click="profileDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="savingProfile" @click="submitProfile">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 说明：
// - 本页面为登录后的主页面，包含左侧导航菜单与右侧内容区
// - 使用 Element Plus 布局组件（el-container / el-aside / el-header / el-main）
// - 左侧菜单基于 el-menu，右侧根据 activeMenu 简单切换内容

import { reactive, ref, watch, onMounted } from 'vue' // 引入 Vue 组合式 API
import { ElMessage } from 'element-plus' // 引入消息组件
import { useRouter, useRoute } from 'vue-router' // 路由钩子
// 引入 Element Plus 图标并在本组件中直接使用
import { House, Setting, Expand, Fold, ArrowDown, Crop, Grid, MapLocation, Document, Calendar, User, Plus } from '@element-plus/icons-vue'
import { LoginApi } from '@/api/loginApi' // 登录相关接口
import type { LoginUserInfo } from '@/api/loginApi' // 登录用户类型
import type { UploadProps, UploadRequestOptions } from 'element-plus' // 上传组件类型

// 当前选中的菜单项
const activeMenu = ref('dashboard') // 当前激活的菜单 key

// 侧边栏是否折叠
const isCollapsed = ref(false) // 是否折叠侧边栏

const router = useRouter() // 路由实例
const route = useRoute() // 当前路由对象

// 监听路由变化，更新当前激活的菜单项
watch(() => route.path, (newPath) => {
  const pathToMenuMap: Record<string, string> = {
    '/main/dashboard': 'dashboard',
    '/main/class-management': 'class-management',
    '/main/agriculture-material': 'agriculture-material',
    '/main/crop-rotation': 'crop-rotation',
    '/main/farm-plot': 'farm-plot',
    '/main/task': 'task',
    '/main/harvest': 'harvest',
    '/main/sell': 'sell',
    '/main/history': 'history',
    '/main/bill': 'bill',
    '/main/settings': 'settings-overview',
    '/main/settings/employee': 'settings-employee',
    '/main/location': 'location'
  }
  const menuKey = pathToMenuMap[newPath] // 路由路径映射菜单
  if (menuKey) {
    activeMenu.value = menuKey // 同步菜单高亮
  }
}, { immediate: true }) // 立即执行一次保证初始值正确

// 菜单选择事件：根据 index 进行路由跳转
function onSelectMenu(index: string) {
  activeMenu.value = index // 设置当前激活菜单
  const routeMap: Record<string, string> = {
    'dashboard': '/main/dashboard',
    'class-management': '/main/class-management',
    'agriculture-material': '/main/agriculture-material',
    'crop-rotation': '/main/crop-rotation',
    'farm-plot': '/main/farm-plot',
    'task': '/main/task',
    'harvest': '/main/harvest',
    'sell': '/main/sell',
    'history': '/main/history',
    'bill': '/main/bill',
    'settings-overview': '/main/settings',
    'settings-employee': '/main/settings/employee',
    'location': '/main/location'
  }
  const targetRoute = routeMap[index] // 找到对应路由
  if (targetRoute) {
    router.push(targetRoute) // 执行路由跳转
  }
}

const profileDialogVisible = ref(false) // 控制个人中心弹窗
const profileLoading = ref(false) // 弹窗信息加载状态
const savingProfile = ref(false) // 保存按钮 loading 状态
const avatarUploading = ref(false) // 头像上传状态
const profileForm = reactive<LoginUserInfo>({
  id: 0, // 用户 ID
  username: '', // 账号
  password: '', // 密码
  number: '', // 电话
  email: '', // 邮箱
  avatar: '', // 头像
  sex: '' // 性别占位
})

// 顶部导航栏显示的用户信息
const userAvatar = ref('') // 用户头像URL
const userName = ref('') // 用户名

// 统一处理头像URL转换：将各种格式的头像路径转换为完整URL
function normalizeAvatarUrl(avatar: string): string {
  if (!avatar) return ''
  if (avatar.startsWith('http')) return avatar
  if (avatar.includes('\\')) {
    const fileName = avatar.split('\\').pop() || ''
    return `http://localhost:8080/uploads/${fileName}`
  }
  return avatar.startsWith('/') 
    ? `http://localhost:8080${avatar}` 
    : `http://localhost:8080/${avatar}`
}

// 提取用户数据：从后端返回的数据结构中提取用户信息
function extractUserData(data: any): LoginUserInfo | null {
  if (!data || typeof data !== 'object') return null
  // 后端返回的数据结构可能是 {userInfo: {...}} 或直接是用户信息对象
  return (data.userInfo || data) as LoginUserInfo
}

// 更新用户信息到表单和顶部导航栏
function updateUserInfo(userData: LoginUserInfo) {
  const avatarUrl = normalizeAvatarUrl(userData.avatar || '')
  Object.assign(profileForm, {
    id: userData.id ?? 0,
    username: userData.username ?? '',
    password: userData.password ?? '',
    number: userData.number ?? '',
    email: userData.email ?? '',
    avatar: avatarUrl,
    sex: userData.sex ?? ''
  })
  // 检查缓存，如果缓存存在且与后端返回的不一样，优先使用缓存（缓存是最新的）
  const cachedAvatar = localStorage.getItem('userAvatar')
  if (cachedAvatar && cachedAvatar !== avatarUrl) {
    // 缓存存在且与后端返回的不一样，使用缓存（缓存是最新的）
    userAvatar.value = cachedAvatar
    profileForm.avatar = cachedAvatar
  } else {
    // 使用后端返回的头像
    userAvatar.value = avatarUrl
    // 更新缓存（只有在缓存不存在或与后端返回的一样时才更新）
    if (avatarUrl) localStorage.setItem('userAvatar', avatarUrl)
  }
  userName.value = userData.username || ''
  if (userName.value) localStorage.setItem('userName', userName.value)
}

// 拉取服务器上的用户信息
async function fetchProfileInfo() {
  profileLoading.value = true
  try {
    // 调用获取用户信息接口
    const res = await LoginApi.getLoginUserInfo()
    // 检查响应结果：响应拦截器返回的是 {code, msg, data} 格式
    if (String(res?.code) === '200' && res?.data) {
      const userData = extractUserData(res.data)
      if (userData) {
        updateUserInfo(userData)
      } else {
        ElMessage.warning('获取用户信息失败：数据格式异常')
      }
    } else {
      // 失败：显示错误信息
      ElMessage.error(res?.msg || '获取个人信息失败')
    }
  } catch (error) {
    // 捕获请求过程中的异常
    ElMessage.error('获取个人信息失败，请稍后重试')
  } finally {
    profileLoading.value = false
  }
}

// 打开个人设置弹窗
async function goProfile() {
  try {
    await fetchProfileInfo()
    profileDialogVisible.value = true // 显示弹窗
  } catch {
    // 已有错误提示
  }
}

// 头像上传前校验
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 自定义上传逻辑
async function customAvatarUpload(options: UploadRequestOptions) {
  const { file, onError, onSuccess } = options
  if (!file) return
  try {
    avatarUploading.value = true
    // 调用上传接口
    const res = await LoginApi.uploadAvatar(file as File)
    
    // 处理响应数据：响应拦截器可能返回不同的格式
    let url: string = ''
    // 情况1：如果返回的是包装格式 {code: 200, data: "url"} 或 {data: 1}
    if (res && typeof res === 'object' && 'data' in res) {
      const resObj = res as any
      if (resObj.data === 1 || String(resObj.code) === '200') {
        // 成功：从data字段获取URL
        url = String(resObj.data || '')
      } else {
        // 失败：显示错误信息
        ElMessage.error(resObj.msg || '上传失败')
        onError && onError(new Error(resObj.msg || '上传失败') as any)
        return
      }
    } 
    // 情况2：如果返回的是字符串（响应拦截器直接返回字符串）
    // 例如："文件上传成功: D:\\demo-hou\\uploads\\wwc.jpg"
    else if (typeof res === 'string') {
      const resStr: string = res
      if (resStr.includes(':')) {
        // 如果包含冒号，尝试提取路径部分（冒号后的内容）
        const parts = resStr.split(':')
        if (parts.length > 1) {
          // 提取最后一个冒号后的内容作为路径
          url = parts.slice(1).join(':').trim()
        } else {
          url = resStr.trim()
        }
      } else {
        // 直接使用字符串作为URL
        url = resStr.trim()
      }
    }
    // 情况3：如果返回的是其他格式
    else {
      url = String(res || '')
    }
    
    // 如果获取到URL，更新头像并提示成功
    if (url && url.trim()) {
      // 将本地路径转换为可访问的URL
      const finalUrl = normalizeAvatarUrl(url.trim())
      // 更新表单中的头像地址
      profileForm.avatar = finalUrl
      // 同步更新顶部导航栏的头像
      userAvatar.value = finalUrl
      // 保存到本地存储，避免刷新时后端缓存问题
      localStorage.setItem('userAvatar', finalUrl)
      ElMessage.success('头像上传成功')
      onSuccess && onSuccess({ url: finalUrl } as any)
    } else {
      // 未获取到URL，提示警告
      ElMessage.warning('上传成功但未返回地址')
      onError && onError(new Error('未返回地址') as any)
    }
  } catch (error) {
    // 捕获上传过程中的异常
    ElMessage.error('头像上传失败，请重试')
    onError && onError(error as any)
  } finally {
    avatarUploading.value = false
  }
}

// 提交个人信息
async function submitProfile() {
  savingProfile.value = true // 打开 loading
  try {
    // 构建提交的数据载荷
    const payload: LoginUserInfo = { ...profileForm }
    // 调用修改接口
    const res = await LoginApi.editLoginUserInfo(payload)
    
    // 处理返回格式：{data: 0} 或 {data: 1}，1表示成功，0表示失败
    const resData = (res as any)?.data
    if (resData === 1) {
      // 修改成功：保存当前表单中的头像和用户名（这是最新的值）
      const savedAvatar = profileForm.avatar || ''
      const savedUsername = profileForm.username || ''
      // 立即更新顶部导航栏（使用表单中的最新值）
      userAvatar.value = savedAvatar
      userName.value = savedUsername
      // 保存到本地存储，避免刷新时后端缓存问题
      if (savedAvatar) localStorage.setItem('userAvatar', savedAvatar)
      if (savedUsername) localStorage.setItem('userName', savedUsername)
      
      // 重新获取最新信息以确保数据同步（但不覆盖刚才保存的值）
      // 注意：不重新获取，因为后端可能有缓存，会覆盖刚才保存的缓存
      // 直接使用保存的值即可，缓存已经是最新的了
      
      ElMessage.success('个人信息已更新')
      profileDialogVisible.value = false // 关闭弹窗
    } else {
      // data === 0 表示失败
      ElMessage.error('更新失败，请稍后重试')
    }
  } catch (error) {
    // 捕获请求过程中的异常（如网络错误、401等）
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    savingProfile.value = false // 无论成功失败都关闭 loading
  }
}

// 退出登录：清理 token 并回到登录页
function logout() {
  localStorage.removeItem('token') // 清理 token
  localStorage.removeItem('userAvatar') // 清理头像缓存
  localStorage.removeItem('userName') // 清理用户名缓存
  router.replace('/login') // 回到登录页
}

// 获取用户信息用于顶部导航栏显示
async function loadUserInfo() {
  try {
    // 先检查本地存储中是否有最新的头像（避免后端缓存问题）
    const cachedAvatar = localStorage.getItem('userAvatar')
    const cachedUsername = localStorage.getItem('userName')
    
    const res = await LoginApi.getLoginUserInfo()
    if (String(res?.code) === '200' && res?.data) {
      // 提取用户信息
      const userData = extractUserData(res.data)
      if (userData) {
        // 设置用户名
        userName.value = userData.username || cachedUsername || ''
        // 设置头像URL，处理多种格式
        const avatar = normalizeAvatarUrl(userData.avatar || '')
        
        // 优先使用缓存头像（缓存是最新的，避免后端返回旧数据）
        // 如果缓存存在，使用缓存；如果缓存不存在，才使用后端返回的
        if (cachedAvatar) {
          // 缓存存在，优先使用缓存（这是最新的头像）
          userAvatar.value = cachedAvatar
        } else {
          // 缓存不存在，使用后端返回的头像
          userAvatar.value = avatar
          // 更新缓存
          if (avatar) localStorage.setItem('userAvatar', avatar)
        }
        // 更新用户名缓存
        if (userName.value) localStorage.setItem('userName', userName.value)
      }
    } else {
      // 如果获取失败，尝试使用缓存
      if (cachedAvatar) userAvatar.value = cachedAvatar
      if (cachedUsername) userName.value = cachedUsername
    }
  } catch (error) {
    // 如果获取失败，尝试使用缓存
    const cachedAvatar = localStorage.getItem('userAvatar')
    const cachedUsername = localStorage.getItem('userName')
    if (cachedAvatar) userAvatar.value = cachedAvatar
    if (cachedUsername) userName.value = cachedUsername
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  loadUserInfo()
})
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

.mr8 {
  margin-right: 8px;
}

.main {
  background: #f6f7fb;
  padding: 20px;
}

.avatar-uploader {
  width: 100%;
}

.avatar-placeholder,
.avatar-uploader :deep(.el-upload) {
  width: 180px;
  height: 120px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #909399;
  cursor: pointer;
  background-color: #fafafa;
}

.avatar {
  width: 180px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
