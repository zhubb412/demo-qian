import request from '@/utils/http'
import type { BaseResult } from '@/types/axios'

export interface MaterialUseItem {
    id?: number;
    taskId: number;
    materialId: number;
    plotId: number;
    useAge: string;
    useZongjia: string;
    usePlotzj: string;
    materialName: string;
    measureUnit: string;
    kaishiTime: string;
    jiesuTime: string;
}
export interface MaterialUseDTOItem {
    id: number;
    taskId: number;
    materialId: number;
    useAge: string;
    materialName: string;
    kaishiTime: string;
    jiesuTime: string;
    materialJg: string;
    measureUnit: string;
    useZongjia: string;
    usePlotzj: string;
}

export interface MaterialUseDTOItemResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class MaterialUseItemApi{
    static getMaterialUseItemList(params: any) {
        return request.get<MaterialUseDTOItemResult<MaterialUseItem>>({
            url: '/materialUse/list',
            params
        })
    }
    static addMaterialUseItem(data: MaterialUseItem) {
        return request.post<BaseResult>({
            url: '/materialUse/add',
            data
        })
    }
    static updateMaterialUseItem(data: MaterialUseItem) {
        return request.put<BaseResult>({
            url: '/materialUse/edit',
            data
        })
    }
    static deleteMaterialUseItem(id: number) {
        return request.delete<BaseResult>({
            url: `/materialUse/${id}`
        })
    }
    static getMaterialUseItemDTOList(params: any) {
        return request.get<MaterialUseDTOItemResult<MaterialUseDTOItem>>({
            url: '/materialUse/listDTO',
            params
        })
    }
    /**
     * 根据任务ID获取农资使用列表（DTO版本，后端已根据taskId过滤）
     * @param params 查询参数，包含 current（页码）、size（每页条数）、taskId（任务ID）
     */
    static getMaterialUseItemDTOTaskId(params: { current: number; size: number; taskId: number }) {
        return request.get<MaterialUseDTOItemResult<MaterialUseDTOItem>>({
            url: '/materialUse/listDTO',
            params
        })
    }
}