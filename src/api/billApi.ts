import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

//账单管理接口

export interface BillItem {
    id: number;
    classId: number;
    classAge: string;
    farmId: number;
    farmAge: number;
    materialId: number;
    materialAge: string;
    useId: number;
    useAge: string;
    harvestId: number;
    harvestAge: string;
    billAge: string;
    billYli: string;
    billName: string;
    billRen: string;
    billZuowu: string;
    billTime: string;
}

export interface BillItemDTO {
    farmId: number;
    id: number;
    sellId: number;
    sellAge: string;
    harvestAge: string;
}

//分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class billList {
    static listBill(params?:{
        current?: number;
        size?: number;
    }){
        return request.get<PaginationResult<BillItem>>({
            url: '/bill/list',
            params
        })
    }

    static addBill(data: BillItem){
        return request.post<BaseResult>({
            url: '/bill/add',
            data
        })
    }

    static updateBill(data: BillItem){
        return request.put<BaseResult>({
            url: '/bill/edit',
            data
        })
    }

    static deleteBill(id: number){
        return request.delete<BaseResult>({
            url: `/bill/${id}`
        })
    }

    //获取收获总价
    static getBillDTOList(params: any){
        return request.get<BaseArrayResult<BillItemDTO>>({
            url: '/bill/listDTO',
            params
        })
    }
}