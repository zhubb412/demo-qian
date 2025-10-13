import request from '@/utils/http'
import type { BaseResult, BaseArrayResult } from '@/types/axios'

// 种类管理接口
export interface CategoryItem {
    classId: number;
    className: string;
    classType: string;
    classImage: string | null;
    remark: string | null;
    createTime: string;
    createBy: string | null;
    updateBy: string | null;
    updateTime: string | null;
    status: string | null;
}


export class classManagementList {
    //获取所有种类 模糊查询一起
    static listclassManagement(params?: { className?: string; classType?: string }) {
        return request.get<BaseArrayResult<CategoryItem>>({
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

    //获取种类详情
    static getclassManagement(classId: number) {
        return request.get<BaseResult<CategoryItem>>({
            url: `/cropClass/get/${classId}`
        })
    }

    //上传文件
    static uploadFile(file: File) {
        const formData = new FormData()
        formData.append('file', file)
        return request.post<string>({
            url: '/api/files/upload',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }

}
