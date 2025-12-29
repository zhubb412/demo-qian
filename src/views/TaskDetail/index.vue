<template>
    <div class="task-detail">
        <el-input :value="(form.farmplotName || '') + ' / ' + (form.farmtaskName || '')" placeholder="" size="small"
            clearable disabled class="task-name-input"></el-input>

        <el-form label-position="top" ref="formRef" :model="form" :rules="rules" label-width="0">
            <el-row class="mt-20">
                <el-col :span="2" class="flex items-center">
                    <status-select v-model="form.status" @change="handleSubmit"> 当前状态 </status-select>
                </el-col>
                <el-col :span="4" class="flex items-center">
                    <el-form-item prop="responsiblePersonId" class="mb-0">
                        <radio-select 
                            :options="userList" 
                            v-model="form.responsiblePersonId" 
                            key-name="userName"
                            value-name="id" 
                            @change="handleSubmit">
                            责任人
                        </radio-select>
                    </el-form-item>
                </el-col>

                <el-col :span="4" class="flex items-center">
                    <calendar-select v-model="form.planStart" :showTime="true" disabled>计划开始时间</calendar-select>
                </el-col>
                <el-col :span="4" class="flex items-center">
                    <calendar-select v-model="form.planFinish" :showTime="true" disabled>计划完成时间</calendar-select>
                </el-col>

                <el-col :span="4" class="flex items-center">
                    <calendar-select v-model="form.actualStart" :showTime="false" @change="handleDateChange">任务开始时间</calendar-select>
                </el-col>
                <el-col :span="4" class="flex items-center">
                    <calendar-select
                      v-model="form.actualFinish"
                      :showTime="false"
                    
                      @change="handleDateChange"
                    >
                      任务结束时间
                    </calendar-select>
                </el-col>
            </el-row>

            <div class="mt-20">
                <el-tabs v-model="activeTab">
                    <el-tab-pane name="taskInfo" >
                        <template #label :current-user="currentUser"  >
                            <span class="custom-tabs-label">
                                <el-icon><Document /></el-icon>
                                <span>任务信息</span>
                            </span>
                        </template>
                        <div class="task-description">
                            <div class="text-lg font-bold mb-4">任务详情：</div>
                            <div class="mt-4">
                                    {{ form.farmtaskName || '--暂无描述--' }}
                                </div>
                        </div>
                        
                        <!-- <div class="mt-8">
                            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                                <span class="font-bold text-lg mr-2" style="color: black;">操作信息</span>
                                <div style="flex-grow: 1; height: 1px; background-color: #d1d5db;"></div>
                            </div>
                            <div style="height: 150px; overflow-y: auto;">
                                <div v-for="(log, index) in logList" :key="index" class="leading-8">
                                    {{ index + 1 }}、{{ log.createTime }} ，
                                    由<span class="text-warning font-bold px-2">{{ log.operName }}</span><span>{{log.operDes}}</span>
                                </div>
                            </div>
                        </div> -->

                    
                    </el-tab-pane>
                    <el-tab-pane name="costEmployee">
                        <template #label>
                            <span class="custom-tabs-label">
                                <el-icon><User /></el-icon>
                                <span>人工工时</span>
                            </span>
                        </template>
                        <cost-employee ref="costEmployeeRef" :task-id="taskId" :task-employee-list="[]" :current-user="currentUser" @log="fetchLogList"></cost-employee>
                    </el-tab-pane>
                    <el-tab-pane name="costMaterial">
                        <template #label>
                            <span class="custom-tabs-label">
                                <el-icon><Food /></el-icon>
                                <span>农资使用</span>
                            </span>
                        </template>
                        <cost-material
                         :key="taskId"  
                         :task-id="taskId"
                         :current-user="currentUser" 
                         @log="fetchLogList"></cost-material>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, User, Food } from '@element-plus/icons-vue'
import { farmTaskList, type FarmTaskItem, type FarmTaskDTOItem } from '@/api/farmTaskApi'
import { sysUserList, type SysUserItem } from '@/api/sysUserApi'
import StatusSelect from "./StatusSelect.vue"
import RadioSelect from "./RadioSelect.vue"
import CalendarSelect from "./CalendarSelect.vue"
import CostEmployee from "./CostEmployee.vue"
import CostMaterial from './CostMaterial.vue'   

// Props 定义
const props = defineProps({
    taskId: {
        type: Number,
        required: true
    },
    oprType: {
        type: String,
        default: "update"
    },
    batchId: {
        type: Number
    }
})

