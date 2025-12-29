<template>
  <!-- 收获管理页面 -->
    <div class="app-container-sm">
      <!-- 查询表单 -->
      <el-card class="card-margin-bottom">
        <el-form
          :inline="true"
          label-width="68px"
          class="form-minus-bottom"
        >
        <el-form-item prop="farmplotName">
            <template #label>
            <b class="form-label-strong">地块名称</b>
            </template>
            <el-input
            v-model="queryParams.farmplotName"
            placeholder="请输入地块名称"
              clearable
              size="small"
              style="width: 200px"
              class="form-input-large"
            @keyup.enter="handleQuery"
            />
          </el-form-item>
        <el-form-item prop="className">
            <template #label>
            <b class="form-label-strong">种植作物</b>
            </template>
          <el-input
            v-model="queryParams.className"
            placeholder="请输入种植作物"
              clearable
            size="small"
              style="width: 200px"
              class="form-input-large"
            @keyup.enter="handleQuery"
          />
          </el-form-item>
          <el-form-item>
            <el-button
              size="small"
              type="primary"
              class="form-btn-large"
              :icon="Search"
              @click="handleQuery"
              >搜索</el-button
            >
          <el-button 
              size="small" 
              class="form-btn-large" 
              :icon="Refresh"
              @click="resetQuery"
              >重置</el-button
            >
          </el-form-item>
        </el-form>
      <!-- 收获记录卡片列表 -->
        <div class="batch-card-grid" v-if="harvestList.length > 0">
          <el-row :gutter="24">
          <el-col :span="8" v-for="item in harvestList" :key="item.farmplotId">
              <el-card class="batch-card" shadow="hover">
                <div class="batch-card-header">
                  <div class="header-content">
                  <div class="section-name">地块名称</div>
                  <div class="batch-name">{{ item.farmplotName || '--' }}</div>
                  </div>
                <el-tag :type="item.isHarvested ? 'success' : 'danger'">
                  {{ item.isHarvested ? '已收获' : '可收获' }}
                </el-tag>
                </div>
              <div class="batch-image" v-if="item.classImg && item.classImg.length > 0">
                  <el-carousel
                    :interval="2000"
                    :arrow="item.classImg.length > 1 ? 'always' : 'never'"
                    height="180px"
                    indicator-position="outside"
                    style="width: 100%"
                  >
                    <el-carousel-item
                      v-for="(img, idx) in item.classImg"
                      :key="idx"
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 180px;
                        cursor: pointer;
                      "
                    >
                    <img :src="img" alt="作物图片" style="max-width: 100%; max-height: 100%" />
                    </el-carousel-item>
                  </el-carousel>
                </div>
                <div class="batch-card-content">
                  <div class="batch-info">
                    <div class="info-item">
                      <el-icon><Menu /></el-icon>
                    <span class="label">种植作物：</span>
                    <span>{{ item.className || '--' }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Menu /></el-icon>
                    <span class="label">负责人：</span>
                    <span>{{ item.farmplotFzr || '--' }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Menu /></el-icon>
                    <span class="label">种植面积：</span>
                    <span>{{ item.farmplotArea ? item.farmplotArea + '亩' : '--' }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Menu /></el-icon>
                    <span class="label">收获时间：</span>
                    <span>{{ item.shouhuoTime || '--' }}</span>
                    </div>

                  </div>
                  <div class="batch-card-actions">
                    <el-button v-if="!item.isHarvested" size="small" type="primary" :icon="Plus" @click="handleAdd(item)">新增</el-button>
                    <el-button v-if="item.isHarvested" size="small" type="success" :icon="Edit" @click="handleEdit(item)">编辑</el-button>
                    <el-button
                      v-if="item.isHarvested"
                      size="small"
                      type="danger"
                      :icon="Delete"
                      @click="handleDelete(item)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <el-empty v-else description="暂无可收获的地块" :image-size="200" />
      <div class="custom-pagination" v-if="total > 8">
        <span style="margin-right: 16px; font-size: 14px"> 共 {{ total }} 条 </span>
          <el-pagination
            background
            layout="sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="pageNum"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :page-sizes="[9, 18, 27, 36]"
          />
        </div>
      </el-card>
  
      <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" width="240px">
      <img style="width: 200px; height: 200px" src="" alt="预览图片" />
      </el-dialog>
  
      <!-- 种植计划对话框 -->
    <el-dialog title="种植计划" width="1300px">
        <div style="height: 500px; width: 100%; overflow: auto">
        <div>任务内容区域</div>
        </div>
      </el-dialog>

      <!-- 新增/编辑收获记录对话框 -->
      <el-dialog 
        :title="dialogTitle" 
        v-model="dialogVisible" 
        width="600px"
        @close="handleDialogClose"
      >
        <el-form
          ref="harvestFormRef"
          :model="harvestForm"
          :rules="harvestFormRules"
          label-width="100px"
        >
          <el-form-item label="种植作物" prop="className">
            <el-input
              v-model="harvestForm.className"
              placeholder="请输入种植作物"
              :readonly="isEditMode"
              :class="{ 'readonly-input': isEditMode }"
              clearable
            />
          </el-form-item>
          <el-form-item label="作物重量" prop="classWeight">
            <el-input
              v-model="harvestForm.classWeight"
              placeholder="请输入作物重量(kg)"
              clearable
            />
          </el-form-item>
          <el-form-item label="收获日期" prop="shouhuoTime">
            <el-date-picker
              v-model="harvestForm.shouhuoTime"
              type="datetime"
              placeholder="请选择收获日期时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="harvestForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注"
              clearable
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import type { FormInstance, FormRules } from 'element-plus'
    import {
      Menu,
      Plus,
      Edit,
      Search,
      Refresh,
      Delete
    } from '@element-plus/icons-vue'
  import { farmTaskList, type FarmTaskDTOItem } from '@/api/farmTaskApi'
  import { farmPlotList, type FarmPlotItem } from '@/api/farmPlotApi'
  import { HarvestItemApi, type HarvestItem } from '@/api/harvestApi'
  import { classManagementList, type CategoryItem } from '@/api/classManagementApi'

  // 查询参数
    const queryParams = reactive({
    farmplotName: '',
    className: ''
  })

  // 可收获地块列表
  interface ReadyHarvestItem {
    farmId: number
    farmplotId: number
    farmplotName: string
    className: string
    farmplotFzr: string // 负责人
    farmplotArea: number | null // 种植面积
    shouhuoTime?: string // 收获时间
    classImg?: string[] // 改为数组，支持多张图片轮播
    taskCount: number
    completedTaskCount: number
    isHarvested?: boolean // 是否已收获
    harvestId?: number // 收获记录ID （后端返回的id 暂存在harvestId方便操作）
  }

  const harvestList = ref<ReadyHarvestItem[]>([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(9)

  /**
   * 获取可收获地块列表
   * 流程：
   * 1. 获取所有地块列表
   * 2. 获取种类管理列表（用于匹配作物图片）
   * 3. 遍历每个地块，调用 RenWuDTO 获取该地块下的所有任务
   * 4. 检查每个地块下的所有任务状态是否都是 '1'（已完成）
   * 5. 如果所有任务都完成，则将该地块添加到可收获列表
   * 6. 应用筛选条件（地块ID、作物名称）
   * 7. 进行分页处理
   */
  async function getList() {
    try {
      // 1. 获取所有地块列表
      const plotRes = await farmPlotList.listfarmPlot({ current: 1, size: 1000 })
      
      // 如果没有地块数据，清空列表并返回
      if (!plotRes?.records) {
        harvestList.value = []
        total.value = 0
        return
      }

      // 2. 获取种类管理列表，用于匹配作物图片
      let categoryList: CategoryItem[] = []
      try {
        const categoryRes = await classManagementList.listclassManagement({ current: 1, size: 1000 })
        categoryList = categoryRes?.records || []
      } catch (error) {
        console.error('获取种类管理列表失败:', error)
      }

      // 3. 初始化可收获地块列表
      const readyHarvestPlots: ReadyHarvestItem[] = []

      // 4. 遍历每个地块，检查任务完成情况
      for (const plot of plotRes.records) {
        try {
          // 4.1 获取该地块下的所有任务
          const taskRes = await farmTaskList.RenWuDTO(plot.farmplotId)
          const res = taskRes as any
          
          // 4.2 解析任务列表（兼容不同的返回格式：records、data 或直接数组）
          const tasks: FarmTaskDTOItem[] = res?.records || res?.data || (Array.isArray(taskRes) ? taskRes : [])
          
          // 4.3 检查该地块下的所有任务是否都已完成（状态都是 '1'）
          if (tasks.length > 0 && tasks.every(task => String(task.status) === '1')) {
            // 获取地块ID（优先从任务数据中获取）
            const farmId = tasks[0]?.farmId || plot.farmplotId
            
            // 处理图片：根据 farmplotZuowu 匹配种类管理中的 classImage
            let classImg: string[] = []
            const farmplotZuowu = plot.farmplotZuowu || ''
            
            // 在种类管理列表中查找匹配的作物
            const matchedCategory = categoryList.find(category => category.className === farmplotZuowu)
            
            if (matchedCategory && matchedCategory.classImage) {
              // 如果找到匹配的种类且有关联图片，使用该图片
              classImg = [matchedCategory.classImage]
            }
            
            // 4.4 检查该地块是否已有收获记录
            let isHarvested = false
            let harvestId: number | undefined
            let shouhuoTime: string | undefined
            try {
              const harvestRes = await HarvestItemApi.getHarvestItemList({
                farmId: farmId
              })
              if (harvestRes?.records && harvestRes.records.length > 0) {
                isHarvested = true
                harvestId = harvestRes.records[0].id
                shouhuoTime = harvestRes.records[0].shouhuoTime
              }
            } catch (error) {
              // 如果查询失败，默认为未收获
              console.error(`查询地块 ${farmId} 的收获记录失败:`, error)
            }
            
            // 4.5 将可收获地块添加到列表
            readyHarvestPlots.push({
              farmId,
              farmplotId: plot.farmplotId,
              farmplotName: plot.farmplotName || `地块${plot.farmplotId}`,
              className: plot.farmplotZuowu || '', // 直接使用 farmplotZuowu
              farmplotFzr: plot.farmplotFzr || '', // 负责人
              farmplotArea: plot.farmplotArea, // 种植面积
              shouhuoTime: shouhuoTime, // 收获时间
              classImg: classImg.length > 0 ? classImg : undefined, // 只有有图片时才赋值
              taskCount: tasks.length,
              completedTaskCount: tasks.length, // 所有任务都已完成，所以等于任务总数
              isHarvested, // 是否已收获
              harvestId
            })
          }
        } catch (error) {
          // 如果获取某个地块的任务失败，记录错误但继续处理下一个地块
          console.error(`获取地块 ${plot.farmplotId} 的任务失败:`, error)
        }
      }
      
      // 4. 应用筛选条件
      let filteredPlots = readyHarvestPlots
      
      // 4.1 按地块名称筛选（模糊匹配）
      if (queryParams.farmplotName) {
        filteredPlots = filteredPlots.filter(p => p.farmplotName?.includes(queryParams.farmplotName))
      }
      
      // 4.2 按作物名称筛选（模糊匹配）
      if (queryParams.className) {
        filteredPlots = filteredPlots.filter(p => p.className?.includes(queryParams.className))
      }

      // 5. 分页处理
      total.value = filteredPlots.length // 设置总记录数
      const start = (pageNum.value - 1) * pageSize.value // 计算起始索引
      harvestList.value = filteredPlots.slice(start, start + pageSize.value) // 截取当前页数据
    } catch (error) {
      // 错误处理：显示错误提示并清空列表
      console.error('获取数据失败:', error)
      ElMessage.error('获取数据失败')
      harvestList.value = []
      total.value = 0
    }
  }
  
  // 搜索：重置到第一页并重新获取列表
  function handleQuery() {
    pageNum.value = 1
    getList()
  }

  // 重置：清空查询条件并重新搜索
  function resetQuery() {
    queryParams.farmplotName = ''
    queryParams.className = ''
    handleQuery()
  }

  // 分页大小变化：更新每页显示数量，重置到第一页并重新获取列表
    function handleSizeChange(val: number) {
      pageSize.value = val
    pageNum.value = 1
      getList()
    }

  // 当前页变化：更新当前页码并重新获取列表
    function handleCurrentChange(val: number) {
      pageNum.value = val
      getList()
    }
  
  // 组件挂载时获取列表数据
    onMounted(() => {
      getList()
    })

  // 新增/编辑对话框相关
  const dialogVisible = ref(false)
  const dialogTitle = ref('新增收获记录')
  const harvestFormRef = ref<FormInstance>()
  const currentItem = ref<ReadyHarvestItem | null>(null)
  const isEditMode = ref(false)

  const harvestForm = reactive({
    className: '',
    classWeight: '',
    shouhuoTime: '',
    remark: ''
  })

  const harvestFormRules: FormRules = {
    className: [
      { required: true, message: '请输入种植作物', trigger: 'blur' }
    ],
    classWeight: [
      { required: true, message: '请输入作物重量', trigger: 'blur' }
    ],
    shouhuoTime: [
      { required: true, message: '请选择收获日期', trigger: 'change' }
    ]
  }

  // 新增按钮点击
  function handleAdd(item: ReadyHarvestItem) {
    currentItem.value = item
    isEditMode.value = false
    dialogTitle.value = '新增收获记录'
    
    // 重置表单并填充默认值
    harvestForm.className = item.className || '' // farmplotZuowu的值
    harvestForm.classWeight = ''
    harvestForm.shouhuoTime = ''
    harvestForm.remark = ''
    
    dialogVisible.value = true
  }

  // 编辑按钮点击
  async function handleEdit(item: ReadyHarvestItem) {
    currentItem.value = item
    isEditMode.value = true
    dialogTitle.value = '编辑收获记录'
    
    try {
      // 获取该地块的收获记录列表，使用 farmId 区分
      const res = await HarvestItemApi.getHarvestItemList({
        farmId: item.farmId
      })
      
      if (res?.records && res.records.length > 0) {
        // 如果有记录，使用第一条记录的数据
        const record = res.records[0]
        harvestForm.className = record.className || item.className
        harvestForm.classWeight = record.classWeight || ''
        harvestForm.shouhuoTime = record.shouhuoTime || ''
        harvestForm.remark = record.remark || ''
      } else {
        // 如果没有记录，使用默认值
        harvestForm.className = item.className || ''
        harvestForm.classWeight = ''
        harvestForm.shouhuoTime = ''
        harvestForm.remark = ''
      }
      
      dialogVisible.value = true
    } catch (error) {
      console.error('获取收获记录失败:', error)
      ElMessage.error('获取收获记录失败')
    }
  }

  // 提交表单
  async function handleSubmit() {
    if (!harvestFormRef.value) return
    
    await harvestFormRef.value.validate(async (valid) => {
      if (valid && currentItem.value) {
        try {
          // 获取匹配到的图片URL，将数组转换为字符串（用 | 分隔）
          let classImgStr = ''
          if (currentItem.value.classImg && currentItem.value.classImg.length > 0) {
            classImgStr = currentItem.value.classImg.join('|')
          }
          
          const harvestData: HarvestItem = {
            id: 0,
            farmId: currentItem.value.farmId,
            className: harvestForm.className,
            classWeight: harvestForm.classWeight,
            shouhuoTime: harvestForm.shouhuoTime,
            remark: harvestForm.remark || '',
            status: '',
            classImg: classImgStr
          }

          if (isEditMode.value) {
            // 编辑模式：需要先获取记录ID，使用 farmId 区分
            const res = await HarvestItemApi.getHarvestItemList({
              farmId: currentItem.value.farmId
            })
            
            if (res?.records && res.records.length > 0) {
              harvestData.id = res.records[0].id
              await HarvestItemApi.updateHarvestItem(harvestData)
              ElMessage.success('编辑成功')
            } else {
              ElMessage.warning('未找到可编辑的记录')
            }
          } else {
            // 新增模式
            await HarvestItemApi.addHarvestItem(harvestData)
            ElMessage.success('新增成功')
          }
          
          dialogVisible.value = false
          // 刷新列表以更新状态和按钮
          await getList()
        } catch (error) {
          console.error('操作失败:', error)
          ElMessage.error('操作失败')
        }
      }
    })
  }

  // 删除收获记录
  async function handleDelete(item: ReadyHarvestItem) {
    if (!item.harvestId) {
      ElMessage.warning('未找到可删除的记录')
      return
    }

    try {
      await ElMessageBox.confirm('确定删除该收获记录吗？', '提示', {
        type: 'warning'
      })

      await HarvestItemApi.deleteHarvestItem(item.harvestId)
      ElMessage.success('删除成功')
      await getList()
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    }
  }

  // 对话框关闭
  function handleDialogClose() {
    harvestFormRef.value?.resetFields()
    currentItem.value = null
    isEditMode.value = false
  }
  </script>
  
<style scoped>
    .form-top {
      margin: 10px 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  
  .form-top .demo-form-inline {
        height: 50px;
      }
  
  .form-top .inpname {
        width: 240px;
    }
  
    .plant-do {
      margin-left: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  
  .plant-do .do-right {
        width: 40%;
        display: flex;
        justify-content: space-between;
        align-items: center;
  }
  
  .plant-do .do-right .desc-item {
          display: flex;
          align-items: center;
          font-size: 14px;
  }
  
  .plant-do .do-right .desc-item p {
            margin-right: 10px;
          }
  
  .plant-do .do-right .desc-item ul {
            font-size: 12px;
            display: flex;
  }
  
  .plant-do .do-right .desc-item ul .dot {
              width: 10px;
              height: 10px;
            }
  
  .plant-do .do-right .desc-item ul li {
              height: 20px;
              display: flex;
              align-items: center;
              margin-right: 8px;
              width: 50px;
  }
  
  .plant-do .do-right .desc-item ul li:first-child {
                color: #fa7c01;
              }
  
  .plant-do .do-right .desc-item ul li:nth-child(2) {
                color: #0cbf5b;
              }
  
  .plant-do .do-right .desc-item ul li:nth-child(3) {
                color: #019fe8;
    }
  
    .plant-table {
      margin: 10px;
    }
  
  .table-content .dp-name {
        color: #0cbf5b;
      }
  
  .table-content .do-text {
        font-size: 12px;
      }
  
  .table-content .txt-btn {
        font-size: 12px;
        margin: 0 5px;
    }
  
    .page-block {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
  
    .batch-card-grid {
      padding: 20px;
  }
  
  .batch-card-grid .el-row {
        margin: -12px;
      }
  
  .batch-card-grid .el-col {
        padding: 22px 12px 22px 12px;
    }
  
    .batch-card {
      height: 100%;
      background: white;
      border-radius: 16px;
      padding: 16px;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .batch-card .batch-card-header {
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
  }
  
  .batch-card .batch-card-header .header-content .section-name {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }
  
  .batch-card .batch-card-header .header-content .batch-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
  
  .batch-card .batch-card-header .el-tag {
          border-radius: 4px;
          padding: 0 8px;
      }
  
  .batch-card .batch-image {
        width: 100%;
        height: 180px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        margin-bottom: 16px;
  }
  
  .batch-card .batch-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
  
  .batch-card .batch-image:hover img {
          transform: scale(1.05);
      }
  
  .batch-card .batch-card-content {
        padding: 0;
  }
  
  .batch-card .batch-card-content .batch-info {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
  }
  
  .batch-card .batch-card-content .batch-info .info-item {
            font-size: 13px;
            display: flex;
            align-items: center;
  }
  
  .batch-card .batch-card-content .batch-info .info-item i {
              color: #409eff;
              margin-right: 8px;
              font-size: 14px;
            }
  
  .batch-card .batch-card-content .batch-info .info-item .label {
              color: #666;
              margin-right: 8px;
      }

  .batch-card .batch-card-content .batch-card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
      }
  
  .batch-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }
  
    @media screen and (max-width: 1400px) {
    .batch-card-grid .el-col {
        width: 50% !important;
      }
    }
  
    @media screen and (max-width: 992px) {
    .batch-card-grid .el-col {
        width: 100% !important;
      }
    }
  
  .harvest-card-grid .el-row {
        margin: -10px;
      }
  
  .harvest-card-grid .el-col {
        padding: 10px;
    }
  
    .harvest-card {
      transition: all 0.3s ease;
  }
  
  .harvest-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
  
  .harvest-card .harvest-card-content {
        display: flex;
        align-items: stretch;
  }

  .harvest-card .harvest-card-content .info-section {
          flex: 1;
          padding: 10px;
    width: 100%;
  }
  
  .harvest-card .harvest-card-content .info-section .header-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
  }
  
  .harvest-card .harvest-card-content .info-section .header-title .food-name {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
          }
  
  .harvest-card .harvest-card-content .info-section .harvest-info {
            display: flex;
            flex-direction: column;
            gap: 15px;
  }
  
  .harvest-card .harvest-card-content .info-section .harvest-info .info-row {
              display: flex;
              gap: 30px;
  }
  
  .harvest-card .harvest-card-content .info-section .harvest-info .info-row .info-item {
                flex: 1;
                display: flex;
                align-items: center;
                font-size: 14px;
  }
  
  .harvest-card .harvest-card-content .info-section .harvest-info .info-row .info-item i {
                  color: #409eff;
                  margin-right: 8px;
                  font-size: 16px;
                }
  
  .harvest-card .harvest-card-content .info-section .harvest-info .info-row .info-item .label {
                  color: #606266;
                  margin-right: 8px;
                  min-width: 70px;
                }
  
  .harvest-card .harvest-card-content .info-section .harvest-info .info-row .info-item span:last-child {
                  color: #303133;
                  flex: 1;
                  word-break: break-all;
  }

    .custom-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 24px 0 0 0;
    padding: 0 24px 12px 0;
    }
  
    .form-label-strong {
      color: #222;
      font-weight: bold;
      font-size: 14px;
    }

  .app-container-sm {
    min-height: 80vh;
    background: #f5f7fa;
    box-sizing: border-box;
    padding-bottom: 24px;
  }

  .batch-card-grid {
    min-height: calc(100vh - 150px);
  }

  .dialog-footer-btn {
    padding: 0 12px;
    height: 30px;
    font-size: 15px;
  }

.readonly-input :deep(.el-input__wrapper) {
  background-color: #f2f3f5;
  border-color: #dcdfe6;
  box-shadow: none;
}

.readonly-input :deep(.el-input__inner) {
  color: #909399;
}
</style>

<style>
  .form-input-large .el-input__inner,
  .form-input-large .el-select__wrapper {
      height: 35px !important;
      line-height: 35px !important;
      font-size: 14px !important;
    }
  
  .form-btn-large,
  .form-btn-large .el-button {
      height: 30px !important;
      min-height: 30px !important;
      font-size: 12px !important;
      padding: 0 12px !important;
      border-radius: 4px !important;
      display: flex;
      align-items: center;
    }
  
  .search-btn {
      background-color: transparent !important;
      border-color: #dcdfe6 !important;
      color: #606266 !important;
  }
      
  .search-btn:hover {
        background-color: transparent !important;
        border-color: #dcdfe6 !important;
        color: #606266 !important;
    }
  

  .el-select {
    width: 200px !important;
  }

  .el-select .el-input__inner {
    height: 40px !important;
    line-height: 40px !important;
    font-size: 16px;
  }

  .el-date-editor.el-input {
    width: 100%;
  }

  .el-form-item__label {
    line-height: 40px !important;
    height: 40px !important;
    }
  </style>
  