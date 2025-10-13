<template>
  <!-- 种类管理页面主容器 -->
  <div class="card">
    <!-- 页面标题 -->
    <h2>种类管理</h2>
    
    <!-- 搜索表单区域 -->
    <div class="search-form">
      <!-- 种类名称搜索框 -->
      <div class="search-item">
        <label class="search-label">种类名称</label>
        <el-input
          v-model="searchForm.className"
          placeholder="请输入种类名称"
          clearable
          style="width: 200px"
        />
      </div>
      
      <!-- 种类类型选择框 -->
      <div class="search-item">
        <label class="search-label">种类类型</label>
        <el-select
          v-model="searchForm.classType"
          placeholder="请选择种类类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="type in classTypes"
            :key="type"
            :label="type"
            :value="type"
          />
        </el-select>
      </div>
      
      <!-- 搜索按钮 -->
      <el-button type="primary" :icon="Search" @click="handleSearch">
        搜索
      </el-button>
      
      <!-- 重置按钮 -->
      <el-button :icon="Refresh" @click="handleReset">
        重置
      </el-button>
      <!-- 新增种类按钮 -->
    <el-button type="primary" @click="showAddDialog">新增种类</el-button>
    </div>
    

    <!-- 种类列表卡片展示 -->
    <div class="categories-grid">
      <div 
        v-for="category in categories" 
        :key="category.classId" 
        class="category-card"
      >
        <!-- 种类图片区域 -->
        <div class="card-image">
          <el-image 
            v-if="category.classImage" 
            :src="category.classImage" 
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

            <!-- 种类名称 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Grid />
              </el-icon>
              <span class="detail-label">种类名称:</span>
              <span class="detail-value">{{ category.className }}</span>
            </div>
            
            <!-- 种类类型 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Grid />
              </el-icon>
              <span class="detail-label">种类类型:</span>
              <span class="detail-value">{{ category.classType }}</span>
            </div>
            
            <!-- 创建时间 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Calendar />
              </el-icon>
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ category.createTime }}</span>
            </div>
            
            <!-- 备注信息 -->
            <div v-if="category.remark" class="detail-item">
              <el-icon class="detail-icon">
                <Document />
              </el-icon>
              <span class="detail-label">备注:</span>
              <span class="detail-value">{{ category.remark }}</span>
            </div>
          </div>
        </div>
        
        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <el-button type="primary" size="small" :icon="Edit" @click="showEditDialog(category)">
            编辑
          </el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="deleteCategory(category.classId)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑种类对话框 -->
    <el-dialog 
      :title="isEditMode ? '编辑种类' : '新增种类'" 
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
        <!-- 种类名称 -->
        <el-form-item label="种类名称" prop="className">
          <el-input 
            v-model="formData.className" 
            placeholder="请输入种类名称"
            clearable
          />
        </el-form-item>
        
        <!-- 种类类型 -->
        <el-form-item label="种类类型" prop="classType">
          <el-input 
            v-model="formData.classType" 
            placeholder="请输入种类类型"
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
        <el-form-item label="种类图片" prop="classImage">
          <el-upload
            class="image-uploader"
            :show-file-list="false"
            :on-change="handleImageChange"
            :before-upload="beforeImageUpload"
            :http-request="customUpload"
            :auto-upload="true"
          >
            <img v-if="formData.classImage" :src="getImagePreviewUrl(formData.classImage)" class="uploaded-image" />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传图片，支持jpg、png格式</div>
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
import { classManagementList, type CategoryItem } from '@/api/classManagementApi';

// 使用API中定义的接口类型
type Category = CategoryItem;

/**
 * 种类管理组件
 * 提供种类的增删改查功能
 */
