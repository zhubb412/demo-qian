<template>
    <div class="gantt-container">
        <div class="search">
            <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="100px">
                <el-form-item label="任务名称" prop="taskName">
                    <el-input v-model="queryParams.taskName" placeholder="请输入任务名称" clearable size="small" style="width: 220px"
                        @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="计划开始日期" prop="psr">
                    <el-date-picker size="small" v-model="queryParams.psr" type="daterange" range-separator="-"
                        start-placeholder="时间范围开始" value-format="YYYY-MM-DD" end-placeholder="时间范围结束">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="small" @click="handleQuery">
                        <el-icon>
                            <Search />
                        </el-icon>搜索
                    </el-button>
                    <el-button size="small" @click="resetQuery">
                        <el-icon>
                            <Refresh />
                        </el-icon>重置
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table">
            <div class="task-list" v-loading="loading">
                <el-empty v-if="!loading && taskList.length === 0" description="暂无任务数据" :image-size="100"></el-empty>
                <el-card v-for="task in taskList" :key="String(task.taskId)" class="task-card" shadow="always">
                    <div class="task-content">
                        <div class="task-main">
                            <div class="task-name">
                                {{ task.farmtaskName }}
                            </div>
                            <div class="task-info">
                                <span class="info-item" v-if="task.responsiblePersonName">
                                    负责人：{{ task.responsiblePersonName }}
                                </span>
                                <span class="info-item" v-if="task.taskRen">
                                    任务人：{{ task.taskRen }}
                                </span>
                            </div>
                        </div>

                        <div class="task-actions">
                            <div class="action-buttons">
                                <el-button 
                                    size="small" 
                                    type="primary" 
                                    plain 
                                    @click="handleTask(task.taskId)" 
                                    v-if="!tableBorder">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>任务处理
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>

                <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getList" />
            </div>
        </div>

        <el-dialog
            v-model="showTaskDetailDialog"
            title="编辑任务"
            width="65%"
            top="5vh"
            append-to-body
            :close-on-click-modal="true"   
        >
            <TaskDetail
                v-if="showTaskDetailDialog"
                :taskId="taskId"
                :oprType="oprType"
                :key="taskId"
                @close="showTaskDetailDialog = false"
                @updated="onTaskUpdated"
            />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Edit } from '@element-plus/icons-vue'
import TaskDetail from '../TaskDetail/index.vue'
import { farmTaskList } from '@/api/farmTaskApi'
import type { FarmTaskDTOItem } from '@/api/farmTaskApi'

const emit = defineEmits(['updated'])

// 查询参数类型定义
interface QueryParams {
    pageNum: number
    pageSize: number
    taskName: string | null
    batchId: number | null
    psr: string[]
    planStart: string | null
    planFinish: string | null
}

// Props定义
const props = defineProps({
    batchId: {
        type: Number,
        default: null
    },
    tableBorder: {
        type: Boolean,
        default: false
    },
    hasHarvestRecord: { // 新增
        type: Boolean,
        default: false
    }
})

// 响应式状态
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const taskList = ref<FarmTaskDTOItem[]>([])
const queryFormRef = ref()
const taskId = ref<number | null>(null)
const oprType = ref<'add' | 'update' | null>(null)
const showTaskDetailDialog = ref(false)

// 查询参数
const queryParams = reactive<QueryParams>({
    pageNum: 1,
    pageSize: 10,
    taskName: null,
    batchId: props.batchId,
    psr: [],
    planStart: null,
    planFinish: null
})


// 获取任务列表
const getList = async () => {
    if (!props.batchId) {
        taskList.value = []
        total.value = 0
        return
    }
    
    loading.value = true
    try {
        // 处理日期范围参数
        if (queryParams.psr?.length === 2) {
            [queryParams.planStart, queryParams.planFinish] = queryParams.psr
        } else {
            queryParams.planStart = null
            queryParams.planFinish = null
        }
        
        // 获取任务数据
        const res = await farmTaskList.RenWuDTO(props.batchId)
        
        // 提取数据 - 支持 records/data/数组 格式
        const rawData = (res as any)?.records || (res as any)?.data || res || []
        const data = Array.isArray(rawData) ? rawData : []
        
        // 过滤数据 - 根据任务名称进行过滤
        let tasks = data.filter((task: FarmTaskDTOItem) => 
            !queryParams.taskName || task.farmtaskName?.includes(queryParams.taskName!)
        )
        taskList.value = tasks
        total.value = (res as any)?.total || tasks.length
    } catch (error) {
        console.error('获取任务列表失败:', error)
        ElMessage.error('获取任务列表失败')
        taskList.value = []
        total.value = 0
    } finally {
        loading.value = false
    }
}

