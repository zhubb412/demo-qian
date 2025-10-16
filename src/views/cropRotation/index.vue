<template>
    <!-- 作物轮作计划页面主容器 -->
    <div class="card">
      <!-- 页面标题 -->
      <h2>作物轮作计划</h2>
      
      <!-- 搜索表单区域 -->
      <div class="search-form">
        <!-- 种类名称搜索框 -->
        <div class="search-item">
          <label class="search-label">轮作计划名称</label>
          <el-input
            v-model="searchForm.rotationName"
            placeholder="请输入作物轮作计划名称"
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
        <!-- 新增种类按钮 -->
      <el-button type="primary" @click="showAddDialog">新增轮作计划</el-button>
      </div>
      
  
      <!-- 轮作计划列表卡片展示 -->
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-card"
        >
          <!-- 轮作计划图片轮播区域 -->
          <div class="card-image">
            <!-- 有图片时显示轮播 -->
            <div v-if="getImageList(category.rotationImage).length > 0" class="card-carousel-wrapper">
              <el-carousel 
                :interval="3000" 
                :autoplay="true" 
                height="200px"
                indicator-position="outside"
                :arrow="getImageList(category.rotationImage).length > 1 ? 'hover' : 'never'"
              >
                <el-carousel-item 
                  v-for="(image, index) in getImageList(category.rotationImage)" 
                  :key="index"
                >
                  <div class="card-carousel-image-container">
                    <el-image 
                      :src="image" 
                      class="card-carousel-image"
                      fit="cover"
                    />
                  </div>
                </el-carousel-item>
              </el-carousel>
            </div>
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
  
              <!-- 作物轮作计划名称 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">轮作计划名称:</span>
                <span class="detail-value">{{ category.rotationName }}</span>
              </div>

              

              
              <!-- 作物轮作计划好处 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">轮作计划好处:</span>
                <span class="detail-value">{{ category.rotationBenefit }}</span>
              </div>
              
              <!-- 作物轮作周期 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">作物轮作周期:</span>
                <span class="detail-value">{{ category.rotationCycle }}</span>
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
            <el-button type="danger" size="small" :icon="Delete" @click="deleteCategory(category.id)">
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
        :title="isEditMode ? '编辑轮作计划' : '新增轮作计划'" 
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
          <!-- 作物名称 -->
          <el-form-item label="作物名称" prop="cropName">
            <el-select 
              v-model="formData.cropName" 
              placeholder="请选择作物名称"
              clearable
              style="width: 100%"
              @change="handleCropChange"
            >
              <el-option
                v-for="crop in cropList"
                :key="crop.classId"
                :label="crop.className"
                :value="String(crop.classId)"
              />
            </el-select>
          </el-form-item>

           <!-- 适配作物 -->
           <el-form-item label="适配作物" prop="adaptedCrop">
            <el-input 
              v-model="formData.adaptedCrop" 
              placeholder="请输入适配作物"
              clearable
            />
          </el-form-item>
          
          
          <!-- 作物轮作计划名称 -->
          <el-form-item label="计划名称" prop="rotationName">
            <el-input 
              v-model="formData.rotationName" 
              placeholder="请输入作物轮作计划名称"
              clearable
            />
          </el-form-item>
          
          <!-- 作物轮作计划好处 -->
          <el-form-item label="计划好处" prop="rotationBenefit">
            <el-input 
              v-model="formData.rotationBenefit" 
              type="textarea"
              :rows="2"
              placeholder="请输入作物轮作计划好处"
              clearable
            />
          </el-form-item>
          
          <!-- 轮作周期 -->
          <el-form-item label="轮作周期" prop="rotationCycle">
            <el-input 
              v-model="formData.rotationCycle" 
              placeholder="请输入轮作周期"
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
          
          <!-- 计划图片轮播 -->
          <el-form-item label="计划图片" prop="rotationImages">
            <div class="image-carousel-container">
              <!-- 轮播展示 -->
              <div v-if="formData.rotationImages.length > 0" class="carousel-wrapper">
                <el-carousel 
                  :interval="2000" 
                  :autoplay="true" 
                  height="200px"
                  indicator-position="outside"
                >
                  <el-carousel-item 
                    v-for="(image, index) in formData.rotationImages" 
                    :key="index"
                  >
                    <!-- 图片容器 -->
                    <div class="carousel-image-container">
                      <!-- 图片组件，不支持预览功能 -->
                      <el-image 
                        :src="getImagePreviewUrl(image)" 
                        class="carousel-image"
                        fit="cover"
                      />
                    </div>
                  </el-carousel-item>
                </el-carousel>
              </div>
              
              <!-- 无图片时的占位符 -->
              <div v-else class="no-images-placeholder">
                <div class="placeholder-icon">
                  <el-icon size="48" color="#c0c4cc">
                    <Picture />
                  </el-icon>
                </div>
                <div class="placeholder-text">请先选择作物名称</div>
                <div class="placeholder-tip">系统将自动填充对应的作物图片</div>
              </div>
            </div>
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
  import { cropRotationList, type CropRotationItem, type PaginationResult } from '@/api/cropRotationApi';
  import type { CategoryItem } from '@/api/classManagementApi';
  
  
  /**
   * 种类管理组件
   * 提供种类的增删改查功能
   */
  export default {
    name: 'CategoryManager',
    setup() {
      // 响应式数据定义
      
      /** 作物轮作计划列表数据 */
      const categories = ref<CropRotationItem[]>([]);
      
      /** 分页信息 */
      const pagination = ref({
        current: 1,    // 当前页
        size: 8,       // 每页条数
        total: 0,      // 总条数
        pages: 0       // 总页数
      });
      
      /** 搜索表单数据 */
      const searchForm = ref({
        rotationName: '' // 轮作计划名称
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
        cropName: '', // 作物名称（作物ID的字符串形式）
        adaptedCrop: '', // 适配作物
        rotationName: '',
        rotationBenefit: '',
        rotationCycle: '',
        createTime: '',
        remark: '',
        rotationImages: [] as string[], // 计划图片数组
        rotationClassname: '', // 作物名称（存储到数据库）
        rotationAdapt: '' // 适配作物（存储到数据库）
      });

      /** 作物列表数据 */
      const cropList = ref<CategoryItem[]>([]);

      /** 表单验证规则 */
      const formRules = {
        cropName: [
          { required: true, message: '请选择作物名称', trigger: 'change' }
        ],
        rotationName: [
          { required: true, message: '请输入作物轮作计划名称', trigger: 'blur' }
        ],
        rotationBenefit: [
          { required: true, message: '请输入作物轮作好处', trigger: 'blur' }
        ],
        rotationCycle: [
          { required: true, message: '请输入轮作周期', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '请选择创建时间', trigger: 'change' }
        ]
      };
      
      /** 当前编辑的作物轮作计划数据 */
      const currentCategory = ref<CropRotationItem>({
        id: 0,
        rotationId: 0,
        rotationName: '',
        rotationBenefit: '',
        rotationCycle: '',
        rotationImage: null,
        remark: null,
        createTime: '',
        createBy: null,
        updateBy: null,
        updateTime: null,
        rotationClassname: null,
        rotationAdapt: null
      });
      
  
      /**
       * 准备搜索参数
       */
      const getSearchParams = () => {
        const params: { rotationName?: string } = {};
        if (searchForm.value.rotationName.trim()) {
          params.rotationName = searchForm.value.rotationName.trim();
        }
        return params;
      };
  
      /**
       * 获取作物列表数据
       */
      const fetchCropList = async () => {
        try {
          const response = await cropRotationList.getCropList();
          console.log('作物列表API响应:', response);
          if (response && response.records) {
            cropList.value = response.records;
            console.log('作物列表数据:', cropList.value);
          } else {
            console.log('作物列表数据为空');
            cropList.value = [];
          }
        } catch (error) {
          console.error('获取作物列表失败:', error);
          ElMessage.error('获取作物列表失败');
        }
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
          const response = await cropRotationList.listcropRotation(params);
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
        searchForm.value = { rotationName: '' };
        pagination.value.current = 1;
        fetchCategories(1, pagination.value.size);
      };
  
      /**
       * 选择作物后自动填充相关字段
       */
      const handleCropChange = (cropId: string) => {
        const selectedCrop = cropList.value.find(crop => crop.classId === Number(cropId));
        if (selectedCrop) {
          // 自动填充适配作物
          formData.value.adaptedCrop = selectedCrop.classAdapt || '';
          // 自动填充好处（使用remark字段）
          formData.value.rotationBenefit = selectedCrop.remark || '';
          
          // 填充数据库字段
          formData.value.rotationClassname = selectedCrop.className;
          formData.value.rotationAdapt = selectedCrop.classAdapt || '';
          
          // 自动填充图片
          updateRotationImages(selectedCrop);
        }
      };


      /**
       * 更新轮作图片
       */
      const updateRotationImages = (selectedCrop: CategoryItem) => {
        const images: string[] = [];
        
        // 添加选中作物的图片
        if (selectedCrop.classImage) {
          images.push(selectedCrop.classImage);
        }
        
        // 如果适配作物不为空，查找适配作物的图片
        if (selectedCrop.classAdapt) {
          const adaptedCrop = cropList.value.find(crop => 
            crop.className === selectedCrop.classAdapt
          );
          if (adaptedCrop && adaptedCrop.classImage) {
            images.push(adaptedCrop.classImage);
          }
        }
        
        formData.value.rotationImages = images;
      };

      /**
       * 显示新增种类对话框
       */
      const showAddDialog = () => {
        // 设置为新增模式
        isEditMode.value = false;
        
        // 重置表单数据
        formData.value = {
          cropName: '',
          adaptedCrop: '',
          rotationName: '',
          rotationBenefit: '',
          rotationCycle: '',
          createTime: '',
          remark: '',
          rotationImages: [],
          rotationClassname: '',
          rotationAdapt: ''
        };
        
        // 显示对话框
        dialogVisible.value = true;
      };
  
      /**
       * 显示编辑作物轮作计划对话框
       * @param category 要编辑的作物轮作计划数据
       */
      const showEditDialog = (category: CropRotationItem) => {
        // 设置为编辑模式
        isEditMode.value = true;
        
        // 设置当前编辑的种类
        currentCategory.value = { ...category };
        
        // 根据rotationClassname查找对应的作物ID
        let cropId = '';
        if (category.rotationClassname) {
          const selectedCrop = cropList.value.find(crop => crop.className === category.rotationClassname);
          if (selectedCrop) {
            cropId = String(selectedCrop.classId);
          }
        }
        
        // 填充表单数据
        formData.value = {
          cropName: cropId, // 根据rotationClassname查找的作物ID
          adaptedCrop: category.rotationAdapt || '', // 直接使用rotationAdapt字段
          rotationName: category.rotationName,
          rotationBenefit: category.rotationBenefit,
          rotationCycle: category.rotationCycle,
          createTime: category.createTime,
          remark: category.remark || '',
          rotationImages: category.rotationImage ? category.rotationImage.split('|') : [],
          rotationClassname: category.rotationClassname || '', // 直接使用数据库字段
          rotationAdapt: category.rotationAdapt || '' // 直接使用数据库字段
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
      const prepareSubmitData = (): CropRotationItem => {
        return {
          id: 0,
          rotationId: 0,
          rotationName: formData.value.rotationName,
          rotationBenefit: formData.value.rotationBenefit,
          rotationCycle: formData.value.rotationCycle,
          rotationImage: formData.value.rotationImages.length > 0 ? formData.value.rotationImages.join('|') : null,
          remark: formData.value.remark || null,
          createTime: formData.value.createTime,
          createBy: null,
          updateBy: null,
          updateTime: null,
          rotationClassname: formData.value.rotationClassname,
          rotationAdapt: formData.value.rotationAdapt
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
              id: currentCategory.value.id
            };
            await cropRotationList.editcropRotation(updateData);
            ElMessage.success('编辑作物轮作计划成功');
          } else {
            // 新增模式：调用新增API
            await cropRotationList.addcropRotation(submitData);
            ElMessage.success('新增作物轮作计划成功');
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
          const response = await cropRotationList.uploadFile(file);
          
          // 构造访问URL
          const imageUrl = `http://localhost:8080/uploads/${file.name}`;
          
          // 保存图片URL到表单数据
          if (!formData.value.rotationImages.includes(imageUrl)) {
            formData.value.rotationImages.push(imageUrl);
          }
          
          onSuccess(response);
          ElMessage.success('图片上传成功');
          
        } catch (error) {
          console.error('图片上传失败:', error);
          onError(error);
          ElMessage.error('图片上传失败，请重试');
        }
      };
  
  
      /**
       * 获取图片预览URL
       */
      const getImagePreviewUrl = (imageData: string) => {
        return imageData;
      };

      /**
       * 获取图片列表（用于卡片轮播）
       */
      const getImageList = (imageData: string | null) => {
        if (!imageData) return [];
        // 如果包含分隔符，分割为数组
        if (imageData.includes('|')) {
          return imageData.split('|');
        }
        // 如果不包含分隔符，返回单张图片数组
        return [imageData];
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
          // 调用后端API删除作物轮作计划
          await cropRotationList.deletecropRotation(id);
          
          // 删除成功后从列表中移除该作物轮作计划
          categories.value = categories.value.filter((cat: CropRotationItem) => cat.id !== id);
          
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
      fetchCropList();
  
      // 返回组件需要的数据和方法
      return {
        categories,
        pagination,
        searchForm,
        currentCategory,
        dialogVisible,
        isEditMode,
        formRef,
        submitLoading,
        formData,
        formRules,
        cropList,
        fetchCropList,
        fetchCategories,
        handleSearch,
        handleReset,
        handleCropChange,
        updateRotationImages,
        showAddDialog,
        showEditDialog,
        handleClose,
        prepareSubmitData,
        handleSubmit,
        customUpload,
        getImagePreviewUrl,
        getImageList,
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

  /* 图片轮播容器样式 */
  .image-carousel-container {
    width: 100%;
  }

  .carousel-wrapper {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  .carousel-image-container {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
  }

  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }


  /* 无图片时的占位符样式 */
  .no-images-placeholder {
    width: 100%;
    height: 200px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    transition: all 0.3s;
  }

  .no-images-placeholder:hover {
    border-color: #409eff;
    background: #f5f7fa;
  }

  .placeholder-icon {
    margin-bottom: 12px;
  }

  .placeholder-text {
    font-size: 16px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .placeholder-tip {
    font-size: 12px;
    color: #909399;
    text-align: center;
    line-height: 1.4;
  }

  /* 卡片轮播样式 */
  .card-carousel-wrapper {
    position: relative;
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
  }

  .card-carousel-image-container {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-carousel-image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
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