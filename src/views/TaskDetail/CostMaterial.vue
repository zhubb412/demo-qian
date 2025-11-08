<template>
  <!-- 农资使用管理组件：用于登记和管理农资使用记录 -->
  <div class="padding-bottom-10">
      <el-alert
          title="登记农资使用"
          type="info"
          show-icon
          description="此处可以登记农资使用"
      />
      <el-table
          v-loading="loading"
          :data="materialUsageList"
          class="margin-top-10"
      >
          <el-table-column label="农资名称" align="center" prop="materialName"/>
          <el-table-column label="使用数量" align="center" prop="useAge"/>
          <el-table-column label="计量单位" align="center" prop="measureUnit"/>
          <el-table-column
              label="开始日期"
              align="center"
              prop="kaishiTime"
              width="140"
          >
              <template #default="{ row }">
                  {{ parseTime(row.kaishiTime) }}
              </template>
          </el-table-column>
          <el-table-column
              label="结束日期"
              align="center"
              prop="jiesuTime"
              width="140"
          >
              <template #default="{ row }">
                  {{ parseTime(row.jiesuTime) }}
              </template>
          </el-table-column>
         
          <el-table-column
              label="操作"
              align="center"
              class-name="small-padding fixed-width"
          >
              <template #header>
                  <el-tag
                      @click="handleAdd"
                      v-hasPermi="['fishingGround:costBait:add']"
                      class="cursor-pointer"
                  >新增
                  </el-tag>
              </template>
              <template #default="{ row }">
                  <el-button
                      size="small"
                      type="primary"
                      link
                      icon="Edit"
                      @click="handleUpdate(row)"
                      v-hasPermi="['fishingGround:costBait:edit']"
                  >修改
                  </el-button
                  >
                  <el-button
                      size="small"
                      type="primary"
                      link
                      icon="Delete"
                      @click="handleDelete(row)"
                      v-hasPermi="['fishingGround:costBait:remove']"
                  >删除
                  </el-button
                  >
              </template>
          </el-table-column>
      </el-table>

      <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
      <!-- 添加或修改农资使用对话框 -->
      <el-dialog
          v-model="open"
          :title="title"
          width="500px"
          append-to-body
      >
          <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="80px"
          >
              <el-form-item label="农资名称" prop="materialId">
                  <el-select
                      v-model="form.materialId"
                      placeholder="请选择农资名称"
                      class="display-block"
                      clearable
                      filterable
                      @change="handleMaterialChange"
                  >
                      <el-option
                          v-for="item in materialInfoList"
                          :key="item.materialId"
                          :label="item.materialName"
                          :value="item.materialId"
                      />
                  </el-select>
              </el-form-item>
              <el-form-item label="使用数量" prop="useAge">
                  <el-input v-model="form.useAge" placeholder="请输入使用数量"/>
              </el-form-item>
              <el-form-item label="计量单位" prop="measureUnit">
                  <el-input v-model="form.measureUnit" placeholder="请输入计量单位"/>
              </el-form-item>
              <el-form-item label="开始日期" prop="kaishiTime">
                  <el-date-picker
                      v-model="form.kaishiTime"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择开始日期"
                      class="w100"
                      clearable
                      :disabledDate="disableWorkingStartDate"
                  >
                  </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期" prop="jiesuTime">
                  <el-date-picker
                      v-model="form.jiesuTime"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择结束日期"
                      class="w100"
                      clearable
                      :disabledDate="disableWorkingFinishDate"
                  >
                  </el-date-picker>
              </el-form-item>
          </el-form>
          <template #footer>
              <div class="dialog-footer">
                  <el-button type="primary" @click="submitForm">确 定</el-button>
                  <el-button @click="cancel">取 消</el-button>
              </div>
          </template>
      </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { MaterialUseItemApi, type MaterialUseDTOItem, type MaterialUseItem } from '@/api/materialUseApi'
import { agricultureMaterialList, type AgricultureMaterialItem } from '@/api/agricultureMaterialApi'

/**
 * 组件 Props 定义
 */
interface Props {
  taskId: number | string  // 任务ID
  currentUser?: Record<string, unknown>  // 当前用户信息（可选）
}

/**
 * 农资使用表单数据接口
 */
interface MaterialUsageForm {
  id: number | null  // 记录ID，新增时为null
  taskId: number  // 任务ID
  materialId: number | null  // 农资ID
  materialName: string  // 农资名称
  useAge: string  // 使用数量
  measureUnit: string  // 计量单位
  kaishiTime: string  // 开始日期
  jiesuTime: string  // 结束日期
}

/**
 * 日期格式化函数：将日期转换为 YYYY-MM-DD 格式
 * @param input - 日期输入（字符串、数字、Date对象或null/undefined）
 * @returns 格式化后的日期字符串，无效日期返回 '-'
 */
