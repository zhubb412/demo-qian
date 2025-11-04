<template>
  <!-- 农资管理页面主容器 -->
  <div class="card">
    <!-- 页面标题 -->
    <h2>农资管理</h2>
    
    <!-- 搜索表单区域 -->
    <div class="search-form">
      <!-- 农资名称搜索框 -->
      <div class="search-item">
        <label class="search-label">农资名称</label>
        <el-input
          v-model="searchForm.materialName"
          placeholder="请输入农资名称"
          clearable
          style="width: 200px"
        />
      </div>
      
      <!-- 农资编码搜索框 -->
      <div class="search-item">
        <label class="search-label">农资编码</label>
        <el-input
          v-model="searchForm.materialCode"
          placeholder="请输入农资编码"
          clearable
          style="width: 200px"
        />
      </div>
      
      <!-- 搜索按钮 -->
      <el-button type="primary" :icon="Search" @click="handleSearch">
        搜索
      </el-button>
      
      <!-- 重置按钮 -->
      <el-button :icon="Refresh" @click="handleReset">
        重置
      </el-button>
      <!-- 新增农资按钮 -->
    <el-button type="primary" @click="showAddDialog">新增农资</el-button>
    </div>
    

    <!-- 农资列表卡片展示 -->
    <div class="categories-grid">
      <div 
        v-for="material in materials" 
        :key="material.materialId" 
        class="category-card"
      >
        <!-- 农资图片区域 -->
        <div class="card-image">
          <el-image 
            v-if="material.materialImage" 
            :src="material.materialImage" 
            class="category-image"
            fit="cover"
          />
          <!-- 没有图片时显示默认图片 -->
          <div v-else class="no-image">
            <el-icon size="48" color="#c0c4cc">
              <Picture />
            </el-icon>
            <span>暂无图片</span>
          </div>
        </div>
        
        <!-- 卡片内容区域 -->
        <div class="card-content">
          <!-- 详细信息 -->
          <div class="card-details">

            <!-- 农资编码 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Grid />
              </el-icon>
              <span class="detail-label">农资编码:</span>
              <span class="detail-value">{{ material.materialCode }}</span>
            </div>
            
            <!-- 农资名称 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Grid />
              </el-icon>
              <span class="detail-label">农资名称:</span>
              <span class="detail-value">{{ material.materialName }}</span>
            </div>
            
            <!-- 计量单位 -->
            <div v-if="material.measureUnit" class="detail-item">
              <el-icon class="detail-icon">
                <Grid />
              </el-icon>
              <span class="detail-label">计量单位:</span>
              <span class="detail-value">{{ material.measureUnit }}</span>
            </div>
            
            <!-- 农资价格 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Grid />
              </el-icon>
              <span class="detail-label">农资价格:</span>
              <span class="detail-value">{{ material.materialJg}}</span>
            </div>
            
            <!-- 创建时间 -->
            <div v-if="material.createTime" class="detail-item">
              <el-icon class="detail-icon">
                <Calendar />
              </el-icon>
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ material.createTime }}</span>
            </div>
            
            <!-- 备注信息 -->
            <div v-if="material.remark" class="detail-item">
              <el-icon class="detail-icon">
                <Document />
              </el-icon>
              <span class="detail-label">备注:</span>
              <span class="detail-value">{{ material.remark }}</span>
            </div>
          </div>
        </div>
        
        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <el-button type="primary" size="small" :icon="Edit" @click="showEditDialog(material)">
            编辑
          </el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="deleteMaterial(material.materialId)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页组件 - 只有当数据超过8条时才显示 -->
    <div v-if="pagination.total > 8" class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[8, 16, 24, 32]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        background
        :page-size-options="['8条/页', '16条/页', '24条/页', '32条/页']"
        :total-text="`共 ${pagination.total} 条`"
        :jumper-text="'前往'"
      />
    </div>

    <!-- 新增/编辑农资对话框 -->
    <el-dialog 
      :title="isEditMode ? '编辑农资' : '新增农资'" 
      v-model="dialogVisible" 
      width="600px"
      :before-close="handleClose"
    >
      <el-form 
        :model="formData" 
        :rules="formRules" 
        ref="formRef" 
        label-width="100px"
      >
        <!-- 农资编码 -->
        <el-form-item label="农资编码" prop="materialCode">
          <el-input 
            v-model="formData.materialCode" 
            placeholder="请输入农资编码"
            clearable
          />
        </el-form-item>
        
        <!-- 农资名称 -->
        <el-form-item label="农资名称" prop="materialName">
          <el-input 
            v-model="formData.materialName" 
            placeholder="请输入农资名称"
            clearable
          />
        </el-form-item>
        
        <!-- 计量单位 -->
        <el-form-item label="计量单位" prop="measureUnit">
          <el-input 
            v-model="formData.measureUnit" 
            placeholder="请输入计量单位"
            clearable
          />
        </el-form-item>
        <!-- 农资价格 -->
        <el-form-item label="农资价格" prop="materialJg">
          <el-input 
            v-model="formData.materialJg" 
            placeholder="请输入农资价格"
            clearable
          />
        </el-form-item>
        
        <!-- 创建时间 -->
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="formData.createTime"
            type="datetime"
            placeholder="选择创建时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        
        <!-- 备注 -->
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        
        <!-- 上传图片 -->
        <el-form-item label="农资图片" prop="materialImage">
          <el-upload
            class="image-uploader"
            :show-file-list="false"
            :on-change="handleImageChange"
            :before-upload="beforeImageUpload"
            :http-request="customUpload"
            :auto-upload="true"
          >
            <img v-if="formData.materialImage" :src="getImagePreviewUrl(formData.materialImage)" class="uploaded-image" />
            <div v-else class="upload-placeholder">
              <div class="upload-icon">+</div>
              <div class="upload-text">点击上传图片</div>
            </div>
          </el-upload>
          <div class="upload-tip">支持jpg、png格式，文件大小不超过2MB</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确 定
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Picture, Grid, Calendar, Document, Edit, Delete, Search, Refresh, Plus } from '@element-plus/icons-vue';
import { agricultureMaterialList, type AgricultureMaterialItem, type PaginationResult } from '@/api/agricultureMaterialApi';

