import request from '@/utils/http'
import type { BaseResult } from '@/types/axios'

export interface HarvestItem {
    id: number;
    farmId: number;
    className: string;
    classWeight: string;
    date: string;
    remark: string;
    status: string;
    classImg: string;
}

export interface HarvestItemResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class HarvestItemApi{
    static getHarvestItemList(params: any) {
        return request.get<HarvestItemResult<HarvestItem>>({
            url: '/harvest/list',
            params
        })
    }
    static addHarvestItem(data: HarvestItem) {
        return request.post<BaseResult>({
            url: '/harvest/add',
            data
        })
    }
    static updateHarvestItem(data: HarvestItem) {
        return request.put<BaseResult>({
            url: '/harvest/edit',
            data
        })
    }
    static deleteHarvestItem(id: number) {
        return request.delete<BaseResult>({
            url: `/harvest/${id}`
        })
    }
}