const parseTime = (input: string | number | Date | null | undefined): string => {
  if (!input) return '-'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 格式化日期字符串：提取日期部分（去除时间部分）
 * @param value - 日期字符串（可能包含时间部分）
 * @returns 仅日期部分的字符串（YYYY-MM-DD）
 */
const formatDateOnly = (value: string | null | undefined): string => {
  if (!value) return ''
  return value.split(' ')[0].split('T')[0]
}

const props = defineProps<Props>()

const loading = ref(false)  // 加载状态
const total = ref(0)  // 数据总数
const materialUsageList = ref<MaterialUseDTOItem[]>([])  // 农资使用列表数据
const materialInfoList = ref<AgricultureMaterialItem[]>([])  // 农资信息列表（用于下拉选择）
const title = ref('')  // 对话框标题
const open = ref(false)  // 对话框显示状态
const formRef = ref<FormInstance>()  // 表单引用

/**
 * 查询参数
 */
const queryParams = reactive({
  pageNum: 1,  // 当前页码
  pageSize: 10,  // 每页条数
  taskId: Number(props.taskId)  // 任务ID
})

/**
 * 表单数据
 */
const form = reactive<MaterialUsageForm>({
  id: null,
  taskId: Number(props.taskId),
  materialId: null,
  materialName: '',
  useAge: '',
  measureUnit: '',
  kaishiTime: '',
  jiesuTime: ''
})

/**
 * 表单验证规则
 */
const rules = reactive<FormRules>({
  materialId: [
    { required: true, message: '农资名称不能为空', trigger: 'change' }
  ],
  useAge: [
    { required: true, message: '使用数量不能为空', trigger: 'blur' }
  ],
  measureUnit: [
    { required: true, message: '计量单位不能为空', trigger: 'blur' }
  ],
  kaishiTime: [
    { required: true, message: '开始日期不能为空', trigger: 'change' }
  ],
  jiesuTime: [
    { required: true, message: '结束日期不能为空', trigger: 'change' }
  ]
})

/**
 * 获取农资使用列表
 * 根据任务ID分页查询农资使用记录（后端已根据taskId过滤）
 */
const getList = async () => {
  // 设置加载状态为 true，显示加载动画
  loading.value = true
  try {
    // 调用新的API方法，后端已根据taskId进行过滤
    const response = await MaterialUseItemApi.getMaterialUseItemDTOTaskId({
      current: queryParams.pageNum,  // 当前页码
      size: queryParams.pageSize,    // 每页条数
      taskId: queryParams.taskId      // 任务ID（后端会根据此ID过滤数据）
    })
    // 提取响应数据，兼容不同的响应结构（可能在 data 属性中，也可能直接是响应）
    const data = (response as any)?.data || response
    // 更新农资使用列表数据，如果 records 不存在则使用空数组
    materialUsageList.value = data?.records || []
    // 更新数据总数，如果 total 不存在则使用 0
    total.value = data?.total || 0
    // 如果响应中包含分页信息，则更新当前页码和每页条数（保持与服务器同步）
    if (data?.current) queryParams.pageNum = data.current
    if (data?.size) queryParams.pageSize = data.size
  } catch (error) {
    // 捕获错误并记录到控制台
    console.error('获取农资使用列表失败:', error)
    // 显示错误提示消息给用户
    ElMessage.error('获取农资使用列表失败')
    // 发生错误时，清空列表数据并重置总数为 0
    materialUsageList.value = []
    total.value = 0
  } finally {
    // 无论成功或失败，都要关闭加载状态
    loading.value = false
  }
}

/**
 * 获取农资信息列表
 * 用于下拉选择框，获取所有可用的农资信息
 */
const getMaterialInfoList = async () => {
  try {
    // 调用 API 获取农资信息列表，使用较大的分页大小（999）以获取所有数据
    const response = await agricultureMaterialList.listagricultureMaterial({ 
      current: 1,   // 从第一页开始
      size: 999     // 每页999条，确保获取所有数据
    })
    // 提取响应数据，兼容不同的响应结构（可能在 data 属性中，也可能直接是响应）
    const data = (response as any)?.data || response
    // 更新农资信息列表，优先使用 records（分页数据），其次使用 data（直接数组），最后使用空数组
    materialInfoList.value = data?.records || data || []
  } catch (error) {
    // 捕获错误并记录到控制台
    console.error('获取农资信息失败:', error)
    // 显示错误提示消息给用户
    ElMessage.error('获取农资信息失败')
    // 发生错误时，清空列表数据
    materialInfoList.value = []
  }
}

/**
 * 重置表单
 * 清空表单所有字段并重置验证状态
 */
const reset = () => {
  form.id = null
  form.taskId = Number(props.taskId)
  form.materialId = null
  form.materialName = ''
  form.useAge = ''
  form.measureUnit = ''
  form.kaishiTime = ''
  form.jiesuTime = ''
  formRef.value?.resetFields()
}

/**
 * 取消操作
 * 关闭对话框并重置表单
 */
const cancel = () => {
  open.value = false
  reset()
}

/**
 * 农资选择变化处理
 * 当用户选择农资时，自动填充农资名称和计量单位
 * @param value - 选中的农资ID
 */
const handleMaterialChange = (value: number | null) => {
  if (value == null) {
    form.materialName = ''
    return
  }
  const target = materialInfoList.value.find(item => Number(item.materialId) === Number(value))
  if (target) {
    form.materialName = target.materialName || ''
    // 如果农资信息中有计量单位，自动填充
    if (target.measureUnit) {
      form.measureUnit = target.measureUnit
    }
  }
}

/**
 * 新增按钮点击处理
 * 重置表单，获取农资列表，打开新增对话框
 */
const handleAdd = () => {
  reset()
  getMaterialInfoList()
  open.value = true
  title.value = '添加农资使用'
}

/**
 * 修改按钮点击处理
 * 填充表单数据，打开修改对话框
 * @param row - 要修改的农资使用记录
 */
const handleUpdate = (row: MaterialUseDTOItem) => {
  reset()
  form.id = row.id
  form.taskId = Number(props.taskId)
  form.materialId = row.materialId
  form.materialName = row.materialName || ''
  form.useAge = row.useAge || ''
  form.measureUnit = row.measureUnit || ''
  form.kaishiTime = formatDateOnly(row.kaishiTime)
  form.jiesuTime = formatDateOnly(row.jiesuTime)
  open.value = true
  title.value = '修改农资使用'
}

/**
 * 提交表单
 * 验证表单数据，根据是否有ID决定新增或修改
 */
const submitForm = async () => {
  if (!formRef.value) return
  try {
    // 表单验证
    await formRef.value.validate()

    // 验证农资是否已选择
    if (!form.materialId) {
      ElMessage.error('请选择农资名称')
      return
    }

    // 确保 materialName 已设置（防止选择后未触发change事件的情况）
    if (!form.materialName) {
      const target = materialInfoList.value.find(item => item.materialId === form.materialId)
      if (target) {
        form.materialName = target.materialName || ''
        // 如果表单中计量单位为空，使用农资信息中的计量单位
        if (!form.measureUnit && target.measureUnit) {
          form.measureUnit = target.measureUnit
        }
      }
    }

    // 构建提交数据
    const submitData: MaterialUseItem = {
      id: form.id ?? undefined,
      taskId: form.taskId,
      materialId: Number(form.materialId),
      useAge: form.useAge,
      materialName: form.materialName,
      measureUnit: form.measureUnit,
      kaishiTime: form.kaishiTime,
      jiesuTime: form.jiesuTime
    }

    // 根据是否有ID判断是新增还是修改
    if (form.id) {
      await MaterialUseItemApi.updateMaterialUseItem(submitData)
      ElMessage.success('修改成功')
    } else {
      await MaterialUseItemApi.addMaterialUseItem(submitData)
      ElMessage.success('新增成功')
    }

    // 关闭对话框，刷新列表，重置表单
    open.value = false
    await getList()
    reset()
  } catch (error: any) {
    // 表单验证失败时不显示错误（Element Plus 会自动显示）
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请稍后重试')
    }
  }
}

