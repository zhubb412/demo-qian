import request from '@/utils/http'
import type { BaseResult } from '@/types/axios'

// 登录
export class LoginApi {
    static login(data: any) {
        return request.post<BaseResult>({
            url: '/login',
            data
        })
    }

    // 注册
    static register(data: any) {
        return request.post<BaseResult>({
            url: '/register',
            data
        })
    }
}