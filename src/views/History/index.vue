<template>
  <div>
    <el-card>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="地块名称">
          <el-input
            v-model="queryParams.historyPlot"
            placeholder="请输入地块名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="种植作物">
          <el-input
            v-model="queryParams.historyName"
            placeholder="请输入种植作物"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table v-loading="loading" :data="historyData" border>
        <el-table-column label="种植地块" prop="historyPlot" align="center" />
        <el-table-column label="种植类型" prop="historyLx" align="center" />
        <el-table-column label="种植作物" prop="historyName" align="center" />
        <el-table-column label="种植面积(亩)" prop="historyMj" align="center" />
        <el-table-column label="产量(斤)" prop="historyChanliang" align="center" />
        <el-table-column label="种植位置" prop="historyWzhi" align="center" />
        <el-table-column label="种植成本(元)" prop="historyCb" align="center" />
        <el-table-column label="种植人" prop="historyRen" align="center" />
        <el-table-column label="种植时间" prop="historyTime" align="center" width="180" />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :hide-on-single-page="true"
        :total="total"
        :current-page="queryParams.current"
        :page-size="queryParams.size"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        style="float: right; margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { historyList, type HistoryItem } from '@/api/historyApi'
import { Delete } from '@element-plus/icons-vue'
const loading = ref(false)
const total = ref(0)
const historyData = ref<HistoryItem[]>([])

const queryParams = reactive({
  current: 1,
  size: 10,
  historyPlot: '',
  historyName: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await historyList.listHistory({
      current: queryParams.current,
      size: queryParams.size,
      //种植地块
      historyPlot: queryParams.historyPlot || undefined, 
      //种植作物
      historyName: queryParams.historyName || undefined
    })
    historyData.value = res?.records ?? []
    total.value = res?.total ?? 0
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败，请稍后重试')
    historyData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.current = 1
  getList()
}

const handleReset = () => {
  queryParams.historyPlot = ''
  queryParams.historyName = ''
  queryParams.current = 1
  getList()
}

const handleSizeChange = (val: number) => {
  queryParams.size = val
  queryParams.current = 1
  getList()
}

const handleCurrentChange = (val: number) => {
  queryParams.current = val
  getList()
}


const handleDelete = async (row: HistoryItem) => {
  try {
    await ElMessageBox.confirm(`确认删除【${row.historyPlot}】的【${row.historyName}】的历史记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await historyList.deleteHistory(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
::deep(.el-form-item__label) {
  font-weight: 500;
}
</style>

