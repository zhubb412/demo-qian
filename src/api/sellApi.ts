import request from '@/utils/http'
import type { BaseResult } from '@/types/axios'

export interface SellItem {
    id: number;
    sellId: number;
    sellName: string;
    sellJiage: number; // 后端为 double 类型
    sellAge: number; // 后端为 double 类型
    sellRen: string;
    sellRenId: number;
    sellStatus: string;
    sellTime: string;
}
export interface SellItemResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class SellItemApi{
    static getSellItemList(params: any) {
        return request.get<SellItemResult<SellItem>>({
            url: '/sell/list',
            params
        })
    }
    static addSellItem(data: SellItem) {
        return request.post<BaseResult>({
            url: '/sell/add',
            data
        })
    }
    static updateSellItem(data: SellItem) {
        return request.put<BaseResult>({
            url: '/sell/edit',
            data
        })
    }
    static deleteSellItem(id: number) {
        return request.delete<BaseResult>({
            url: `/sell/${id}`
        })
    }
}