// 响应式状态 - 仅保留UI需要的状态
const activeTab = ref("taskInfo")
const formRef = ref(null)
const userList = ref<any[]>([])
const logList = ref<any[]>([])
const costEmployeeRef = ref(null)
const loading = ref(false)

const form = reactive({
    // FarmTaskItem 字段
    taskId: null,
    farmtaskName: null,
    responsiblePersonId: null,
    responsiblePersonName: null,
    planStart: null,
    planFinish: null,
    actualStart: null,
    actualFinish: null,
    status: "0",
    createTime: null,
    createBy: null,
    updateBy: null,
    updateTime: null,
    // FarmTaskDTOItem 字段
    farmplotId: null,
    farmplotName: null,
    classId1: null,
    classId2: null,
    taskName: null,
    taskRen: null,
    farmId: null,
})

// 表单验证规则
const rules = {
    responsiblePersonId: [{
        required: true,
        message: "责任人不能为空",
        trigger: "blur"
    }]
}

// 当前用户信息（用于子组件）
const currentUser = {
  userId: 0,
  userName: ''
}

// 获取用户列表（责任人列表）
const fetchUserList = async () => {
    try {
        const res = await sysUserList.listSysUser({}) // 接口需要参数对象，这里传空
        
        // 提取数据 - 支持 records/data/数组 格式
        const rawData = (res as any)?.records || (res as any)?.data || res || []
        const data = Array.isArray(rawData) ? rawData : []
        
        // 将用户列表赋值给 userList
        userList.value = data as SysUserItem[]
    } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
        userList.value = []
    }
}

// 获取任务详情
const fetchTaskDetail = async () => {
    if (!props.taskId) {
        return
    }
    
    loading.value = true
    try {
        const res = await farmTaskList.getTaskById(props.taskId)
        
        // 提取数据 - 支持 records/data/数组 格式
        const rawData = (res as any)?.records || (res as any)?.data || res || []
        const data = Array.isArray(rawData) ? rawData : []
        
        // 根据接口返回的数据格式，直接取第一个元素
        const taskData = data[0] as FarmTaskDTOItem
        
        if (!taskData || !taskData.taskId) {
            ElMessage.error('未找到任务详情')
            return
        }
        
        // 填充表单数据 - 使用 farmplotName 作为地块名，farmtaskName 作为任务名称
        Object.assign(form, {
            taskId: taskData.taskId,
            farmplotId: taskData.farmplotId,
            farmplotName: taskData.farmplotName || '',
            classId1: taskData.classId1,
            classId2: taskData.classId2,
            taskName: taskData.taskName,
            taskRen: taskData.taskRen,
            farmId: taskData.farmId,
            farmtaskName: taskData.farmtaskName || '',
            planStart: taskData.planStart || null,
            planFinish: taskData.planFinish || null,
            responsiblePersonName: taskData.responsiblePersonName,
            // 处理状态：接口返回 "0" 或 "1"，确保是字符串类型
            status: taskData.status !== undefined && taskData.status !== null ? String(taskData.status) : "0",
            actualStart: taskData.actualStart || null,
            actualFinish: taskData.actualFinish || null,
        })
        
        // 设置责任人ID（如果用户列表已加载，则立即设置；否则通过 watch 监听设置）
        setResponsiblePersonId()
    } catch (error) {
        console.error('获取任务详情失败:', error)
        ElMessage.error('获取任务详情失败')
    } finally {
        loading.value = false
    }
}

