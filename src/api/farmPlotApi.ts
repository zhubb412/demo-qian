import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

//地块管理接口
export interface FarmPlotItem {
    farmplotId: number;
    rotationId: number;
    classId1: number;
    classId2: number;
    farmplotName: string;
    farmplotJiage:string;
    farmplotZongjia:string;
    farmplotSyliang:string;
    farmplotSyzongjia: string;
    farmplotZuowu: string;
    farmplotLunzuowu: string;
    farmplotCount: number | null;       
    farmplotArea: number | null;         
    farmplotShengarea: number | null;    
    farmplotPosition: string;
    farmplotFzr: string;
    remark: string | null;
    createTime: string;
    createBy: string | null;
    updateBy: string | null;
    updateTime: string | null;
    farmplotImage?: string | null; // 地块图片，根据选择的轮作计划自动填充
}

//分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

//listDTO返回的数据结构
export interface FarmPlotDTOItem {
    classId: number;
    rotationId1: number;
    rotationId2: number;
    classPlanting: string;
    classHarvest: string;
    className: string;
    classAdapt: string;
    rotationName: string;
    rotationImage: string;
    farmplotJiage:string;
    farmplotZongjia:string;
    farmplotSyliang:string;
}

//获取所有地块 模糊查询一起 支持分页
export class farmPlotList {
    static listfarmPlot(params?:{
        farmplotName?: string;
        current?: number;
        size?: number;
    }){
        return request.get<PaginationResult<FarmPlotItem>>({
            url: '/farmPlot/list',
            params
        })
    }

    //删除地块
    static deletefarmPlot(farmplotId: number){
        return request.delete<BaseResult>({
            url: `/farmPlot/${farmplotId}`
        })
    }

    //新增地块
    static addfarmPlot(data: FarmPlotItem){
        return request.post<BaseResult>({
            url: '/farmPlot/add',
            data
        })
    }

    //编辑地块
    static editfarmPlot(data: FarmPlotItem){
        return request.put<BaseResult>({
            url: '/farmPlot/edit',
            data
        })
    }
    
    static listDTO(){
        return request.get<PaginationResult<FarmPlotDTOItem>>({
            url: '/farmPlot/listDTO'
        })
    }
    
}