// 搜索按钮操作
const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
}

// 重置按钮操作
const resetQuery = () => {
    queryParams.taskName = null
    queryParams.psr = []
    queryParams.planStart = null
    queryParams.planFinish = null
    handleQuery()
}

// 处理任务按钮
const handleTask = (taskIdParam: number) => {
    //根据taskId查询任务
    const task = taskList.value.find(t => t.taskId === taskIdParam);
    if (!task) {
        ElMessage.error('未找到对应任务')
        return
    }
    if (!taskIdParam) {
        ElMessage.error('任务ID无效')
        return
    }
    taskId.value = taskIdParam;
    oprType.value = 'update';
    showTaskDetailDialog.value = true;
}

// 监听batchId变化
watch(() => props.batchId, (newVal) => {
    queryParams.batchId = newVal
    getList()
}, { immediate: false })

// 初始化
onMounted(() => {
    if (props.batchId) {
        getList()
    }
})

// 处理任务更新
const onTaskUpdated = () => {
    getList()
}
</script>

<style scoped>
.gantt-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.gantt-container .search {
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    flex-shrink: 0;
}

.gantt-container .table {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.gantt-container .table .task-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-height: 0;
    overflow: auto;
}

.gantt-container .table .task-list .task-card {
    margin: 0;
    background: white;
    border-radius: 8px;
    padding: 24px 12px;
    min-height: 70px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

.gantt-container .table .task-list .task-card .task-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}

.gantt-container .table .task-list .task-card .task-content .task-main {
    flex: 1;
    min-width: 0;
}

.gantt-container .table .task-list .task-card .task-content .task-main .task-name {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.gantt-container .table .task-list .task-card .task-content .task-main .task-info {
    display: flex;
    gap: 24px;
}

.gantt-container .table .task-list .task-card .task-content .task-main .task-info .info-item {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #666;
    white-space: nowrap;
}

.gantt-container .table .task-list .task-card .task-content .task-main .task-info .info-item .el-icon {
    color: #409EFF;
    margin-right: 8px;
    font-size: 14px;
}

.gantt-container .table .task-list .task-card .task-content .task-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
}

.gantt-container .table .task-list .task-card .task-content .task-actions .action-buttons {
    display: flex;
    gap: 8px;
}

.gantt-container .table .task-list .task-card .task-content .task-actions .action-buttons .el-button {
    padding: 5px 10px;
    height: 28px;
    font-size: 12px;
}

.pagination-container {
    height: 50px;
}

.search :deep(.el-form-item__label) {
    color: #222 !important;
    font-size: 14px;
}

.search :v-deep(.el-form-item) {
    margin-bottom: 0;
    min-height: 30px;
    align-items: center;
}

.search :deep(.el-input__wrapper),
.search :deep(.el-date-editor) {
    min-height: 35px;
    font-size: 15px;
}

.search :deep(.el-input__inner),
.search :deep(.el-range-input) {
    font-size: 13px;
}

:deep(.el-tag.el-tag--success) {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67c23a;
}

:deep(.el-card.is-always-shadow) {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

@media screen and (max-width: 1400px) {
    .el-col {
        width: 33.33% !important;
    }
}

@media screen and (max-width: 1200px) {
    .el-col {
        width: 50% !important;
    }
}

@media screen and (max-width: 768px) {
    .el-col {
        width: 100% !important;
    }

    .task-content {
        flex-direction: column;
        align-items: flex-start !important;
    }

    .task-content .task-info {
        flex-direction: column;
        gap: 8px !important;
    }

    .task-content .task-actions {
        width: 100%;
        margin-top: 12px;
        justify-content: flex-end;
    }
}

.search :deep(.el-button) {
    height: 30px;
    line-height: 30px;
    font-size: 13px;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>