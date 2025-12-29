import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

//任务处理接口
export interface FarmTaskItem {
    taskId: number;
    farmtaskName: string;
    responsiblePersonId: number;
    responsiblePersonName: string;
    planStart: string;
    planFinish: string;
    actualStart: string;
    actualFinish: string;
    status: string;
    createTime: string;
    createBy: string;
    updateBy: string;
    updateTime: string ;
}

//listDTO返回的数据结构（RenWuDTO方法返回的数据格式）
export interface FarmTaskDTOItem {
    taskId: number;
    farmplotId: number;
    farmplotName: string;
    classId1: number;
    classId2: string;
    taskName: string ;
    taskRen: string;
    farmId: number;
    farmtaskName: string;
    responsiblePersonName: string;
    status: string;
    planStart?: string;
    planFinish?: string;
    actualStart?: string;
    actualFinish?: string;
}
//分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

//获取所有任务 模糊查询一起 支持分页
export class farmTaskList {
    static listfarmTask(params?: {
        farmtaskName?: string;
        current?: number;
        size?: number;
    }){
        return request.get<PaginationResult<FarmTaskItem>>({
            url: '/farmTask/list',
            params
        })
    }

    //删除任务
    static deletefarmTask(taskId: number){
        return request.delete<BaseResult>({
            url: `/farmTask/${taskId}`
        })
    }

    //新增任务
    static addfarmTask(data: FarmTaskItem){
        return request.post<BaseResult>({
            url: '/farmTask/add',
            data
        })
    }

    //编辑任务
    static editfarmTask(data: FarmTaskItem){
        return request.put<BaseResult>({
            url: '/farmTask/edit',
            data
        })
    }
    static listDTO(){
        return request.get<PaginationResult<FarmTaskDTOItem>>({
            url: '/farmTask/listDTO'
        })
    }
    static RenWuDTO(farmplotId: number){
        return request.get<BaseArrayResult<FarmTaskDTOItem>>({
            url:`/farmTask/list/${farmplotId}`
        })
    }
    
    // 根据taskId获取任务详情
    static getTaskById(taskId: number){
        return request.get<BaseArrayResult<FarmTaskDTOItem>>({
            url:`/farmTask/dan/${taskId}`
        })
    }
}