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
        <!-- 种类名称，显示在图片上方 -->
        <div class="category-name-header">
          <div class="detail-item">
            <el-icon class="detail-icon">
              <CollectionTag />
            </el-icon>
            <span class="detail-label">种类名称:</span>
            <span class="detail-value category-name-value">{{ category.className }}</span>
          </div>
        </div>
        
        <!-- 种类图片区域 -->
        <div class="card-image">
          <el-image 
            v-if="category.classImage" 
            :src="category.classImage" 
            class="category-image"
            fit="cover"
          />
        </div>
        
        <!-- 卡片内容区域 -->
        <div class="card-content">
          <!-- 详细信息 -->
          <div class="card-details">
            <!-- 种类类型 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Tickets />
              </el-icon>
              <span class="detail-label">种类类型:</span>
              <span class="detail-value">{{ category.classType }}</span>
            </div>
            
            <!-- 适配作物 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Finished />
              </el-icon>
              <span class="detail-label">适配作物:</span>
              <span class="detail-value">{{ category.classAdapt }}</span>
            </div>

            <div class="detail-item">
              <el-icon class="detail-icon">
                <Money />
              </el-icon>
              <span class="detail-label">作物价格:</span>
              <span class="detail-value">{{ category.classJiage }}元</span>
            </div>

            <div class="detail-item">
              <el-icon class="detail-icon">
                <Calendar />
              </el-icon>
              <span class="detail-label">适合种植月份:</span>
              <span class="detail-value">{{ category.classPlanting }}</span>
            </div>

            <div class="detail-item">
              <el-icon class="detail-icon">
                <Calendar />
              </el-icon>
              <span class="detail-label">适合收获月份:</span>
              <span class="detail-value">{{ category.classHarvest }}</span>
            </div>
            
            <!-- 创建时间 -->
            <div class="detail-item">
              <el-icon class="detail-icon">
                <Clock />
              </el-icon>
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ category.createTime }}</span>
            </div>
            
            <!-- 备注信息 -->
            <div v-if="category.remark" class="detail-item detail-remark">
              <el-icon class="detail-icon">
                <Document />
              </el-icon>
              <span class="detail-label">备注:</span>
              <span class="detail-value remark-content">{{ category.remark }}</span>
            </div>
          </div>
        </div>
        
        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <el-button type="success" size="small" @click="showTaskDialog(category)">
            生长任务
          </el-button>
          <el-button type="primary" size="small" :icon="Edit" @click="showEditDialog(category)">
            编辑
          </el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="deleteCategory(category.classId)">
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
        label-width="120px"
        :hide-required-asterisk="true"
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

        <!-- 作物价格 -->
        <el-form-item label="作物价格" prop="classJiage">
          <el-input 
            v-model="formData.classJiage" 
            placeholder="请输入作物价格(元)"
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

            <!-- 适配作物 -->
            <el-form-item label="适配作物" prop="classAdapt">
          <el-input 
            v-model="formData.classAdapt" 
            placeholder="请输入适配作物"
            clearable
          />
        </el-form-item>
        
        <!-- 适合种植月份 -->
        <el-form-item label="适合种植月份" prop="classPlanting">
          <el-select 
            v-model="formData.classPlanting" 
            placeholder="请选择适合种植月份"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="month in monthOptions"
              :key="month.value"
              :label="month.label"
              :value="month.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 适合收获月份 -->
        <el-form-item label="适合收获月份" prop="classHarvest">
          <el-select 
            v-model="formData.classHarvest" 
            placeholder="请选择适合收获月份"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="month in monthOptions"
              :key="month.value"
              :label="month.label"
              :value="month.value"
            />
          </el-select>
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
            class="image-uploader-full"
            :show-file-list="false"
            :on-change="handleImageChange"
            :before-upload="beforeImageUpload"
            :http-request="customUpload"
            :auto-upload="true"
          >
            <img v-if="formData.classImage" :src="getImagePreviewUrl(formData.classImage)" class="uploaded-image-full" />
            <div v-else class="upload-placeholder-full">
              <div class="upload-icon-full">+</div>
              <div class="upload-text-full">点击上传图片</div>
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

    <!-- 任务管理对话框 -->
    <el-dialog 
      title="任务管理" 
      v-model="taskDialogVisible" 
      width="60%"
      :before-close="handleTaskDialogClose"
      top="5vh"
    >
      <TaskManagement :category="selectedCategory || undefined" />
    </el-dialog>

  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Picture, 
  Grid, 
  Calendar, 
  Document, 
  Edit, 
  Delete, 
  Search, 
  Refresh, 
  Plus,
  CollectionTag,
  Tickets,
  Finished,
  Money,
  Clock
} from '@element-plus/icons-vue';
import { classManagementList, type CategoryItem, type PaginationResult } from '@/api/classManagementApi';
// @ts-ignore
import TaskManagement from '@/views/task/index.vue';

// 使用API中定义的接口类型
type Category = CategoryItem;

/**
 * 种类管理组件
 * 提供种类的增删改查功能
 */
