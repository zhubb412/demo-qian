// 导入axios相关类型和工具
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
// 导入类型定义
import type { BaseResult, RequestOptions } from '@/types/axios'
// 导入路由实例，用于token过期时跳转登录页
import router from '@/router'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 后端API基础地址
  timeout: 10000, // 请求超时时间：10秒
  headers: {
    'Content-Type': 'application/json;charset=UTF-8' // 默认请求头：JSON格式
  }
})

// 请求拦截器：在发送请求之前统一处理
service.interceptors.request.use(
  (config) => {
    // 从本地存储中获取token
    const token = localStorage.getItem('token')
    // 如果token存在，将其添加到请求头中
    if (token) {
      // 使用Bearer Token格式，这是JWT的标准格式
      config.headers.Authorization = `Bearer ${token}`
    }
    // 返回处理后的配置对象，继续发送请求
    return config
  },
  (error) => {
    // 请求发送前的错误处理（如配置错误等）
    // 将错误信息传递给调用方
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理服务器返回的响应


service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 从响应对象中解构出data字段
    const { data } = response
    
    // 如果后端直接返回数组类型的数据，包装成对象返回
    if (Array.isArray(data)) {
      return { data }
    }
    
    // 如果后端返回的是数字类型（如删除接口返回删除行数），包装成对象返回
    if (typeof data === 'number') {
      return { data }
    }
    
    // 如果后端返回的是字符串类型（如文件上传接口返回文件路径），直接返回字符串
    if (typeof data === 'string') {
      return data
    }
    
    // 如果后端返回的是包装格式（包含code、msg、data等字段），按业务逻辑处理
    // 兼容字符串和数字类型的code，成功状态码包括：200、0、1
    const codeStr = String(data.code)
    // 判断是否为成功状态码
    if (data.code !== undefined && (codeStr === '200' || codeStr === '0' || codeStr === '1')) {
      // 成功：直接返回数据
      return data
    } else if (data.code !== undefined) {
      // 业务错误：有错误码但不是成功状态码
      console.error('API Error:', data.msg)
      // 抛出错误，让调用方处理
      return Promise.reject(new Error(data.msg || '请求失败'))
    } else {
      // 如果后端直接返回对象（如分页数据），直接返回
      return data
    }
  },
  (error: AxiosError) => {
    // 处理HTTP错误响应（如4xx、5xx状态码）
    console.error('Request Error:', error)
    
    // 获取HTTP响应状态码
    const status = error.response?.status
    // 获取错误响应数据
    const responseData = error.response?.data as any
    
    // 处理401未授权错误（token过期或无效）
    if (status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('token')
      // 清除可能存在的其他用户信息
      localStorage.removeItem('userInfo')
      
      // 提示用户token已过期
      console.warn('Token已过期，请重新登录')
      // 如果后端返回了错误信息，使用后端信息，否则使用默认提示
      const errorMsg = responseData?.msg || '登录已过期，请重新登录'
      
      // 如果当前不在登录页，则跳转到登录页
      if (router.currentRoute.value.path !== '/login') {
        // 使用replace而不是push，避免用户通过浏览器后退按钮返回
        router.replace({
          path: '/login',
          // 可以携带当前路径，登录后可以跳转回来
          query: {
            redirect: router.currentRoute.value.fullPath
          }
        })
      }
      
      // 返回一个包含错误信息的Promise rejection
      return Promise.reject(new Error(errorMsg))
    }
    
    // 处理403禁止访问错误
    if (status === 403) {
      const errorMsg = responseData?.msg || '没有权限访问该资源'
      console.error('权限错误:', errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    
    // 处理404资源不存在错误
    if (status === 404) {
      const errorMsg = responseData?.msg || '请求的资源不存在'
      console.error('资源不存在:', errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    
    // 处理500服务器内部错误
    if (status === 500) {
      const errorMsg = responseData?.msg || '服务器内部错误，请稍后重试'
      console.error('服务器错误:', errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    
    // 处理网络错误（如无法连接到服务器）
    if (error.message === 'Network Error') {
      const errorMsg = '网络连接失败，请检查网络设置'
      console.error('网络错误:', errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    
    // 处理请求超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const errorMsg = '请求超时，请稍后重试'
      console.error('请求超时:', errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    
    // 其他未知错误，返回通用错误信息
    const errorMsg = responseData?.msg || error.message || '请求失败，请稍后重试'
    return Promise.reject(new Error(errorMsg))
  }
)



// 封装HTTP请求类，提供统一的请求方法
class HttpRequest {
  // GET请求方法：用于获取数据
  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    // 调用axios实例的request方法，指定请求方法为GET
    return service.request({
      method: 'GET', // HTTP方法：GET
      ...config // 展开传入的配置对象，可以覆盖默认配置
    })
  }

  // POST请求方法：用于创建数据或提交表单
  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    // 调用axios实例的request方法，指定请求方法为POST
    return service.request({
      method: 'POST', // HTTP方法：POST
      ...config // 展开传入的配置对象
    })
  }

  // PUT请求方法：用于更新数据（完整更新）
  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    // 调用axios实例的request方法，指定请求方法为PUT
    return service.request({
      method: 'PUT', // HTTP方法：PUT
      ...config // 展开传入的配置对象
    })
  }

  // DELETE请求方法：用于删除数据
  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    // 调用axios实例的request方法，指定请求方法为DELETE
    return service.request({
      method: 'DELETE', // HTTP方法：DELETE
      ...config // 展开传入的配置对象
    })
  }
}

// 创建HTTP请求实例
const request = new HttpRequest()
// 导出请求实例，供其他模块使用
export default request
