<template>
  <!-- 页面容器：全屏居中布局与背景 -->
  <div class="auth-container">
    <!-- 登录/注册卡片区域 -->
    <div class="auth-card">
      <!-- 顶部 Tab 切换：登录/注册 -->
      <div class="auth-header">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >登录</button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >注册</button>
      </div>
      <!-- 主体表单：根据 activeTab 切换校验与展示 -->
      <form class="auth-form" @submit.prevent="onSubmit">
        <!-- 用户名输入框（登录与注册均使用） -->
        <div class="form-group">
          <label>用户名</label>
          <el-input
            v-model.trim="(currentForm as any).username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
          <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
        </div>

        <!-- 密码输入框（登录/注册共用） -->
        <div class="form-group">
          <label>密码</label>
          <el-input
            v-model.trim="currentForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
          />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>

        <!-- 确认密码（仅注册时显示） -->
        <div class="form-group" v-if="activeTab === 'register'">
          <label>确认密码</label>
          <el-input
            v-model.trim="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            :prefix-icon="Lock"
          />
          <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
        </div>

        <!-- 操作按钮：提交 与 重置 -->
        <div class="form-actions">
          <el-button class="primary" type="primary" native-type="submit" round>
            {{ activeTab === 'login' ? '登录' : '注册' }}
          </el-button>
          <el-button class="ghost" type="default" @click="onReset" round>重置</el-button>
        </div>

        <!-- 快捷切换提示文案 -->
        <p class="hint">
          {{ activeTab === 'login' ? '没有账号？' : '已有账号？' }}
          <button type="button" class="link" @click="toggleTab">
            {{ activeTab === 'login' ? '去注册' : '去登录' }}
          </button>
        </p>
      </form>
    </div>
  </div>
  
</template>

<script setup lang="ts">
// 引入Vue响应式工具函数
import { reactive, ref, computed } from 'vue'
// 引入Vue Router的导航函数
import { useRouter, useRoute } from 'vue-router'
// 引入Element Plus图标组件
import { User, Lock } from '@element-plus/icons-vue'
// 引入登录API
import { LoginApi } from '@/api/loginApi'

// 类型定义：登录表单字段
type LoginForm = {
  username: string // 用户名
  password: string // 密码
}

// 类型定义：注册表单字段
type RegisterForm = {
  username: string // 用户名
  password: string // 密码
  confirmPassword: string // 确认密码
}

// 类型定义：错误信息映射对象
type ErrorState = Partial<Record<'username' | 'password' | 'confirmPassword', string>>

// 状态管理：当前激活的Tab（登录或注册）
const activeTab = ref<'login' | 'register'>('login')
// 状态管理：是否显示密码（保留以备扩展）
const showPassword = ref(false)

// 响应式表单对象：登录表单
const loginForm = reactive<LoginForm>({
  username: '', // 用户名初始值为空
  password: '' // 密码初始值为空
})

// 响应式表单对象：注册表单
const registerForm = reactive<RegisterForm>({
  username: '', // 用户名初始值为空
  password: '', // 密码初始值为空
  confirmPassword: '' // 确认密码初始值为空
})

// 响应式错误信息容器：存储表单验证错误信息
const errors = reactive<ErrorState>({})

// 计算属性：根据当前Tab返回对应的表单对象
const currentForm = computed<LoginForm | RegisterForm>(() => {
  // 如果是登录Tab，返回登录表单；否则返回注册表单
  return activeTab.value === 'login' ? loginForm : registerForm
})

// 工具函数：清空所有错误信息
function resetErrors() {
  // 遍历错误对象的所有键，删除每个错误信息
  Object.keys(errors).forEach((k) => delete (errors as any)[k])
}

// 表单验证函数：验证表单字段是否合法
function validate(): boolean {
  // 先清空之前的错误信息
  resetErrors()
  // 判断当前是否为登录模式
  const isLogin = activeTab.value === 'login'
  // 获取当前表单对象（转换为注册表单类型以支持所有字段）
  const form = currentForm.value as RegisterForm

  // 验证用户名：如果为空，添加错误信息
  if (!form.username) {
    errors.username = '请输入用户名'
  }
  // 验证密码：如果为空，添加错误信息
  if (!form.password) {
    errors.password = '请输入密码'
  } 
  // 如果是注册模式，需要验证确认密码
  if (!isLogin) {
    // 如果确认密码为空，添加错误信息
    if (!form.confirmPassword) {
      errors.confirmPassword = '请再次输入密码'
    } 
    // 如果确认密码与密码不一致，添加错误信息
    else if (form.confirmPassword !== form.password) {
      errors.confirmPassword = '两次输入的密码不一致'
    }
  }

  // 如果错误对象中没有错误（长度为0），返回true表示验证通过
  return Object.keys(errors).length === 0
}