// 保存任务修改（通用保存函数，支持所有字段）
const saveTask = async () => {
    if (!form.taskId) {
        ElMessage.warning('任务ID不存在，无法保存')
        return
    }
    
    try {
        // 根据选中的责任人ID，查找对应的责任人姓名
        let responsiblePersonName = form.responsiblePersonName
        if (form.responsiblePersonId && userList.value.length > 0) {
            const matchedUser = userList.value.find((user: SysUserItem) => user.id === form.responsiblePersonId)
            if (matchedUser) {
                responsiblePersonName = matchedUser.userName
            }
        }
        
        // 确保状态值是 "0" 或 "1"
        const status = form.status === "1" ? "1" : "0"
        
        // 格式化日期为 "yyyy-MM-dd" 格式
        const formatDate = (dateStr: string | null) => {
            if (!dateStr) return ''
            // 如果已经是 "yyyy-MM-dd" 格式，直接返回
            if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr
            }
            // 如果是日期对象或其他格式，转换为 "yyyy-MM-dd"
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return ''
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }
        
        // 构建提交数据
        const submitData: FarmTaskItem = {
            taskId: form.taskId,
            farmtaskName: form.farmtaskName || '',
            responsiblePersonId: form.responsiblePersonId || 0,
            responsiblePersonName: responsiblePersonName || '',
            planStart: formatDate(form.planStart),
            planFinish: formatDate(form.planFinish),
            actualStart: formatDate(form.actualStart),
            actualFinish: formatDate(form.actualFinish),
            status: status,
            createTime: form.createTime || '',
            createBy: form.createBy || '',
            updateBy: form.updateBy || '',
            updateTime: form.updateTime || '',
        }
        
        // 调用编辑任务接口
        const res = await farmTaskList.editfarmTask(submitData)
        
        // 检查响应结果（后端成功返回 data 为 1）
        const dataValue = (res as any)?.data
        if (dataValue === 1 || dataValue === '1') {
            ElMessage.success('保存成功')
            
            // 更新本地表单数据
            form.responsiblePersonName = responsiblePersonName
            form.status = status
            
            // 触发更新事件，通知父组件，并携带最新字段，便于外层同步展示
            emit('updated', {
                taskId: form.taskId,
                status,
                responsiblePersonName,
                actualStart: submitData.actualStart,
                actualFinish: submitData.actualFinish,
                planStart: submitData.planStart,
                planFinish: submitData.planFinish
            })
        } else {
            ElMessage.error((res as any)?.msg || '保存失败')
        }
    } catch (error) {
        console.error('保存任务失败:', error)
        ElMessage.error('保存任务失败')
    }
}

// 保存任务修改（状态和责任人的变更）
const handleSubmit = () => {
    saveTask()
}

// 日期变更处理
const handleDateChange = () => {
    saveTask()
}

const fetchLogList = () => {
    // TODO: 实现日志获取逻辑
    logList.value = []
}


const emit = defineEmits(['close', 'updated'])

// 根据责任人姓名设置责任人ID
const setResponsiblePersonId = () => {
    if (form.responsiblePersonName && userList.value.length > 0) {
        const matchedUser = userList.value.find((user: SysUserItem) => user.userName === form.responsiblePersonName)
        if (matchedUser) {
            form.responsiblePersonId = matchedUser.id
        }
    }
}

// 监听用户列表变化，当用户列表加载完成后，自动设置责任人ID
watch(() => userList.value, () => {
    if (form.responsiblePersonName && !form.responsiblePersonId) {
        setResponsiblePersonId()
    }
}, { deep: true })

// 组件挂载时获取用户列表
onMounted(() => {
    fetchUserList()
})

// 监听 taskId 变化，当 taskId 变化时自动获取任务详情
watch(() => props.taskId, (newVal) => {
    if (newVal) {
        fetchTaskDetail()
    }
}, { immediate: true })

</script>

<style lang="scss" scoped>
.task-name-input {
    margin-top: -15px;
    height: 30px;
}
.task-detail {
    :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
    }

    .custom-tabs-label {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .el-icon {
            margin-right: 4px;
        }
    }
}

.task-description {
  margin-bottom: 15px;
}

.task-description > .text-lg {
  margin-bottom: 12px;
}

.mt-8 {
  margin-top: 15px !important;
}

// 编辑按钮绿色字体
.edit-btn {
  color: #3bb77e !important;
}

// 自定义"确定"按钮样式：绿色背景、白色字体、无边框
.confirm-btn {
  background: #3bb77e !important;
  color: #fff !important;
  border: none !important;
}
// 自定义"取消"按钮样式：灰色背景、白色字体、无边框
.cancel-btn {
  background: #acf3d1 !important;
  color: #fff !important;
  border: none !important;
}
// 鼠标悬停时按钮颜色加深
.confirm-btn:hover {
  background: #34a06a !important;
  color: #fff !important;
}
.cancel-btn:hover {
  background: #bdbdbd !important;
  color: #fff !important;
}

// 视频文件容器样式
.video-file-container {
  position: relative;
  width: 100%;
  height: 100%;

  .video-delete-btn {
    display: none; // 默认隐藏
    position: absolute;
    top: 5px;
    right: 5px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 0, 0, 0.8);
      transform: scale(1.1);
    }

    .el-icon {
      font-size: 12px;
    }
  }

  // 悬停时显示删除按钮
  &:hover .video-delete-btn {
    display: flex;
  }
}
</style>