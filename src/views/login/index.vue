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
      <el-form
        ref="formRef"
        class="auth-form"
        :model="currentForm"
        :rules="dataRule"
        label-position="top"
        @submit.prevent="onSubmit"
      >
        <!-- 用户名输入框（登录与注册均使用） -->
        <el-form-item prop="username" label="用户名">
          <el-input
            v-model.trim="(currentForm as any).username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <!-- 密码输入框（登录/注册共用） -->
        <el-form-item prop="password" label="密码">
          <el-input
            v-model.trim="currentForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <!-- 确认密码（仅注册时显示） -->
        <el-form-item v-if="activeTab === 'register'" prop="confirmPassword" label="确认密码">
          <el-input
            v-model.trim="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

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
      </el-form>
    </div>
  </div>
  
</template>

<script setup lang="ts">
// 引入Vue响应式工具函数
import { reactive, ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
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

// 表单引用：用于调用Element Plus校验方法
const formRef = ref<FormInstance>()

// 计算属性：根据当前Tab返回对应的表单对象
const currentForm = computed<LoginForm | RegisterForm>(() => {
  // 如果是登录Tab，返回登录表单；否则返回注册表单
  return activeTab.value === 'login' ? loginForm : registerForm
})

// 校验规则：使用Element Plus的表单校验写法
const dataRule = computed<FormRules>(() => {
  // 登录/注册共享的必填规则（触发时机：blur）
  const commonRules: FormRules = {
    username: [{ required: true, message: '帐号不能为空', trigger: 'blur' }],
    password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
  }

  // 注册模式追加确认密码校验
  if (activeTab.value === 'register') {
    return {
      ...commonRules,
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          // 自定义校验：两次输入必须一致
          validator: (_rule, value, callback) => {
            if (!value) {
              callback(new Error('请再次输入密码'))
            } else if (value !== registerForm.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
  }

  return commonRules
})

// 表单验证函数：调用Element Plus内置校验，保持原有入口不变
async function validate(): Promise<boolean> {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch (_err) {
    return false
  }
}

// 获取路由实例：用于编程式导航
const router = useRouter()
// 获取当前路由对象：用于获取查询参数
const route = useRoute()

// 表单提交函数：处理登录和注册逻辑
async function onSubmit() {
  // 先进行表单验证，如果验证失败则直接返回
  const isValid = await validate()
  if (!isValid) return
  
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
  // 先清空Element Plus校验提示
  formRef.value?.clearValidate()
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


