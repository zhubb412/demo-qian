import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

/**
 * 种类信息管理
 */


// 种类管理接口
export interface CategoryItem {
    classId: number;
    className: string;
    classType: string;
    classJiage: string | null;
    classImage: string | null;
    classAdapt: string | null;
    classPlanting: string | null;
    classHarvest: string | null;
    remark: string | null;
    createTime: string;
    createBy: string | null;
    updateBy: string | null;
    updateTime: string | null;
    status: string | null;
}


// 分页响应接口
export interface PaginationResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export class classManagementList {
    //获取所有种类 模糊查询一起，支持分页
    static listclassManagement(params?: { 
        className?: string; 
        classType?: string;
        current?: number;
        size?: number;
    }) {
        return request.get<PaginationResult<CategoryItem>>({
            url: '/cropClass/list',
            params
        })
    }

    //删除种类
    static deleteclassManagement(classId: number) {
        return request.delete<BaseResult>({
            url: `/cropClass/${classId}`
        })
    }

    //新增种类
    static addclassManagement(data: CategoryItem) {
        return request.post<BaseResult>({
            url: '/cropClass/add',
            data
        })
    }

    //编辑种类
    static editclassManagement(data: CategoryItem) {
        return request.put<BaseResult>({
            url: '/cropClass/edit',
            data
        })
    }

    //上传文件
    static uploadFile(file: File) {
        const formData = new FormData()
        formData.append('file', file)
        return request.post<string>({
            url: '/api/files/upload',
            data: formData,
            //设置请求头，指明请求体的内容类型为multipart/form-data
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }

}
