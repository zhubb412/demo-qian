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
// 引入：Vue 响应式工具 & Element Plus 图标
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { LoginApi } from '@/api/loginApi'

// 类型：登录表单字段
type LoginForm = {
  username: string
  password: string
}

// 类型：注册表单字段
type RegisterForm = {
  username: string
  password: string
  confirmPassword: string
}

// 类型：错误信息映射
type ErrorState = Partial<Record<'username' | 'password' | 'confirmPassword', string>>

// 状态：当前 Tab 与密码显示（保留以备扩展）
const activeTab = ref<'login' | 'register'>('login')
const showPassword = ref(false)

// 表单：登录
const loginForm = reactive<LoginForm>({
  username: '',
  password: ''
})

// 表单：注册
const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: ''//确认密码
})

// 错误信息容器
const errors = reactive<ErrorState>({})

// 计算属性：根据 Tab 返回当前表单对象
const currentForm = computed<LoginForm | RegisterForm>(() => {
  return activeTab.value === 'login' ? loginForm : registerForm
})

// 工具：清空错误
function resetErrors() {
  Object.keys(errors).forEach((k) => delete (errors as any)[k])
}

// 校验：用户名、密码长度、注册时确认密码一致
function validate(): boolean {
  resetErrors()
  const isLogin = activeTab.value === 'login'
  const form = currentForm.value as RegisterForm

  if (!form.username) {
    errors.username = '请输入用户名'
  }
  if (!form.password) {
    errors.password = '请输入密码'
  } 
  if (!isLogin) {
    if (!form.confirmPassword) {
      errors.confirmPassword = '请再次输入密码'
    } else if (form.confirmPassword !== form.password) {
      errors.confirmPassword = '两次输入的密码不一致'
    }
  }

  return Object.keys(errors).length === 0
}

// 提交：登录成功后写入 token 并跳转到主页面
const router = useRouter()
function onSubmit() {
  if (!validate()) return
  if (activeTab.value === 'login') {
    console.log('登录提交', { ...loginForm })
    // 调用登录接口
    LoginApi.login(loginForm).then(res => {
      console.log(res)
      if (String(res.code) === '200') {
        // 登录成功：写入 token
        localStorage.setItem('token', res.data?.token || 'mock-token')
        // 跳转到主页面
        router.replace('/main')
      } else {
        alert(res.msg || '登录失败')
      }
    }).catch(err => {
      console.error('登录失败:', err)
      alert('登录失败，请稍后重试')
    })
  } else {
    console.log('注册提交', { ...registerForm })
    LoginApi.register(registerForm).then(res => {
      console.log(res)
      if (String(res.code) === '200') {
        alert('注册成功')
        // 注册成功后切换到登录页面
        activeTab.value = 'login'
        onReset()
      } else {
        alert(res.msg || '注册失败')
      }
    }).catch(err => {
      console.error('注册失败:', err)
      alert('注册失败，请稍后重试')
    })
  }
}

// 重置：根据当前 Tab 清空对应表单
function onReset() {
  resetErrors()
  if (activeTab.value === 'login') {
    loginForm.username = ''
    loginForm.password = ''
  } else {
    registerForm.username = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
  }
}

// 切换 Tab：顺带清空表单
function toggleTab() {
  activeTab.value = activeTab.value === 'login' ? 'register' : 'login'
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


