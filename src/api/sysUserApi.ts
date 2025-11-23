import request from '@/utils/http'
import type { BaseResult } from '@/types/axios'

// 分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size?: number;
    current?: number;
    pages?: number;
}

export interface SysUserItem {
    id: number;
    userName: string;
    email: string;
    sex: string;
    number: number;
    createTime: string;
    remark: string;
}

export class sysUserList {
    static listSysUser(params: any){
        return request.get<PaginationResult<SysUserItem>>({
            url: '/sysUser/list',
            params
        })
    }

    static register(data: SysUserItem){
        return request.post<BaseResult>({
            url: '/sysUser/add',
            data
        })
    }

    static update(data: SysUserItem){
        return request.put<BaseResult>({
            url: '/sysUser/edit',
            data
        })
    }

    static delete(id: number){
        return request.delete<BaseResult>({
            url: `/sysUser/${id}`
        })
    }
}