// 获取路由实例：用于编程式导航
const router = useRouter()
// 获取当前路由对象：用于获取查询参数
const route = useRoute()

// 表单提交函数：处理登录和注册逻辑
function onSubmit() {
  // 先进行表单验证，如果验证失败则直接返回
  if (!validate()) return
  
  // 判断当前是登录还是注册
  if (activeTab.value === 'login') {
    // 登录逻辑
    console.log('登录提交', { ...loginForm })
    // 调用登录API
    LoginApi.login(loginForm).then(res => {
      // 打印完整的响应数据，方便调试查看后端返回的结构
      console.log('登录接口完整响应:', res)
      // 打印响应数据的结构，查看token在哪里
      console.log('响应数据结构:', {
        code: res.code,
        msg: res.msg,
        data: res.data,
        'res.data类型': typeof res.data,
        'res.data?.token': res.data?.token
      })
      // 判断响应状态码是否为200（成功）
      if (String(res.code) === '200') {
        // 从响应数据中提取token
        // 注意：token可能在 res.data.token 或 res.data 中，根据后端返回结构调整
        const token = res.data?.token || res.data || 'mock-token'
        console.log('提取到的token:', token)
        // 登录成功：将token存储到本地存储
        // LocalStorage 是浏览器提供的一种持久化本地存储机制
        localStorage.setItem('token', token)
        // 验证token是否成功存储
        const storedToken = localStorage.getItem('token')
        console.log('已存储到localStorage的token:', storedToken)
        
        // 获取路由查询参数中的redirect（重定向地址）
        const redirect = route.query.redirect as string
        // 如果存在重定向地址，跳转到该地址；否则跳转到主页面
        const targetPath = redirect || '/main'
        // 使用replace方法跳转，避免在历史记录中留下登录页
        router.replace(targetPath)
      } else {
        // 登录失败：显示错误提示
        alert(res.msg || '登录失败')
      }
    }).catch(err => {
      // 捕获登录过程中的异常
      console.error('登录失败:', err)
      // 显示通用错误提示
      alert('登录失败，请稍后重试')
    })
  } else {
    // 注册逻辑
    console.log('注册提交', { ...registerForm })
    // 调用注册API
    LoginApi.register(registerForm).then(res => {
      console.log(res)
      // 判断响应状态码是否为200（成功）
      if (String(res.code) === '200') {
        // 注册成功：显示成功提示
        alert('注册成功')
        // 切换到登录Tab
        activeTab.value = 'login'
        // 重置表单
        onReset()
      } else {
        // 注册失败：显示错误提示
        alert(res.msg || '注册失败')
      }
    }).catch(err => {
      // 捕获注册过程中的异常
      console.error('注册失败:', err)
      // 显示通用错误提示
      alert('注册失败，请稍后重试')
    })
  }
}

// 重置表单函数：根据当前Tab清空对应的表单数据
function onReset() {
  // 先清空所有错误信息
  resetErrors()
  // 根据当前Tab重置对应的表单
  if (activeTab.value === 'login') {
    // 重置登录表单
    loginForm.username = ''
    loginForm.password = ''
  } else {
    // 重置注册表单
    registerForm.username = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
  }
}

// 切换Tab函数：在登录和注册之间切换
function toggleTab() {
  // 切换Tab：如果当前是登录，切换到注册；否则切换到登录
  activeTab.value = activeTab.value === 'login' ? 'register' : 'login'
  // 切换Tab后重置表单
  onReset()
}
</script>

<style scoped>
/*
  样式说明：
  - 卡片式界面，浅色渐变背景
  - 清晰焦点态与圆角，提升易用性
*/
 .auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  overflow: hidden;
}

.auth-header {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}

.tab-button {
  flex: 1;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  color: #0f172a;
  box-shadow: inset 0 -2px 0 0 #6366f1;
}

.auth-form {
  padding: 22px 22px 8px 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

label {
  font-size: 14px;
  color: #0f172a;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}

.password-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link {
  background: transparent;
  border: none;
  color: #6366f1;
  cursor: pointer;
  padding: 0 4px;
}

.error-text {
  color: #ef4444;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.primary {
  flex: 1;
  height: 40px;
  border: none;
  background: #6366f1;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.ghost {
  height: 40px;
  padding: 0 14px;
  background: #fff;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
}

.hint {
  margin: 16px 0 10px 0;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}
</style>