export default {
  name: 'CategoryManager',
  components: {
    TaskManagement
  },
  setup() {
    // 响应式数据定义
    
    /** 种类列表数据 */
    const categories = ref<Category[]>([]);
    
    /** 分页信息 */
    const pagination = ref({
      current: 1,    // 当前页
      size: 8,       // 每页条数
      total: 0,      // 总条数
      pages: 0       // 总页数
    });
    
    /** 搜索表单数据 */
    const searchForm = ref({
      className: '', // 种类名称
      classType: ''  // 种类类型
    });
    
    /** 种类类型选项列表 */
    const classTypes = ref<string[]>([]);
    
    /** 月份选项列表 */
    const monthOptions = ref([
      { label: '一月', value: '一月' },
      { label: '二月', value: '二月' },
      { label: '三月', value: '三月' },
      { label: '四月', value: '四月' },
      { label: '五月', value: '五月' },
      { label: '六月', value: '六月' },
      { label: '七月', value: '七月' },
      { label: '八月', value: '八月' },
      { label: '九月', value: '九月' },
      { label: '十月', value: '十月' },
      { label: '十一月', value: '十一月' },
      { label: '十二月', value: '十二月' }
    ]);
    
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
      classImage: '',
      classAdapt: '',
      classPlanting: '',
      classHarvest: '',
      classJiage: ''
    });
    
    /** 表单验证规则 */
    const formRules = {
      className: [
        { required: true, message: '请输入种类名称', trigger: 'blur' }
      ],
      createTime: [
        { required: true, message: '请选择创建时间', trigger: 'change' }
      ],
      classPlanting: [
        { required: true, message: '请选择适合种植月份', trigger: 'change' }
      ],
      classHarvest: [
        { required: true, message: '请选择适合收获月份', trigger: 'change' }
      ],
      classJiage: [
        { required: true, message: '请输入作物价格（元）', trigger: 'blur' }
      ]
    };
    
    /** 当前编辑的种类数据 */
    const currentCategory = ref<Category>({
      classId: 0,
      className: '',
      classType: '',
      classImage: null,
      classAdapt: null,
      classPlanting: null,
      classHarvest: null,
      remark: null,
      createTime: '',
      createBy: null,
      updateBy: null,
      updateTime: null,
      status: null,
      classJiage: null
    });
    
    /** 任务管理对话框显示状态 */
    const taskDialogVisible = ref(false);
    
    /** 选中的种类数据（用于任务管理） */
    const selectedCategory = ref<Category | null>(null);
    

    /**
     * 准备搜索参数
     */
    const getSearchParams = () => {
      const params: { className?: string; classType?: string } = {};
      if (searchForm.value.className.trim()) {
        params.className = searchForm.value.className.trim();
      }
      if (searchForm.value.classType.trim()) {
        params.classType = searchForm.value.classType.trim();
      }
      return params;
    };

    /**
     * 获取种类列表数据
     */
    const fetchCategories = async (page: number = pagination.value.current, pageSize: number = pagination.value.size) => {
      try {
        const params = {
          ...getSearchParams(),
          current: page,
          size: pageSize
        };
        
        console.log('请求参数:', params);
        const response = await classManagementList.listclassManagement(params);
        console.log('API响应:', response);
        
        if (response && response.records) {
          categories.value = response.records || [];
          pagination.value = {
            current: response.current,
            size: response.size,
            total: response.total,
            pages: response.pages
          };
        } else {
          categories.value = [];
          pagination.value = { current: 1, size: 8, total: 0, pages: 0 };
        }
        
        // 提取种类类型用于下拉选择
        const types = [...new Set(categories.value.map(cat => cat.classType))];
        classTypes.value = types.filter(type => type);
      } catch (error) {
        console.error('获取种类列表失败:', error);
        ElMessage.error('获取种类列表失败');
      }
    };

    /**
     * 执行搜索操作
     */
    const handleSearch = () => {
      pagination.value.current = 1;
      fetchCategories(1, pagination.value.size);
    };

    /**
     * 重置搜索条件
     */
    const handleReset = () => {
      searchForm.value = { className: '', classType: '' };
      pagination.value.current = 1;
      fetchCategories(1, pagination.value.size);
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
        classImage: '',
        classAdapt: '',
        classPlanting: '',
        classHarvest: '',
        classJiage: ''
      };
      
      // 显示对话框
      dialogVisible.value = true;
    };

    /**
     * 显示编辑种类对话框
     * @param category 要编辑的种类数据（任务管理可以获取到种类所有数据）
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
        classImage: category.classImage || '',
        classAdapt: category.classAdapt || '',
        classPlanting: category.classPlanting || '',
        classHarvest: category.classHarvest || '',
        classJiage: category.classJiage || ''
      };
      
      // 显示对话框
      dialogVisible.value = true;
    };

    /**
     * 显示任务管理对话框
     * @param category 选中的种类数据
     */
    const showTaskDialog = (category: Category) => {
      selectedCategory.value = { ...category };
      taskDialogVisible.value = true;
    };

    /**
     * 关闭任务管理对话框
     */
    const handleTaskDialogClose = () => {
      taskDialogVisible.value = false;
      selectedCategory.value = null;
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
        classAdapt: formData.value.classAdapt || null,
        classPlanting: formData.value.classPlanting || null,
        classHarvest: formData.value.classHarvest || null,
        remark: formData.value.remark || null,
        createTime: formData.value.createTime,
        createBy: null,
        updateBy: null,
        updateTime: null,
        status: null,
        classJiage: formData.value.classJiage || null
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
            classId: currentCategory.value.classId
          };
          await classManagementList.editclassManagement(updateData);
          ElMessage.success('编辑种类成功');
        } else {
          // 新增模式：调用新增API
          await classManagementList.addclassManagement(submitData);
          ElMessage.success('新增种类成功');
        }
        
        // 操作成功后刷新列表
        await fetchCategories(pagination.value.current, pagination.value.size);
        
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
        // 调用文件上传接口
        const response = await classManagementList.uploadFile(file);
        
        // 构造访问URL
        const imageUrl = `http://localhost:8080/uploads/${file.name}`;
        
        // 保存图片URL到表单数据
        formData.value.classImage = imageUrl;
        
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
        
        // 如果当前页没有数据了且不是第一页，则跳转到上一页
        if (categories.value.length === 0 && pagination.value.current > 1) {
          pagination.value.current -= 1;
        }
        // 刷新当前页数据
        await fetchCategories(pagination.value.current, pagination.value.size);
      } catch (error) {
        console.error('删除种类失败:', error);
        ElMessage.error('删除失败，请重试');
      }
    };

    /**
     * 处理分页变化
     */
    const handlePageChange = async (page: number) => {
      console.log('分页变化:', page);
      pagination.value.current = page;
      await fetchCategories(page, pagination.value.size);
    };

    /**
     * 处理每页条数变化
     */
    const handleSizeChange = async (size: number) => {
      pagination.value.current = 1;
      pagination.value.size = size;
      await fetchCategories(1, size);
    };

    // 组件初始化时加载数据
    fetchCategories();

    // 返回组件需要的数据和方法
    return {
      categories,
      pagination,
      searchForm,
      classTypes,
      monthOptions,
      currentCategory,
      dialogVisible,
      isEditMode,
      formRef,
      submitLoading,
      formData,
      formRules,
      taskDialogVisible,
      selectedCategory,
      fetchCategories,
      handleSearch,
      handleReset,
      showAddDialog,
      showEditDialog,
      showTaskDialog,
      handleClose,
      handleTaskDialogClose,
      prepareSubmitData,
      handleSubmit,
      customUpload,
      handleImageChange,
      handleImageSuccess,
      getImagePreviewUrl,
      beforeImageUpload,
      deleteCategory,
      handlePageChange,
      handleSizeChange,
      // 图标组件
      Search,
      Refresh,
      Edit,
      Delete,
      Plus,
      Grid,
      Picture,
      Calendar,
      Document,
      CollectionTag,
      Tickets,
      Finished,
      Money,
      Clock,
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

/* 撑满整行的图片上传样式 */
.image-uploader-full {
  width: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-uploader-full:hover {
  border-color: #409eff;
}

/* 确保整个上传区域都可以点击 */
.image-uploader-full :deep(.el-upload) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 撑满整行的上传占位符样式 */
.upload-placeholder-full {
  width: 100%;
  height: 200px;
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

.upload-placeholder-full:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.upload-icon-full {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 8px;
  font-weight: 300;
  line-height: 1;
}

.upload-text-full {
  font-size: 14px;
  color: #8c939d;
}

.uploaded-image-full {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

/* 表单标签样式 - 防止文字换行并左对齐 */
:deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
  min-width: 120px;
  text-align: left !important;
  justify-content: flex-start !important;
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
  display: flex;
  flex-direction: column;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 种类名称标题区域（图片上方） */
.category-name-header {
  padding: 16px 20px 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.category-name-header .detail-label {
  font-weight: bold !important;
  color: #303133;
}

.category-name-value {
  font-weight: bold !important;
  font-size: 16px;
  color: #303133;
}

/* 卡片图片区域 */
.card-image {
  width: 100%;
  height: 220px;
  position: relative;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 卡片内容区域 */
.card-content {
  padding: 20px;
  flex: 1;
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

/* 备注区域：固定高度，超出内容可滚动，避免撑高卡片 */
.detail-remark {
  align-items: flex-start;
}

.remark-content {
  max-height: 60px; /* 可根据需要调整显示的高度 */
  overflow-y: auto;
  display: block;
  line-height: 1.6;
}

/* 卡片操作按钮区域 */
.card-actions {
  padding: 0 20px 20px 20px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: auto; /* 将按钮区域固定在卡片底部 */
}

.card-actions .el-button {
  flex: 1;
  max-width: 70px;
  height: 30px;
  font-size: 12px;
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