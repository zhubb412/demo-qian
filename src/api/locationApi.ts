import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

export interface LocationItem {
    id: number;
    latitude: string;
    longitude: string;
    mj?: number | string;
    polygonPath?: string;
}

//分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class locationList {
    static listLocation(params?: {
        current?: number;
        size?: number;
    }){
        return request.get<PaginationResult<LocationItem>>({
            url: '/location/list',
            params
        })
    }

    static addLocation(data: LocationItem){
        return request.post<BaseResult>({
            url: '/location/add',
            data
        })
    }

    static deleteLocation(id: number){
        return request.delete<BaseResult>({
            url: `/location/${id}`
        })
    }
    

}