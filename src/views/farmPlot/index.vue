<template>
    <!-- 地块管理页面主容器 -->
    <div class="card">
      <!-- 页面标题 -->
      <h2>地块管理</h2>
      
      <!-- 搜索表单区域 -->
      <div class="search-form">
        <!-- 种类名称搜索框 -->
        <div class="search-item">
          <label class="search-label">地块名称</label>
          <el-input
            v-model="searchForm.farmplotName"
            placeholder="请输入地块名称"
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
        <!-- 新增地块按钮 -->
      <el-button type="primary" @click="showAddDialog">新增地块</el-button>
      </div>
      
  
      <!-- 地块列表卡片展示 -->
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.farmplotId" 
          class="category-card"
        >
          <!-- 地块名称，显示在图片上方 -->
          <div class="category-name-header">
            <div class="detail-item">
              <el-icon class="detail-icon">
                <MapLocation />
              </el-icon>
              <span class="detail-label">地块名称:</span>
              <span class="detail-value category-name-value">{{ category.farmplotName }}</span>
            </div>
          </div>
          
          <!-- 地块图片显示区域 -->
          <div class="card-image">
            <!-- 有图片时显示图片 -->
            <el-image 
              v-if="category.farmplotImage" 
              :src="category.farmplotImage" 
              class="category-image"
              fit="cover"
            />
            <!-- 没有图片时显示默认占位符 -->
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

              <!-- 轮作计划 -->
              <div v-if="getRotationPlanName(category.rotationId)" class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">轮作计划:</span>
                <span class="detail-value">{{ getRotationPlanName(category.rotationId) }}</span>
              </div>

              <!-- 适合种植作物 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">适合种植作物:</span>
                <span class="detail-value">{{ category.farmplotZuowu }}</span>
              </div>

              <!-- 轮作物 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">轮作物:</span>
                <span class="detail-value">{{ category.farmplotLunzuowu }}</span>
              </div>

              <!-- 作物种植使用量 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Crop />
                </el-icon>
                <span class="detail-label">作物种植使用量:</span>
                <span class="detail-value">{{ category.farmplotSyliang }}袋</span>
              </div>

              <!-- 地块面积 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">地块面积:</span>
                <span class="detail-value">{{ category.farmplotArea }} (亩)</span>
              </div>
              <!-- 地块价格 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">地块价格:</span>
                <span class="detail-value">{{ category.farmplotJiage }} (元/亩)</span>
              </div>


              <!-- 农场位置 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <MapLocation />
                </el-icon>
                <span class="detail-label">农场位置:</span>
                <span class="detail-value">{{ category.farmplotPosition }}</span>
              </div>
  
              <!-- 负责人 -->
              <div class="detail-item">
                <el-icon class="detail-icon">
                  <Grid />
                </el-icon>
                <span class="detail-label">负责人:</span>
                <span class="detail-value">{{ category.farmplotFzr }}</span>
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
            <el-button type="danger" size="small" :icon="Delete" @click="deleteCategory(category.farmplotId)">
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
  
      <!-- 新增/编辑地块对话框 -->
      <el-dialog 
        :title="isEditMode ? '编辑地块' : '新增地块'" 
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
          <!-- 地块名称 -->
          <el-form-item label="地块名称" prop="farmplotName">
            <el-input 
              v-model="formData.farmplotName" 
              placeholder="请输入地块名称"
              clearable
            />
          </el-form-item>

          <!-- 轮作计划选择 -->
          <el-form-item label="轮作计划" prop="rotationId">
            <el-select 
              v-model="formData.rotationId" 
              placeholder="请选择轮作计划"
              clearable
              style="width: 100%"
              @change="handleRotationChange"
            >
              <!-- 遍历轮作计划列表，显示计划名称，值为classId -->
              <el-option
                v-for="plan in rotationPlans"
                :key="plan.classId"
                :label="plan.rotationName"
                :value="plan.classId"
              />
            </el-select>
          </el-form-item>

          <!-- 种植作物 -->
          <el-form-item label="适合种植作物" prop="farmplotZuowu">
            <el-input 
              v-model="formData.farmplotZuowu" 
              placeholder="根据选择的轮作计划自动填充"
              readonly
              style="width: 100%"
            />
          </el-form-item>

          <!-- 作物种植使用量 -->
          <el-form-item label="作物种植使用量" prop="farmplotSyliang">
            <el-input 
              v-model="formData.farmplotSyliang" 
              placeholder="请输入作物种植使用量(袋)"
              clearable
            />
          </el-form-item>

          <!-- 轮作作物 - 隐藏字段，不显示在界面上 -->
          <el-form-item v-show="false" prop="farmplotLunzuowu">
            <el-input v-model="formData.farmplotLunzuowu" />
          </el-form-item>


          <!-- 农场位置 -->
         <!-- 聚焦或点击时打开地图选择弹窗
              规则：
              1. 第一次创建农场（没有任何地块时）：需要用户选择农场位置 → 显示输入框
              2. 农场已有地块时：新增地块默认沿用已有农场位置 → 隐藏输入框，避免重复选择
              3. 编辑地块时：总是显示农场位置，方便修改 -->
         <el-form-item
           v-if="isEditMode || categories.length === 0"
           label="农场位置"
           prop="farmplotPosition"
         >
            <el-input 
              v-model="formData.farmplotPosition" 
              placeholder="请输入农场位置或点击选择"
              clearable
              readonly
              
              @focus="openLocationDialog"
              @click="openLocationDialog"
            >
              <template #suffix>
                <el-icon><MapLocation /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <!-- 农场总面积 -->
          <el-form-item v-if="showFarmTotalArea" label="农场总面积" prop="farmplotCount">
            <el-input 
              v-model.number="formData.farmplotCount" 
              type="number"
              placeholder="农场总面积"
              :readonly="!showFarmTotalArea"
              :disabled="!showFarmTotalArea"
              clearable
            />
          </el-form-item>
          
          <!-- 地块面积 -->
          <el-form-item label="地块面积(亩)" prop="farmplotArea">
            <el-input 
              v-model.number="formData.farmplotArea" 
              type="number"
              placeholder="请输入地块面积(亩)"
              clearable
            />
          </el-form-item>
          
          <!-- 地块剩余面积 -->
          <el-form-item label="地块剩余面积(亩)" prop="farmplotShengarea">
            <el-input 
              v-model="formData.farmplotShengarea" 
              placeholder=""
              readonly
        
            />
          </el-form-item>
          <!-- 地块价格 -->
          <el-form-item label="地块价格" prop="farmplotJiage">
            <el-input 
              v-model="formData.farmplotJiage" 
              placeholder="请输入地块价格(元/亩)"
              clearable
            />
          </el-form-item>
          
   
          
          <!-- 负责人 -->
          <el-form-item label="负责人" prop="farmplotFzr">
            <el-select 
              v-model="formData.farmplotFzr" 
              placeholder="请选择负责人"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.userName"
                :value="user.userName"
              />
            </el-select>
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

      <!-- 地块位置选择弹窗，复用位置管理组件 -->
      <el-dialog
        title="选择地块位置"
        v-model="locationDialogVisible"
        width="80%"
        top="5vh"
        destroy-on-close
      >
        <LocationMap @selectionSaved="handleLocationSelection" />
      </el-dialog>
  
    </div>
  </template>
  
  <script lang="ts">
  import { ref, watch, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Grid, Calendar, Document, Edit, Delete, Search, Refresh, Plus, MapLocation, Picture, Crop } from '@element-plus/icons-vue';
  import { farmPlotList, type FarmPlotItem, type PaginationResult, type FarmPlotDTOItem } from '@/api/farmPlotApi';
  import { sysUserList, type SysUserItem } from '@/api/sysUserApi';
  // 复用位置管理页面作为弹窗地图
  import LocationMap from '@/views/location/index.vue';
  // 使用API中定义的接口类型
  type Category = FarmPlotItem;
  
  /**
   * 种类管理组件
   * 提供种类的增删改查功能
   */
  export default {
    name: 'CategoryManager',
    components: {
      LocationMap
    },
    setup() {
      // 响应式数据定义
      
      /** 种类列表数据 */
      const categories = ref<Category[]>([]);
      
      /** 轮作计划列表数据 - 用于下拉选择 */
      const rotationPlans = ref<FarmPlotDTOItem[]>([]);
      
      /** 用户列表数据 - 用于负责人下拉选择 */
      const userList = ref<SysUserItem[]>([]);
      
      /** 分页信息 */
      const pagination = ref({
        current: 1,    // 当前页
        size: 8,       // 每页条数
        total: 0,      // 总条数
        pages: 0       // 总页数
      });
      
      /** 搜索表单数据 */
      const searchForm = ref({
        farmplotName: '', // 地块名称
      });
      
      
      /** 对话框显示状态 */
      const dialogVisible = ref(false);
      // 是否显示位置选择弹窗
      const locationDialogVisible = ref(false);
      
      /** 是否为编辑模式 */
      const isEditMode = ref(false);
      
      /** 表单引用 */
      const formRef = ref();
      
      /** 提交加载状态 */
      const submitLoading = ref(false);
      
      /** 是否显示农场总面积字段 */
      const showFarmTotalArea = computed(() => {
        return categories.value.length === 0;
      });


      /**
       * 根据轮作计划ID获取轮作计划名称
       */
      const getRotationPlanName = (rotationId: number | string | null) => {
        if (!rotationId) return null;
        const plan = rotationPlans.value.find(p => p.classId === Number(rotationId));
        return plan ? plan.rotationName : null;
      };

      /**
       * 重置表单字段（轮作相关）
       */
      const resetRotationFields = () => {
        formData.value.farmplotZuowu = '';
        formData.value.farmplotLunzuowu = '';
        formData.value.classId1 = null;
        formData.value.classId2 = null;
      };

      /**
       * 处理轮作计划变化，自动填充适合种植作物和轮作作物
       */
      const handleRotationChange = (rotationId: number | null) => {
        const selectedPlan = rotationId 
          ? rotationPlans.value.find(plan => plan.classId === rotationId) 
          : null;
        
        if (selectedPlan) {
          formData.value.farmplotZuowu = selectedPlan.className;
          formData.value.farmplotLunzuowu = selectedPlan.classAdapt;
          formData.value.classId1 = selectedPlan.rotationId1;
          formData.value.classId2 = selectedPlan.rotationId2;
        } else {
          resetRotationFields();
        }
      };
      
      /** 表单数据 */
      const formData = ref({
        farmplotName: '',
        farmplotCount: null as number | null,        
        farmplotArea: null as number | null,         
        farmplotShengarea: null as number | null,    
        farmplotPosition: '',
        farmplotFzr: '',
        createTime: '',
        remark: '',
        rotationId: null as number | null,  // 轮作计划ID - 关联到轮作计划表
        farmplotImage: null as string | null, // 地块图片，从后端返回的数据中获取
        farmplotZuowu: '', // 种植作物
        farmplotLunzuowu: '', // 轮作作物
        classId1: null as number | null, // 轮作计划中的第一个作物ID
        classId2: null as number | null, // 轮作计划中的第二个作物ID
        farmplotJiage: '', // 地块价格
        farmplotZongjia: '', // 地块总价
        farmplotSyliang: '', // 地块剩余面积
        farmplotSyzongjia: '', // 作物种植使用总价
      });
      
      /** 表单验证规则 */
      const formRules = {
        farmplotName: [
          { required: true, message: '请输入地块名称', trigger: 'blur' }
        ],
        farmplotCount: [
          { required: true, message: '请输入农场总面积', trigger: 'blur' }
         
        ],
        farmplotArea: [
          { required: true, message: '请输入地块面积(亩)', trigger: 'blur' },
          {
            // 自定义验证器：检查地块面积是否大于农场总面积
            // value 为当前输入的地块面积，callback 为验证回调函数
            validator: (rule: any, value: any, callback: any) => {
              // 如果地块面积为空，跳过验证
              if (!value && value !== 0) {
                callback();
                return;
              }

              // 将输入值转换为数字，避免字符串比较
              const plotArea = Number(value);
              const totalArea = Number(formData.value.farmplotCount);

              // 如果转换失败或农场总面积为空，则跳过验证
              if (isNaN(plotArea) || !totalArea) {
                callback();
                return;
              }
              
              // 比较数值：如果农场总面积小于地块面积，显示错误
              if (totalArea < plotArea) {
                callback(new Error('您输入的地块面积大于农场总面积'));
              } else {
                // 验证通过
                callback();
              }
            },
            trigger: 'blur' // 在字段失去焦点时触发验证
          },
          {
            // 自定义验证器：检查地块面积是否大于“当前可用剩余面积”
            // 注意：这里的“可用剩余面积”是数据库中算出来的剩余面积（第一块地的 farmplotShengarea），
            // 而不是输入新地块面积后计算出来的剩余值，否则会出现「剩余 440 亩但输入 400 也报错」的问题。
            validator: (rule: any, value: any, callback: any) => {
              // 如果地块面积为空，跳过验证
              if (!value && value !== 0) {
                callback();
                return;
              }

              const newPlotArea = Number(value);
              if (isNaN(newPlotArea)) {
                callback(new Error('请输入有效的地块面积数字'));
                return;
              }

              // 计算用于比较的“可用剩余面积”
              let availableRemaining: number | null = null;

              if (!isEditMode.value && categories.value.length > 0) {
                // 新增模式且已有地块：使用数据库中第一块地的剩余面积作为基数
                availableRemaining = Number(categories.value[0].farmplotShengarea ?? 0);
              } else {
                // 编辑模式或没有现有地块：使用表单中的剩余面积作为基数
                availableRemaining = formData.value.farmplotShengarea != null
                  ? Number(formData.value.farmplotShengarea)
                  : null;
              }

              // 如果拿不到合法的“可用剩余面积”，则不做校验
              if (availableRemaining == null || isNaN(availableRemaining)) {
                callback();
                return;
              }

              // 比较：如果新地块面积大于当前可用剩余面积，则提示错误
              if (newPlotArea > availableRemaining) {
                callback(new Error('您输入的地块面积大于剩余面积'));
              } else {
                callback();
              }
            },
            trigger: 'blur' // 在字段失去焦点时触发验证
          }
        ],
        farmplotPosition: [
          { required: true, message: '请输入地块位置', trigger: 'blur' }
        ],
        farmplotFzr: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '请选择创建时间', trigger: 'change' }
        ]
      };
      
      /** 当前编辑的地块数据 */
      const currentCategory = ref<Category>({
        farmplotId: 0,
        rotationId: 0,
        classId1: 0,
        classId2: 0,
        farmplotName: '',
        farmplotJiage: '',
        farmplotZongjia: '',
        farmplotSyliang: '',
        farmplotSyzongjia: '',
        farmplotZuowu: '',
        farmplotLunzuowu: '',
        farmplotCount: 0,        
        farmplotArea: 0,         
        farmplotShengarea: 0,    
        farmplotPosition: '',
        farmplotFzr: '',
        remark: null,
        createTime: '',
        createBy: null,
        updateBy: null,
        updateTime: null,
        farmplotImage: null // 地块图片
      });
      
  
      /**
       * 计算剩余面积
       * 新增时：如果有现有地块，用数据库剩余面积减去新地块面积
       * 新增时：如果没有现有地块，用农场总面积减去地块面积
       * 编辑时：用农场总面积减去地块面积
       */
      const shengyuArea = () => {
        const totalArea = Number(formData.value.farmplotCount);  // 农场总面积
        const plotArea = Number(formData.value.farmplotArea);    // 当前地块面积
        
        // 仅在两个值都为有效数字时才计算剩余面积
        if (totalArea && plotArea && !isNaN(totalArea) && !isNaN(plotArea)) {
          let baseArea: number;
          
          // 如果是新增模式且有现有地块，使用数据库中的剩余面积作为基数
          if (!isEditMode.value && categories.value.length > 0) {
            baseArea = Number(categories.value[0].farmplotShengarea || 0);
          } else {
            // 如果是编辑模式或没有现有地块，使用农场总面积作为基数
            baseArea = totalArea;
          }
          
          // 计算最新的剩余面积，并保留两位小数，避免 40.48000000000002 这种浮点误差
          const remaining = baseArea - plotArea;
          const fixedRemaining = Number(Math.max(0, remaining).toFixed(2));
          formData.value.farmplotShengarea = fixedRemaining;
        } else {
          formData.value.farmplotShengarea = null;
        }
      };

      /**
       * 准备搜索参数
       */
      const getSearchParams = () => {
        const params: { farmplotName?: string } = {};
        if (searchForm.value.farmplotName.trim()) {
          params.farmplotName = searchForm.value.farmplotName.trim();
        }
        return params;
      };
  
      /**
       * 获取轮作计划列表数据
       * 用于地块表单中的轮作计划下拉选择
       */
      const fetchRotationPlans = async () => {
        try {
          // 获取所有轮作计划，用于下拉选择
          const response = await farmPlotList.listDTO();
          
          // 保存轮作计划列表到响应式数据
          rotationPlans.value = response?.records || [];
          
        } catch (error) {
          console.error('获取轮作计划列表失败:', error);
          ElMessage.error('获取轮作计划列表失败');
        }
      };

      /**
       * 获取用户列表数据
       * 用于负责人下拉选择
       */
      const fetchUserList = async () => {
        try {
          const response = await sysUserList.listSysUser({});
          userList.value = response?.records || [];
        } catch (error) {
          console.error('获取用户列表失败:', error);
          ElMessage.error('获取用户列表失败');
          userList.value = [];
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
          const response = await farmPlotList.listfarmPlot(params);
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
        searchForm.value = { farmplotName: '' };
        pagination.value.current = 1;
        fetchCategories(1, pagination.value.size);
      };
  
      /**
       * 初始化剩余面积
       */
      const initRemainingArea = () => {
        const firstCategory = categories.value[0];
        if (firstCategory) {
          formData.value.farmplotCount = firstCategory.farmplotCount;
          formData.value.farmplotShengarea = firstCategory.farmplotShengarea;
        } else {
          formData.value.farmplotShengarea = formData.value.farmplotCount;
        }
      };

      /**
       * 显示新增种类对话框
       */
      const showAddDialog = () => {
        // 新增模式
        isEditMode.value = false;

        // 如果已经有地块，默认沿用第一块地的“农场位置”
        // 这样用户在同一个农场下新增地块时就不用每次都重新选择位置
        const defaultFarmPosition = categories.value.length > 0
          ? categories.value[0].farmplotPosition || ''
          : '';
        
        // 重置表单数据（注意农场位置使用 defaultFarmPosition）
        formData.value = {
          farmplotName: '',
          farmplotCount: null,        
          farmplotArea: null,         
          farmplotShengarea: null,    
          farmplotJiage: '',
          farmplotZongjia: '',
          farmplotSyliang: '',
          farmplotSyzongjia: '',
          farmplotPosition: defaultFarmPosition,
          farmplotFzr: '',
          createTime: '',
          remark: '',
          rotationId: null,
          farmplotImage: null,
          farmplotZuowu: '',
          farmplotLunzuowu: '',
          classId1: null,
          classId2: null
        };
        
        initRemainingArea();
        dialogVisible.value = true;
        
        // 确保第一次打开时数据正确显示
        setTimeout(initRemainingArea, 0);
      };
  
      // 打开位置选择弹窗
      const openLocationDialog = () => {
        locationDialogVisible.value = true;
      };

      /**
       * 地图组件回调：拿到圈选面积后回填农场总面积
       * area 是圈选的平方米 areaMu 是平方米转换的亩数 polygonPath 圈选区域的多边形路径
       * 将areaMu赋值给农场总面积，将polygonPath赋值给地块位置
       */
      const handleLocationSelection = (payload: { area: number; areaMu: number; polygonPath: string }) => {
        if (!payload?.areaMu) return;
        //农场总面积 保留两位小数
        const areaMu = Number(payload.areaMu.toFixed(2));
        //农场总面积
        formData.value.farmplotCount = areaMu;
        //地块位置
        formData.value.farmplotPosition = '已通过位置管理圈选';
        locationDialogVisible.value = false;
        ElMessage.success(`已填入圈选面积 ${areaMu} 亩`);
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
          farmplotName: category.farmplotName,
          farmplotCount: category.farmplotCount || null,
          farmplotArea: category.farmplotArea || null,
          farmplotShengarea: category.farmplotShengarea || null,
          farmplotJiage: category.farmplotJiage || '',
          farmplotZongjia: category.farmplotZongjia || '',
          farmplotSyliang: category.farmplotSyliang || '',
          farmplotSyzongjia: category.farmplotSyzongjia || '',
          farmplotPosition: category.farmplotPosition,
          farmplotFzr: category.farmplotFzr,
          createTime: category.createTime,
          remark: category.remark || '',
          rotationId: category.rotationId || null,  // 编辑时从地块数据中获取轮作计划ID
          farmplotImage: category.farmplotImage || null, // 编辑时从地块数据中获取图片
          farmplotZuowu: (category as any).farmplotZuowu || '' ,// 编辑时从地块数据中获取种植作物
          farmplotLunzuowu: (category as any).farmplotLunzuowu || '', // 编辑时从地块数据中获取轮作作物
          classId1: category.classId1 || null, // 编辑时从地块数据中获取第一个作物ID
          classId2: category.classId2 || null // 编辑时从地块数据中获取第二个作物ID
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
      const prepareSubmitData = (): FarmPlotItem => {
        const data: any = {
          ...formData.value,
          farmplotCount: formData.value.farmplotCount || 0,
          farmplotArea: formData.value.farmplotArea || 0,
          farmplotShengarea: formData.value.farmplotShengarea || 0,
          remark: formData.value.remark || null,
          farmplotImage: formData.value.farmplotImage || null,
          classId1: formData.value.classId1 || 0,
          classId2: formData.value.classId2 || 0,
          farmplotJiage: formData.value.farmplotJiage || '',
          farmplotSyliang: formData.value.farmplotSyliang || '',
          farmplotSyzongjia: formData.value.farmplotSyzongjia || '',
          createBy: null,
          updateBy: null,
          updateTime: null
        };
        
        if (isEditMode.value) {
          data.farmplotId = currentCategory.value.farmplotId;
        }
        
        return data;
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
              farmplotId: currentCategory.value.farmplotId
            };
            await farmPlotList.editfarmPlot(updateData);
            ElMessage.success('编辑种类成功');
          } else {
            // 新增模式：调用新增API
            await farmPlotList.addfarmPlot(submitData);
            ElMessage.success('新增种类成功');
          }
          
          // 重新计算剩余面积
          await cxjsArea();
          
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
       * 重新计算剩余面积
       * 获取所有地块数据，计算剩余面积并更新到数据库
       */
      const cxjsArea = async () => {
        try {
          // 获取所有地块数据
          const response = await farmPlotList.listfarmPlot({ current: 1, size: 1000 });
          
          if (response?.records?.length > 0) {
            // 获取农场总面积
            const totalArea = response.records[0].farmplotCount || 0;
            // 计算所有地块的总使用面积
            const usedArea = response.records.reduce((sum, plot) => sum + (plot.farmplotArea || 0), 0);
            // 计算剩余面积 = 总面积 - 已使用面积
            const remainingArea = totalArea - usedArea;
            
            // 并行更新所有地块的剩余面积
            await Promise.all(response.records.map(plot => 
              farmPlotList.editfarmPlot({ ...plot, farmplotShengarea: remainingArea })
            ));
          }
        } catch (error) {
          console.error('重新计算剩余面积失败:', error);
        }
      };

      /**
       * 删除地块
       * @param farmplotId 要删除的地块ID
       */
      const deleteCategory = async (farmplotId: number) => {
        try {
          // 调用后端API删除地块
          await farmPlotList.deletefarmPlot(farmplotId);
          
          // 删除成功后从列表中移除该地块
          categories.value = categories.value.filter(cat => cat.farmplotId !== farmplotId);
          
          // 重新计算剩余面积
          await cxjsArea();
          
          // 显示删除成功提示
          ElMessage.success('删除成功');
          
          // 如果当前页没有数据了且不是第一页，则跳转到上一页
          if (categories.value.length === 0 && pagination.value.current > 1) {
            pagination.value.current -= 1;
          }
          // 刷新当前页数据
          await fetchCategories(pagination.value.current, pagination.value.size);
        } catch (error) {
          console.error('删除地块失败:', error);
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
  
      // 监听地块面积变化，重新验证农场总面积并计算剩余面积
      watch(() => formData.value.farmplotArea, () => {
        if (formRef.value) {
          formRef.value.validateField('farmplotCount');
        }
        // 自动计算剩余面积
        shengyuArea();
      });

      // 监听农场总面积变化，只计算剩余面积，不触发验证
      watch(() => formData.value.farmplotCount, () => {
        // 只计算剩余面积，不触发验证
        shengyuArea();
      });


      // 组件初始化时加载数据
      fetchCategories();        // 获取地块列表
      fetchRotationPlans();     // 获取轮作计划列表
      fetchUserList();          // 获取用户列表
  
      // 返回组件需要的数据和方法
      return {
        categories,
        rotationPlans,
        userList,
        pagination,
        searchForm,
        currentCategory,
        dialogVisible,
        isEditMode,
        formRef,
        submitLoading,
        formData,
        formRules,
        showFarmTotalArea,
        getRotationPlanName,
        handleRotationChange,
        fetchCategories,
        handleSearch,
        handleReset,
        showAddDialog,
        showEditDialog,
        handleClose,
        prepareSubmitData,
        handleSubmit,
        deleteCategory,
        handlePageChange,
        handleSizeChange,
        shengyuArea,
        locationDialogVisible,
        openLocationDialog,
        handleLocationSelection,
        LocationMap,
        // 图标组件
        Search,
        Refresh,
        Edit,
        Delete,
        Plus,
        MapLocation,
        Grid,
        Calendar,
        Document,
        Picture,
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

  /* 图片显示容器样式 */
  .image-display-container {
    width: 100%;
  }

  .form-image {
    width: 100%;
    height: 200px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
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



  .placeholder-tip {
    font-size: 12px;
    color: #909399;
    text-align: center;
    line-height: 1.4;
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
  
  /* 地块名称标题区域（图片上方） */
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
  
  /* 卡片操作按钮区域 */
  .card-actions {
    padding: 0 20px 20px 20px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: auto; /* 将按钮区域固定在卡片底部 */
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