// 使用API中定义的接口类型
type Material = AgricultureMaterialItem;

/**
 * 农资管理组件
 * 提供农资的增删改查功能
 */
export default {
  name: 'AgricultureMaterialManager',
  setup() {
    // 响应式数据定义
    
    /** 农资列表数据 */
    const materials = ref<Material[]>([]);
    
    /** 分页信息 */
    const pagination = ref({
      current: 1,    // 当前页
      size: 8,       // 每页条数
      total: 0,      // 总条数
      pages: 0       // 总页数
    });
    
    /** 搜索表单数据 */
    const searchForm = ref({
      materialName: '', // 农资名称
      materialCode: ''  // 农资编码
    });
    
    /** 对话框显示状态 */
    const dialogVisible = ref(false);
    
    /** 是否为编辑模式 */
    const isEditMode = ref(false);
    
    /** 表单引用 */
    const formRef = ref();
    
    /** 提交加载状态 */
    const submitLoading = ref(false);
    
    /** 表单数据 */
    const formData = ref({
      materialCode: '',
      materialName: '',
      measureUnit: '',
      createTime: '',
      remark: '',
      materialImage: '', 
      materialJg: ''
    });
    
    /** 表单验证规则 */
    const formRules = {
      materialCode: [
        { required: true, message: '请输入农资编码', trigger: 'blur' }
      ],
      materialName: [
        { required: true, message: '请输入农资名称', trigger: 'blur' }
      ],
      measureUnit: [
        { required: true, message: '请输入计量单位', trigger: 'blur' }
      ],
      createTime: [
        { required: true, message: '请选择创建时间', trigger: 'change' }
      ]
    };
    
    /** 当前编辑的农资数据 */
    const currentMaterial = ref<Material>({
      materialId: 0,
      materialCode: '',
      materialName: '',
      materialImage: null,
      measureUnit: null,
      materialJg: null,
      remark: null,
      createTime: null,
      createBy: null,
      updateBy: null,
      updateTime: null,
      status: null,
      orderNum: null
    });
    

    /**
     * 准备搜索参数
     */
    const getSearchParams = () => {
      const params: { materialName?: string; materialCode?: string } = {};
      if (searchForm.value.materialName.trim()) {
        params.materialName = searchForm.value.materialName.trim();
      }
      if (searchForm.value.materialCode.trim()) {
        params.materialCode = searchForm.value.materialCode.trim();
      }
      return params;
    };

    /**
     * 获取农资列表数据
     */
    const fetchMaterials = async (page: number = pagination.value.current, pageSize: number = pagination.value.size) => {
      try {
        const params = {
          ...getSearchParams(),
          current: page,
          size: pageSize
        };
        
        console.log('请求参数:', params);
        const response = await agricultureMaterialList.listagricultureMaterial(params);
        console.log('API响应:', response);
        
        if (response && response.records) {
          materials.value = response.records || [];
          pagination.value = {
            current: response.current,
            size: response.size,
            total: response.total,
            pages: response.pages
          };
        } else {
          materials.value = [];
          pagination.value = { current: 1, size: 8, total: 0, pages: 0 };
        }
      } catch (error) {
        console.error('获取农资列表失败:', error);
        ElMessage.error('获取农资列表失败');
      }
    };

    /**
     * 执行搜索操作
     */
    const handleSearch = () => {
      pagination.value.current = 1;
      fetchMaterials(1, pagination.value.size);
    };

    /**
     * 重置搜索条件
     */
    const handleReset = () => {
      searchForm.value = { materialName: '', materialCode: '' };
      pagination.value.current = 1;
      fetchMaterials(1, pagination.value.size);
    };

    /**
     * 显示新增农资对话框
     */
    const showAddDialog = () => {
      // 设置为新增模式
      isEditMode.value = false;
      
      // 重置表单数据
      formData.value = {
        materialCode: '',
        materialName: '',
        measureUnit: '',
        createTime: '',
        remark: '',
        materialImage: '',
        materialJg: ''
      };
      
      // 显示对话框
      dialogVisible.value = true;
    };

    /**
     * 显示编辑农资对话框
     * @param material 要编辑的农资数据
     */
    const showEditDialog = (material: Material) => {
      // 设置为编辑模式
      isEditMode.value = true;
      
      // 设置当前编辑的农资
      currentMaterial.value = { ...material };
      
      // 填充表单数据
      formData.value = {
        materialCode: material.materialCode,
        materialName: material.materialName,
        measureUnit: material.measureUnit || '',
        createTime: material.createTime || '',
        remark: material.remark || '',
        materialImage: material.materialImage || '',
        materialJg: material.materialJg || ''
      };
      
      // 显示对话框
      dialogVisible.value = true;
    };

    /**
     * 关闭对话框
     */
    const handleClose = () => {
      dialogVisible.value = false;
      // 重置表单
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };

    /**
     * 准备提交数据
     */
    const prepareSubmitData = (): AgricultureMaterialItem => {
      return {
        materialId: 0,
        materialCode: formData.value.materialCode,
        materialName: formData.value.materialName,
        materialImage: formData.value.materialImage || null,
        measureUnit: formData.value.measureUnit || null,
        materialJg: formData.value.materialJg || null,
        remark: formData.value.remark || null,
        createTime: formData.value.createTime,
        createBy: null,
        updateBy: null,
        updateTime: null,
        status: null,
        orderNum: null
      };
    };

    /**
     * 提交表单
     */
    const handleSubmit = async () => {
      if (!formRef.value) return;
      
      try {
        // 表单验证
        await formRef.value.validate();
        
        submitLoading.value = true;
        
        // 准备提交数据
        const submitData = prepareSubmitData();
        
        if (isEditMode.value) {
          // 编辑模式：调用更新API
          const updateData = {
            ...submitData,
            materialId: currentMaterial.value.materialId
          };
          await agricultureMaterialList.editagricultureMaterial(updateData);
          ElMessage.success('编辑农资成功');
        } else {
          // 新增模式：调用新增API
          await agricultureMaterialList.addagricultureMaterial(submitData);
          ElMessage.success('新增农资成功');
        }
        
        // 操作成功后刷新列表
        await fetchMaterials(pagination.value.current, pagination.value.size);
        
        // 关闭对话框
        handleClose();
        
      } catch (error) {
        console.error('操作失败:', error);
        const errorMessage = isEditMode.value ? '编辑农资失败，请重试' : '新增农资失败，请重试';
        ElMessage.error(errorMessage);
      } finally {
        submitLoading.value = false;
      }
    };

    /**
     * 自定义文件上传方法
     */
    const customUpload = async (options: any) => {
      const { file, onSuccess, onError } = options;
      
      try {
        // 调用文件上传接口
        const response = await agricultureMaterialList.uploadFile(file);
        
        // 构造访问URL
        const imageUrl = `http://localhost:8080/uploads/${file.name}`;
        
        // 保存图片URL到表单数据
        formData.value.materialImage = imageUrl;
        
        onSuccess(response);
        ElMessage.success('图片上传成功');
        
      } catch (error) {
        console.error('图片上传失败:', error);
        onError(error);
        ElMessage.error('图片上传失败，请重试');
      }
    };

    /**
     * 图片文件选择变化处理
     */
    const handleImageChange = (file: any, fileList: any) => {
      // 文件验证在beforeImageUpload中处理
    };

    /**
     * 图片上传成功回调（保留用于兼容）
     */
    const handleImageSuccess = (response: any, file: any) => {
      // 保留用于兼容
    };

    /**
     * 获取图片预览URL
     */
    const getImagePreviewUrl = (imageData: string) => {
      if (!imageData) return '';
      
      // 如果是完整的URL（http开头），直接返回
      if (imageData.startsWith('http')) {
        return imageData;
      }
      
      return imageData;
    };

    /**
     * 图片上传前验证
     */
    const beforeImageUpload = (file: any) => {
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!');
        return false;
      }
      return true;
    };


    /**
     * 删除农资
     * @param id 要删除的农资ID
     */
    const deleteMaterial = async (id: number) => {
      try {
        // 调用后端API删除农资
        await agricultureMaterialList.deleteagricultureMaterial(id);
        
        // 删除成功后从列表中移除该农资
        materials.value = materials.value.filter(mat => mat.materialId !== id);
        
        // 显示删除成功提示
        ElMessage.success('删除成功');
        
        // 如果当前页没有数据了且不是第一页，则跳转到上一页
        if (materials.value.length === 0 && pagination.value.current > 1) {
          pagination.value.current -= 1;
        }
        // 刷新当前页数据
        await fetchMaterials(pagination.value.current, pagination.value.size);
      } catch (error) {
        console.error('删除农资失败:', error);
        ElMessage.error('删除失败，请重试');
      }
    };

    /**
     * 处理分页变化
     */
    const handlePageChange = async (page: number) => {
      console.log('分页变化:', page);
      pagination.value.current = page;
      await fetchMaterials(page, pagination.value.size);
    };

    /**
     * 处理每页条数变化
     */
    const handleSizeChange = async (size: number) => {
      pagination.value.current = 1;
      pagination.value.size = size;
      await fetchMaterials(1, size);
    };

    // 组件初始化时加载数据
    fetchMaterials();

    // 返回组件需要的数据和方法
    return {
      materials,
      pagination,
      searchForm,
      currentMaterial,
      dialogVisible,
      isEditMode,
      formRef,
      submitLoading,
      formData,
      formRules,
      fetchMaterials,
      handleSearch,
      handleReset,
      showAddDialog,
      showEditDialog,
      handleClose,
      prepareSubmitData,
      handleSubmit,
      customUpload,
      handleImageChange,
      handleImageSuccess,
      getImagePreviewUrl,
      beforeImageUpload,
      deleteMaterial,
      handlePageChange,
      handleSizeChange,
      // 图标组件
      Search,
      Refresh,
      Edit,
      Delete,
      Plus,
    };
  },
};
</script>

