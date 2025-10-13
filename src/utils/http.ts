import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { BaseResult, RequestOptions } from '@/types/axios'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 直接访问后端地址
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    const { data } = response
    
    // 如果后端直接返回数组，直接返回
    if (Array.isArray(data)) {
      return { data }
    }
    
    // 如果后端返回的是数字（如删除接口返回删除行数），直接返回
    if (typeof data === 'number') {
      return { data }
    }
    
    // 如果后端返回的是字符串（如文件上传接口），直接返回
    if (typeof data === 'string') {
      return data
    }
    
    // 如果后端返回的是包装格式，按原来的逻辑处理
    // 兼容字符串和数字类型的code
    if (String(data.code) === '200' || String(data.code) === '0') {
      return data
    } else {
      // 处理业务错误
      console.error('API Error:', data.msg)
      return Promise.reject(new Error(data.msg || '请求失败'))
    }
  },
  (error) => {
    // 对响应错误做点什么
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 封装请求方法
class HttpRequest {
  // GET请求
  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({
      method: 'GET',
      ...config
    })
  }

  // POST请求
  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({
      method: 'POST',
      ...config
    })
  }

  // PUT请求
  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({
      method: 'PUT',
      ...config
    })
  }

  // DELETE请求
  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    return service.request({
      method: 'DELETE',
      ...config
    })
  }
}

// 导出请求实例
const request = new HttpRequest()
export default request
