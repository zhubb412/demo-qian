import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

export interface HistoryItem {
    id: number;
    classId: number;
    plotId: number;
    historyPlot: string;
    historyName: string;
    historyRen: string;
    historyChanliang: string;
    historyShoumai: string;
    historyAge: string;
    historyYkui: string;
    historyTime: string;
}

//分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class historyList {
    static listHistory(params?:{
        current?: number;
        size?: number;
    }){
        return request.get<PaginationResult<HistoryItem>>({
            url: '/history/list',
            params
        })
    }
    static addHistory(data: HistoryItem){
        return request.post<BaseResult>({
            url: '/history/add',
            data
        })
    }
    static updateHistory(data: HistoryItem){
        return request.put<BaseResult>({
            url: '/history/edit',
            data
        })
    }
    static deleteHistory(id: number){
        return request.delete<BaseResult>({
            url: `/history/${id}`
        })
    }
}