<style scoped>
/* 页面主容器样式 */
.card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 页面标题样式 */
h2 {
  margin: 0 0 20px 0;
  color: #303133;
}

/* 搜索表单样式 */
.search-form {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  flex-wrap: nowrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.search-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  min-width: 80px;
  width: 80px;
  flex-shrink: 0;
}

/* 对话框底部按钮区域样式 */
.dialog-footer {
  text-align: right;
}

/* 图片上传样式 */
.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保整个上传区域都可以点击 */
.image-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-uploader:hover {
  border-color: #409eff;
}

/* 上传占位符样式 */
.upload-placeholder {
  width: 178px;
  height: 178px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 8px;
  font-weight: 300;
  line-height: 1;
}

.upload-text {
  font-size: 14px;
  color: #8c939d;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.uploaded-image {
  width: 178px;
  height: 178px;
  object-fit: cover;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 卡片网格布局 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
}

/* 单个卡片样式 */
.category-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 卡片图片区域 */
.card-image {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 无图片时的占位样式 */
.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.no-image span {
  margin-top: 8px;
  font-size: 14px;
}

/* 卡片内容区域 */
.card-content {
  padding: 20px;
}

/* 卡片标题 */
.card-title {
  margin-bottom: 16px;
}

.card-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

/* 详细信息区域 */
.card-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-icon {
  margin-right: 8px;
  color: #409eff;
  font-size: 16px;
}

.detail-label {
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.detail-value {
  color: #303133;
  font-weight: 500;
  flex: 1;
  word-break: break-all;
}

/* 卡片操作按钮区域 */
.card-actions {
  padding: 0 20px 20px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.card-actions .el-button {
  flex: 1;
  max-width: 60px;
  height: 30px;
}

/* 分页组件样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px 0;
}

.pagination-container .el-pagination {
  --el-pagination-bg-color: #fff;
  --el-pagination-text-color: #606266;
  --el-pagination-border-radius: 4px;
  --el-pagination-button-bg-color: #fff;
  --el-pagination-button-color: #606266;
  --el-pagination-button-disabled-bg-color: #fff;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-hover-color: #409eff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-image {
    height: 160px;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .card-actions {
    padding: 0 16px 16px 16px;
  }
}

@media (max-width: 480px) {
  .card {
    margin: 0 -8px;
    border-radius: 8px;
  }
  
  .card-image {
    height: 140px;
  }
  
  .card-title h3 {
    font-size: 16px;
  }
  
  .detail-item {
    font-size: 13px;
  }
  
  .detail-label {
    min-width: 70px;
  }
}
</style>