/**
 * 删除按钮点击处理
 * 确认后删除指定的农资使用记录
 * @param row - 要删除的农资使用记录
 */
const handleDelete = async (row: MaterialUseDTOItem) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除农资使用编号为"${row.id}"的数据项？`,
      '警告'
    )
    await MaterialUseItemApi.deleteMaterialUseItem(row.id)
    ElMessage.success('删除成功')
    await getList()
  } catch (error: any) {
    // 用户取消删除时不显示错误
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

/**
 * 禁用开始日期
 * 禁用今天之前的日期
 * @param time - 要检查的日期
 * @returns 是否禁用该日期
 */
const disableWorkingStartDate = (time: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(time)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < today
}

/**
 * 禁用结束日期
 * 禁用开始日期之前的日期
 * @param time - 要检查的日期
 * @returns 是否禁用该日期
 */
const disableWorkingFinishDate = (time: Date) => {
  if (!form.kaishiTime) return false
  const startDate = new Date(form.kaishiTime)
  startDate.setHours(0, 0, 0, 0)
  const checkDate = new Date(time)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate < startDate
}

/**
 * 组件挂载时初始化
 * 获取农资信息列表和农资使用列表
 */
onMounted(() => {
  getMaterialInfoList()
  getList()
})

</script>

<style scoped>
/* 底部内边距 */
.padding-bottom-10 {
  padding-bottom: 10px;
}

/* 顶部外边距 */
.margin-top-10 {
  margin-top: 10px;
}

/* 块级显示 */
.display-block {
  display: block;
}

/* 宽度100% */
.w100 {
  width: 100%;
}

/* 鼠标指针样式 */
.cursor-pointer {
  cursor: pointer;
}
</style>
