<template>
  <div class="padding-bottom-10">
    <el-alert
      title="登记人工工时"
      type="info"
      show-icon
      description="此处可以按照每个用工登记工时"
    />
    <el-table
      v-loading="loading"
      :data="costEmployeeList"
      class="margin-top-10"
    >
      <el-table-column label="雇员" align="center" prop="userName" />
      <el-table-column label="工时" align="center" prop="workingHours" />
      <el-table-column
        label="开始日期"
        align="center"
        prop="workingStart"
        width="180"
      />
      <el-table-column
        label="结束日期"
        align="center"
        prop="workingFinish"
        width="180"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #header>
          <el-tag
            @click="handleAdd"
            v-hasPermi="['agriculture:costEmployee:add']"
            class="cursor-pointer"
          >新增</el-tag>
        </template>
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            icon="Edit"
            @click="handleUpdate(row)"
            v-hasPermi="['agriculture:costEmployee:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="primary"
            link
            icon="Delete"
            @click="handleDelete(row)"
            v-hasPermi="['agriculture:costEmployee:remove']"
          >删除</el-button>
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

    <!-- 添加或修改人工工时对话框 -->
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
        <el-form-item label="雇员" prop="employeeId">
          <el-select
            v-model="form.employeeId"
            class="display-block"
            placeholder="请选择雇员"
            clearable
            filterable
          >
            <el-option
              v-for="employee in employeeList"
              :key="employee.id"
              :label="employee.userName"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工时" prop="workingHours">
          <el-input v-model="form.workingHours" placeholder="请输入工时">
            <template #append>天</template>
          </el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="workingStart">
          <el-date-picker
            v-model="form.workingStart"
            class="w100"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择开始日期"
            clearable
            :disabledDate="disableWorkingStartDate"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="workingFinish">
          <el-date-picker
            v-model="form.workingFinish"
            class="w100"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择结束日期"
            clearable
            :disabledDate="disableWorkingFinishDate"
          />
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
import { UserEmployeeApi, type UserEmployeeDTOItem } from '@/api/userEmployeeApi'
import { sysUserList, type SysUserItem } from '@/api/sysUserApi'

const props = defineProps<{
  taskId: number | string,
  taskEmployeeList?: any[],
  currentUser: { userId: string | number, userName: string }
}>()

const emit = defineEmits(['log'])

// 遮罩层
const loading = ref(false)
// 总条数
const total = ref(0)
// 人工工时表格数据
const costEmployeeList = ref<UserEmployeeDTOItem[]>([])
// 雇员列表（用于下拉选择）
const employeeList = ref<SysUserItem[]>([])

// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)
// 表单ref
const formRef = ref()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  taskId: props.taskId,
  current: 1,
  size: 10
})

// 表单参数
const form = reactive({
  costId: null,
  taskId: props.taskId,
  employeeId: null as number | string | null,
  workingHours: null,
  workingStart: '',
  workingFinish: '',
  remark: null,
  status: "0",
  orderNum: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  delFlag: null
})

// 表单校验规则
const rules = {
  employeeId: [
    { required: true, message: "雇员ID不能为空", trigger: "blur" }
  ],
  workingHours: [
    { required: true, message: "工时不能为空", trigger: "blur" }
  ],
  workingStart: [
    { required: true, message: "开始日期不能为空", trigger: "blur" }
  ],
  workingFinish: [
    { required: true, message: "结束日期不能为空", trigger: "blur" }
  ]
}

/**
 * 获取人工工时列表
 * 根据任务ID分页查询人工工时记录（后端已根据taskId过滤）
 */
const getList = async () => {
  // 设置加载状态为 true，显示加载动画
  loading.value = true
  try {
    // 调用新的API方法，后端已根据taskId进行过滤
    const response = await UserEmployeeApi.getUserEmployeeDTOListTaskId({
      current: queryParams.pageNum,  // 当前页码
      size: queryParams.pageSize,    // 每页条数
      taskId: Number(queryParams.taskId)  // 任务ID（后端会根据此ID过滤数据），确保转换为数字类型
    })
    // 提取响应数据，兼容不同的响应结构（可能在 data 属性中，也可能直接是响应）
    const data = (response as any)?.data || response
    // 更新人工工时列表数据，如果 records 不存在则使用空数组
    costEmployeeList.value = data?.records || []
    // 更新数据总数，如果 total 不存在则使用 0
    total.value = data?.total || 0
    // 如果响应中包含分页信息，则更新当前页码和每页条数（保持与服务器同步）
    if (data?.current) queryParams.pageNum = data.current
    if (data?.size) queryParams.pageSize = data.size
  } catch (error) {
    // 捕获错误并记录到控制台
    console.error('获取人工工时列表失败:', error)
    // 显示错误提示消息给用户
    ElMessage.error('获取人工工时列表失败')
    // 发生错误时，清空列表数据并重置总数为 0
    costEmployeeList.value = []
    total.value = 0
  } finally {
    // 无论成功或失败，都要关闭加载状态
    loading.value = false
  }
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, {
    costId: null,
    taskId: props.taskId,
    employeeId: null,
    workingHours: null,
    workingStart: null,
    workingFinish: null,
    remark: null,
    status: "0",
    orderNum: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null
  })
  formRef.value?.resetFields()
}

