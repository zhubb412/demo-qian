<template>
  <div class="app-container-gray">
    <el-row class="box">
      <el-col :span="4" class="left">
        <search-menu 
          title="地块种植任务" 
          :fun="fetchFarmPlotList"    
          search-parma="farmplotName" 
          search-placeholder="请输入地块名称" 
          key-name="farmplotId" 
          label-name="farmplotName"
          :active-menu="{
            isActive: true,
            name: 'farmplotId',
            value: ''
          }"
          @select="handleFarmPlotSelect" 
        />
      </el-col>
      <el-col :span="20" class="right">
        <template v-if="currentFarmplotId">
          <renwuchuli :batch-id="currentFarmplotId"></renwuchuli>
        </template>
        <el-empty v-else description="暂无地块任务"></el-empty>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import renwuchuli from './renwuchuli.vue'
import SearchMenu from '@/views/SearchMenu/index.vue'
import { farmPlotList } from '@/api/farmPlotApi'

// 响应式状态
const currentFarmplotId = ref(null)

// 获取地块列表
const fetchFarmPlotList = async (params = {}) => {
  try {
    //调用查询方法，传入farmplotName参数进行搜索，同时传入分页参数
    const res = await farmPlotList.listfarmPlot({ 
      current: params.pageNum || 1, 
      size: params.pageSize || 16,
      farmplotName: params.farmplotName || undefined
    })
    //返回结果，rows为地块列表，total为总条数
    return {
      rows: res.records || [],
      total: res.total || 0
    }
  } catch (error) {
    ElMessage.error('获取地块列表失败')
    return { rows: [], total: 0 }
  }
}

// 初始化默认选择第一个地块
const initDefaultSelection = async () => {
  //调用查询方法，传入空对象，获取第一页的数据
  const res = await fetchFarmPlotList()
  //如果地块列表不为空，则选中第一个地块
  if (res.rows?.length > 0) {
    currentFarmplotId.value = Number(res.rows[0].farmplotId)
  }
}

// 处理地块选择
const handleFarmPlotSelect = (selectedFarmPlot) => {
  //选中地块后，设置当前地块ID
  currentFarmplotId.value = Number(selectedFarmPlot.farmplotId)
}

// 组件挂载时初始化
onMounted(() => {
  initDefaultSelection()
})
</script>

<style scoped>
.box {
  padding: 15px;
  height: calc(100vh - 84px);
}

.left {
  background: #fff;
  border-radius: 10px 0 0 10px;
  height: 100%;
  overflow: hidden;
}

.right {
  background: #fff;
  height: 100%;
  border-radius: 0 10px 10px 0;
  border-left: 1px solid #eee;
  padding: 0 15px;
  overflow: auto;
}

.right .el-empty {
  margin-top: 200px;
}
</style>
