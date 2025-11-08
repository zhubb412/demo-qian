import request from '@/utils/http'
import type { BaseResult } from '@/types/axios'

export interface UserEmployeeItem {
    costId: number,
    taskId: number,
    employeeId: number,
    workingHours: string,
    workingStart: string,
    workingFinish: string,
    remark: string,
    status: string,
    orderNum: string,
    createBy: string,
    createTime: string,
    updateBy: string,
    updateTime: string
}
export interface UserEmployeeDTOItem {
    costId: number,
    taskId: number,
    employeeId: number,
    workingHours: string,
    workingStart: string,
    workingFinish: string,
    Id: number,
    userName: string
}
//分页响应接口
export interface UserEmployeePaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class UserEmployeeApi {
    static getUserEmployeeList(params: any) {
        return request.get<UserEmployeePaginationResult<UserEmployeeItem>>({
            url: '/userEmployee/list',
            params
        })
    }

    static addUserEmployee(data: UserEmployeeItem) {
        return request.post<BaseResult>({
            url: '/userEmployee/add',
            data
        })
    }

    static updateUserEmployee(data: UserEmployeeItem) {
        return request.put<BaseResult>({
            url: '/userEmployee/edit',
            data
        })
    }

    static deleteUserEmployee(costId: number) {
        return request.delete<BaseResult>({
            url: `/userEmployee/${costId}`
        })
    }
    //获取人工工时列表DTO
    static getUserEmployeeDTOList(params: any) {
        return request.get<UserEmployeePaginationResult<UserEmployeeDTOItem>>({
            url: '/userEmployee/listDTO',
            params
        })
    }

    /**
     * 根据任务ID获取人工工时列表（DTO版本，后端已根据taskId过滤）
     * @param params 查询参数，包含 current（页码）、size（每页条数）、taskId（任务ID）
     */
    static getUserEmployeeDTOListTaskId(params: { current: number; size: number; taskId: number }) {
        return request.get<UserEmployeePaginationResult<UserEmployeeDTOItem>>({
            url: '/userEmployee/listDTO',
            params
        })
    }
}