// 新增按钮操作
const handleAdd = () => {
  reset()
  open.value = true
  title.value = "添加人工工时"
}

// 格式化日期，只保留日期部分（yyyy-MM-dd）
const formatDateOnly = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  // 如果包含时间部分（如 "2025-11-13 00:00:00"），提取日期部分
  if (dateStr.includes(' ')) {
    return dateStr.split(' ')[0]
  }
  // 如果包含T（ISO格式），提取日期部分
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0]
  }
  // 否则直接返回（已经是 yyyy-MM-dd 格式）
  return dateStr
}

// 修改按钮操作
const handleUpdate = (row: UserEmployeeDTOItem) => {
  reset()
  // 只填充必要的字段
  form.costId = row.costId as any
  form.employeeId = Number(row.employeeId) // 确保是数字类型，el-select会正确匹配并显示对应的label（userName）
  form.workingHours = row.workingHours as any
  // 格式化日期，只保留日期部分（yyyy-MM-dd），去除时分秒
  form.workingStart = formatDateOnly(row.workingStart)
  form.workingFinish = formatDateOnly(row.workingFinish)
  open.value = true
  title.value = "修改人工工时"
}

// 提交按钮
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 获取当前时间戳（格式：yyyy-MM-dd HH:mm:ss）
    const getCurrentTimestamp = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    // 格式化日期，确保只保留日期部分（yyyy-MM-dd）
    const formatDateForSubmit = (dateStr: string | null | undefined): string => {
      if (!dateStr) return ''
      // 如果包含时间部分，只取日期部分
      if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0]
      }
      if (dateStr.includes('T')) {
        return dateStr.split('T')[0]
      }
      return dateStr
    }
    
    // 只提交必要的字段
    const submitData: any = {
      costId: form.costId || 0,
      taskId: Number(props.taskId),
      employeeId: Number(form.employeeId),
      workingHours: String(form.workingHours || ''),
      // 确保日期格式为 yyyy-MM-dd（后端注解要求）
      workingStart: formatDateForSubmit(form.workingStart),
      workingFinish: formatDateForSubmit(form.workingFinish),
      remark: '',
      status: "0",
      orderNum: '',
      createBy: '',
      createTime: '',
      updateBy: '',
      updateTime: ''
    }
    
    let res
    if (form.costId) {
      // 修改：调用更新接口，设置updateTime
      submitData.updateTime = getCurrentTimestamp()
      res = await UserEmployeeApi.updateUserEmployee(submitData)
      ElMessage.success('修改成功')
    } else {
      // 新增：调用新增接口，设置createTime
      submitData.createTime = getCurrentTimestamp()
      res = await UserEmployeeApi.addUserEmployee(submitData)
      ElMessage.success('新增成功')
    }
    
    // 检查响应结果
    const dataValue = (res as any)?.data
    if (dataValue === 1 || dataValue === '1' || res) {
      // 刷新列表
      await getList()
      // 关闭对话框
      open.value = false
      reset()
    } else {
      ElMessage.error('操作失败')
    }
  } catch (error: any) {
    // 表单验证失败时不显示错误（Element Plus 会自动显示）
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }
}

// 删除按钮操作
const handleDelete = async (row: UserEmployeeDTOItem) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除雇员"${row.userName}"的工时记录？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 确认删除，调用删除接口
    const res = await UserEmployeeApi.deleteUserEmployee(row.costId)
    
    // 检查响应结果
    const dataValue = (res as any)?.data
    if (dataValue === 1 || dataValue === '1' || res) {
      ElMessage.success('删除成功')
      // 刷新列表
      await getList()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error: any) {
    // 用户取消删除时不显示错误
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 日期限制函数
const disableWorkingStartDate = (time: Date) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const checkDate = new Date(time);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() < currentDate.getTime();
};

// 日期限制函数
const disableWorkingFinishDate = (time: Date) => {
  if (form.workingStart) {
    const startDate = new Date(form.workingStart);
    startDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(time);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() < startDate.getTime();
  }
  return false;
};

// 获取雇员列表（用于下拉选择）
const getEmployeeList = async () => {
  try {
    const response = await sysUserList.listSysUser()
    const rawData = (response as any)?.records || (response as any)?.data || response || []
    employeeList.value = Array.isArray(rawData) ? rawData : []
  } catch (error) {
    console.error('获取雇员列表失败:', error)
    ElMessage.error('获取雇员列表失败')
    employeeList.value = []
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 获取雇员列表
  getEmployeeList()
  // 获取人工工时列表
  if (props.taskId) {
    getList()
  }
})
</script>

<style scoped>
.padding-bottom-10 {
  padding-bottom: 10px;
}

.margin-top-10 {
  margin-top: 10px;
}

.w100 {
  width: 100%;
}

.display-block {
  display: block;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
