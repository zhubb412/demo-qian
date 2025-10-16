import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'
import type { CategoryItem } from './classManagementApi'

/**
 *  作物轮作计划
 */

// 作物轮作计划接口
export  interface CropRotationItem {
    id: number;
    rotationId: number;
    rotationName: string;
    rotationBenefit: string;
    rotationCycle: string;
    rotationImage: string | null;
    remark: string | null;
    createTime: string;
    createBy: string | null;
    updateBy: string | null;
    updateTime: string | null;
    rotationClassname: string | null;
    rotationAdapt: string | null;
}

//分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class cropRotationList {
    //获取所有作物轮作计划 模糊查询一起，支持分页
    static listcropRotation(params?: {
        rotationName?: string;
        rotationBenefit?: string;
        current?: number;
        size?: number;
    }){
        return request.get<PaginationResult<CropRotationItem>>({
            url: '/cropRotation/list',
            params
        })
    }

    //获取所有作物种类列表（用于下拉框）
    static getCropList(){
        return request.get<PaginationResult<CategoryItem>>({
            url: '/cropClass/list',
            params: {
                current: 1,
                size: 1000 // 获取所有数据
            }
        })
    }

    //删除作物轮作计划
    static deletecropRotation(id: number){
        return request.delete<BaseResult>({
            url: `/cropRotation/${id}`
        })
    }

    //新增作物轮作计划
    static addcropRotation(data: CropRotationItem){
        return  request.post<BaseResult>({
            url: '/cropRotation/add',
            data
        })
    }

    //编辑作物轮作计划
    static editcropRotation(data: CropRotationItem){
        return request.put<BaseResult>({
            url: '/cropRotation/edit',
            data
        })
    }

    //上传文件
    static uploadFile(file: File){
        const formatData = new FormData()
        formatData.append('file',file)
        return request.post<string>({
            url: '/api/files/upload',
            data: formatData,
            //设置请求头，指明请求体的内容类型为multipart/form-data
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}