export default {
  name: 'CategoryManager',
  setup() {
    // 响应式数据定义
    
    /** 种类列表数据 */
    const categories = ref<Category[]>([]);
    
    /** 搜索表单数据 */
    const searchForm = ref({
      className: '', // 种类名称
      classType: ''  // 种类类型
    });
    
    /** 种类类型选项列表 */
    const classTypes = ref<string[]>([]);
    
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
      className: '',
      classType: '',
      createTime: '',
      remark: '',
      classImage: ''
    });
    
    /** 表单验证规则 */
    const formRules = {
      className: [
        { required: true, message: '请输入种类名称', trigger: 'blur' }
      ],
      classType: [
        { required: true, message: '请输入种类类型', trigger: 'blur' }
      ],
      createTime: [
        { required: true, message: '请选择创建时间', trigger: 'change' }
      ]
    };
    
    /** 当前编辑的种类数据 */
    const currentCategory = ref<Category>({
      classId: 0,
      className: '',
      classType: '',
      classImage: null,
      remark: null,
      createTime: '',
      createBy: null,
      updateBy: null,
      updateTime: null,
      status: null
    });
    

    /**
     * 获取种类列表数据
     * @param searchParams 搜索参数
     */
    const fetchCategories = async (searchParams?: { className?: string; classType?: string }) => {
      try {
        // 调用后端API获取种类列表数据
        const response = await classManagementList.listclassManagement(searchParams);
        console.log('重新获取的数据:', response);
        
        // 从响应中提取种类数据，如果response.data为空则使用空数组作为默认值
        categories.value = response.data || [];
        console.log('更新后的categories:', categories.value);
        
        // 提取所有种类类型用于下拉选择
        const types = [...new Set(categories.value.map(cat => cat.classType))];
        classTypes.value = types.filter(type => type); // 过滤掉空值
      } catch (error) {
        console.error('获取种类列表失败:', error);
        ElMessage.error('获取种类列表失败');
      }
    };

    /**
     * 执行搜索操作
     */
    const handleSearch = () => {
      // 准备搜索参数
      const searchParams: { className?: string; classType?: string } = {};
      
      // 如果种类名称不为空，添加到搜索参数
      if (searchForm.value.className.trim()) {
        searchParams.className = searchForm.value.className.trim();
      }
      
      // 如果种类类型不为空，添加到搜索参数
      if (searchForm.value.classType.trim()) {
        searchParams.classType = searchForm.value.classType.trim();
      }
      
      console.log('搜索参数:', searchParams);
      
      // 调用API进行搜索
      fetchCategories(searchParams);
    };

    /**
     * 重置搜索条件
     */
    const handleReset = () => {
      // 清空搜索表单
      searchForm.value = {
        className: '',
        classType: ''
      };
      
      // 重新获取所有数据
      fetchCategories();
    };

    /**
     * 显示新增种类对话框
     */
    const showAddDialog = () => {
      // 设置为新增模式
      isEditMode.value = false;
      
      // 重置表单数据
      formData.value = {
        className: '',
        classType: '',
        createTime: '',
        remark: '',
        classImage: ''
      };
      
      // 显示对话框
      dialogVisible.value = true;
    };

    /**
     * 显示编辑种类对话框
     * @param category 要编辑的种类数据
     */
    const showEditDialog = (category: Category) => {
      // 设置为编辑模式
      isEditMode.value = true;
      
      // 设置当前编辑的种类
      currentCategory.value = { ...category };
      
      // 填充表单数据
      formData.value = {
        className: category.className,
        classType: category.classType,
        createTime: category.createTime,
        remark: category.remark || '',
        classImage: category.classImage || ''
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
    const prepareSubmitData = (): CategoryItem => {
      return {
        classId: 0,
        className: formData.value.className,
        classType: formData.value.classType,
        classImage: formData.value.classImage || null,
        remark: formData.value.remark || null,
        createTime: formData.value.createTime,
        createBy: null,
        updateBy: null,
        updateTime: null,
        status: null
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
        
        console.log('提交的数据:', submitData);
        
        if (isEditMode.value) {
          // 编辑模式：调用更新API
          const updateData = {
            ...submitData,
            classId: currentCategory.value.classId
          };
          const updateResponse = await classManagementList.editclassManagement(updateData);
          console.log('更新API响应:', updateResponse);
          ElMessage.success('编辑种类成功');
        } else {
          // 新增模式：调用新增API
          const addResponse = await classManagementList.addclassManagement(submitData);
          console.log('新增API响应:', addResponse);
          ElMessage.success('新增种类成功');
        }
        
        // 操作成功后刷新列表
        await fetchCategories();
        
        // 关闭对话框
        handleClose();
        
      } catch (error) {
        console.error('操作失败:', error);
        const errorMessage = isEditMode.value ? '编辑失败，请重试' : '新增失败，请重试';
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
        console.log('开始上传文件:', file.name);
        
        // 调用文件上传接口
        const response = await classManagementList.uploadFile(file);
        
        console.log('上传响应:', response);
        
        // 从响应中提取文件路径
        // 响应格式: "文件上传成功: D:/demo-hou/uploads/filename.jpg"
        const filePath = response.replace('文件上传成功: ', '');
        
        // 构造访问URL
        const imageUrl = `http://localhost:8080/uploads/${file.name}`;
        
        // 保存图片URL到表单数据
        formData.value.classImage = imageUrl;
        
        console.log('图片上传成功，URL:', imageUrl);
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
      console.log('文件选择变化:', file);
      // 文件验证在beforeImageUpload中处理
    };

    /**
     * 图片上传成功回调（保留用于兼容）
     */
    const handleImageSuccess = (response: any, file: any) => {
      console.log('图片上传成功回调:', response);
    };

    /**
     * 获取图片预览URL
     */
    const getImagePreviewUrl = (imageData: string) => {
      console.log('获取图片预览URL，imageData:', imageData ? '有数据' : '无数据');
      if (!imageData) return '';
      
      // 如果是完整的URL（http开头），直接返回
      if (imageData.startsWith('http')) {
        console.log('返回完整URL');
        return imageData;
      }
      
      
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
     * 删除种类
     * @param id 要删除的种类ID
     */
    const deleteCategory = async (id: number) => {
      try {
        // 调用后端API删除种类
        await classManagementList.deleteclassManagement(id);
        
        // 删除成功后从列表中移除该种类
        categories.value = categories.value.filter(cat => cat.classId !== id);
        
        // 显示删除成功提示
        ElMessage.success('删除成功');
      } catch (error) {
        console.error('删除种类失败:', error);
        ElMessage.error('删除失败，请重试');
      }
    };

    // 组件初始化时加载数据
    fetchCategories();

    // 返回组件需要的数据和方法
    return {
      categories,
      searchForm,
      classTypes,
      currentCategory,
      dialogVisible,
      isEditMode,
      formRef,
      submitLoading,
      formData,
      formRules,
      fetchCategories,
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
      deleteCategory,
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