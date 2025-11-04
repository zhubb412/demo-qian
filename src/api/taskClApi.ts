import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

//任务处理接口
export interface TaskClItem {
    taskId?: number;
    farmId?: number | null;
    classId?: number | null;
    taskName: string;
    taskRen: string;
    yjkaishiTime?: string;
    yjwanchengTime?: string;
    sjwanchengTime?: string;
    createTime?: string | null;
    createBy?: string | null;
    updateBy?: string | null;
    updateTime?: string | null;
}


// 分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

//获取所有任务 模糊查询一起 支持分页
export class taskClList {
    static listtaskCl(params?:{
        taskName?: string;
        classId?: number;  // 后端已支持classId参数
        current?: number;
        size?: number;
    }){
        return request.get<PaginationResult<TaskClItem>>({
            url: '/taskCl/list',
            params
        })
    }

    //删除任务
    static deletetaskCl(taskId: number){
        return request.delete<BaseResult>({
            url: `/taskCl/${taskId}`
        })
    }

    //新增任务
    static addtaskCl(data: TaskClItem){
        return request.post<BaseResult>({
            url: '/taskCl/add',
            data
        })
    }

    //编辑任务
    static edittaskCl(data: TaskClItem){
        return request.put<BaseResult>({
            url: '/taskCl/edit',
            data
        })
    }
    

}