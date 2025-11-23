import request from '@/utils/http'
import type { BaseResult } from '@/types/axios'

//登录用户信息接口
export interface LoginUserInfo {
    id: number;
    username: string;
    password: string;
    number: string;
    email: string;
    avatar: string;
    sex: string;
}


// 登录
export class LoginApi {
    static login(data: any) {
        return request.post<BaseResult>({
            url: '/userLogin/login',
            data
        })
    }

    // 注册
    static register(data: any) {
        return request.post<BaseResult>({
            url: '/userLogin/register',
            data
        })
    }

    //修改
    static editLoginUserInfo(data: LoginUserInfo){
        return request.put<BaseResult>({
            url: '/userLogin/edit',
            data
        })
    }

    // 查询当前登录用户信息
    static getLoginUserInfo() {
        return request.get<BaseResult<LoginUserInfo>>({
            url: '/userLogin/current'
        })
    }

    // 上传头像
    static uploadAvatar(file: File) {
        const formData = new FormData()
        formData.append('file', file)
        return request.post<BaseResult<string>>({
            url: '/api/files/upload',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}