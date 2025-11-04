import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

/**
 * 农资信息管理
 */

// 农资信息管理接口
export interface AgricultureMaterialItem {
    materialId: number;
    materialCode: string;
    materialName: string;
    materialImage: string | null;
    measureUnit: string | null;
    materialJg: string | null;
    remark: string | null;
    createTime: string | null;
    createBy: string | null;
    updateBy: string | null;
    updateTime: string | null;
    status: string | null;
    orderNum: number | null;
}

// 分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class agricultureMaterialList {
    //获取所有农资 模糊查询一起，支持分页
   static listagricultureMaterial(params?:{
    materialName?: string;
    materialCode?: string;
    current?: number;
    size?: number;
   }){
    return request.get<PaginationResult<AgricultureMaterialItem>>({
        url: '/agriculture/material/list',
        params
    })
   }

    //删除农资
    static deleteagricultureMaterial(materialId: number) {
        return request.delete<BaseResult>({
            url: `/agriculture/material/${materialId}`
        })
    }

    //新增农资
    static addagricultureMaterial(data: AgricultureMaterialItem) {
        return request.post<BaseResult>({
            url: '/agriculture/material/add',
            data
        })
    }

    //编辑农资
    static editagricultureMaterial(data: AgricultureMaterialItem) {
        return request.put<BaseResult>({
            url: '/agriculture/material/edit',
            data
        })
    }

    //上传农资文件
    static uploadFile(file: File) {
        const formatData = new FormData()
        formatData.append('file',file)
        return request.post<string>({
            url: '/api/files/upload',
            data: formatData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
    
}
