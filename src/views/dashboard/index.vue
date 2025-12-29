<template>
  <div class="dashboard-container">
    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <!-- 农场地块卡片 -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">农场地块</div>
            <div class="stat-value">
              <span class="value-number">{{ farmPlotTotal }}</span>
              <span class="value-unit">个</span>
            </div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#409eff">
              <MapLocation />
            </el-icon>
          </div>
        </div>
      </div>
        <!-- 轮作计划 -->
        <div class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">农场轮作计划</div>
            <div class="stat-value">
              <span class="value-number">{{ cropRotationTotal }}</span>
              <span class="value-unit">条</span>
            </div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#e6a23c">
              <Farm />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 农场面积卡片 -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">农场面积</div>
            <div class="stat-value">
              <span class="value-number">{{ farmAreaTotal }}</span>
              <span class="value-unit">亩</span>
            </div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#67c23a">
              <Farm />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 农场种类卡片 -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-label">农场种类</div>
            <div class="stat-value">
              <span class="value-number">{{ categoryTotal }}</span>
              <span class="value-unit">种</span>
            </div>
          </div>
          <div class="stat-icon">
            <el-icon :size="48" color="#e6a23c">
              <User />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计图表区域 - 任务统计和种植作物统计在同一行 -->
    <div class="charts-container">
      <!-- 任务统计区域 -->
      <div class="task-stat-card">
        <div class="task-stat-header">
          <h3>任务统计</h3>
        </div>
        <div class="task-stat-content">
          <!-- 使用 ECharts 绘制任务饼状图 -->
          <div class="task-pie-wrapper">
            <!-- 饼图容器 -->
            <div ref="taskPieChartRef" class="task-pie-chart"></div>
            <!-- 中心总任务文案 -->
            <div class="progress-text">
              <div class="progress-total">{{ taskTotal }}</div>
              <div class="progress-label">总任务</div>
            </div>
          </div>

          <!-- 状态卡片 -->
          <div class="task-status-cards">
            <div class="task-status-card">
              <div class="status-icon unprocessed-icon">
                <el-icon :size="24">
                  <Document />
                </el-icon>
              </div>
              <div class="status-info">
                <div class="status-label">未处理</div>
                <div class="status-value">{{ unprocessedCount }}</div>
              </div>
            </div>

            <div class="task-status-card">
              <div class="status-icon processed-icon">
                <el-icon :size="24">
                  <Check />
                </el-icon>
              </div>
              <div class="status-info">
                <div class="status-label">已处理</div>
                <div class="status-value">{{ processedCount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 种植作物统计柱状图 -->
      <div class="crop-stat-card">
        <div class="crop-stat-header">
          <h3>种植作物统计</h3>
        </div>
        <div class="crop-stat-content">
          <!-- 柱状图容器 -->
          <div class="bar-chart-wrapper">
            <svg class="bar-chart" :viewBox="`0 0 ${chartWidth} ${chartHeight}`">
              <!-- Y轴网格线 -->
              <g class="grid-lines">
                <line
                  v-for="(line, index) in gridLines"
                  :key="index"
                  :x1="padding"
                  :y1="line.y"
                  :x2="chartWidth - padding"
                  :y2="line.y"
                  stroke="#e4e7ed"
                  stroke-width="1"
                  stroke-dasharray="2,2"
                />
              </g>
              <!-- Y轴标签 -->
              <g class="y-axis-labels">
                <text
                  v-for="(label, index) in yAxisLabels"
                  :key="index"
                  :x="padding - 10"
                  :y="label.y"
                  text-anchor="end"
                  fill="#909399"
                  font-size="12"
                  alignment-baseline="middle"
                >
                  {{ label.value }}
                </text>
              </g>
              <!-- 柱状图 -->
              <g class="bars">
                <g
                  v-for="(item, index) in cropData"
                  :key="index"
                  class="bar-group"
                  :transform="`translate(${getBarX(index)}, 0)`"
                >
                  <!-- 柱状条 -->
                  <rect
                    class="bar"
                    :x="0"
                    :y="getBarY(item.count)"
                    :width="barWidth"
                    :height="getBarHeight(item.count)"
                    :fill="getBarColor(index)"
                    rx="4"
                    @mouseenter="handleBarHover(index, true)"
                    @mouseleave="handleBarHover(index, false)"
                    :class="{ 'bar-hover': hoveredBarIndex === index }"
                  >
                    <title>{{ item.name }}: {{ item.count }}条</title>
                  </rect>
                  <!-- X轴标签（作物名称） -->
                  <text
                    :x="barWidth / 2"
                    :y="chartHeight - padding + 20"
                    text-anchor="middle"
                    fill="#303133"
                    font-size="12"
                    class="x-axis-label"
                  >
                    {{ item.name }}
                  </text>
                </g>
              </g>
            </svg>
            <!-- Tooltip 覆盖层 - 使用绝对定位覆盖在柱状图上 -->
            <div class="bar-tooltip-overlays">
              <el-tooltip
                v-for="(item, index) in cropData"
                :key="`tooltip-${index}`"
                :content="`${item.name}: ${item.count}条`"
                placement="bottom"
                effect="dark"
              >
                <div
                  class="bar-tooltip-overlay"
                  :style="{
                    left: `${(getBarX(index) / chartWidth) * 100}%`,
                    width: `${(barWidth / chartWidth) * 100}%`,
                    height: `${(getBarHeight(item.count) / chartHeight) * 100}%`,
                    bottom: `${(padding / chartHeight) * 100}%`
                  }"
                  @mouseenter="handleBarHover(index, true)"
                  @mouseleave="handleBarHover(index, false)"
                ></div>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { farmPlotList } from '@/api/farmPlotApi'
import { classManagementList } from '@/api/classManagementApi'
import { farmTaskList, type FarmTaskItem } from '@/api/farmTaskApi'
import { cropRotationList } from '@/api/cropRotationApi'
import { Grid, Menu,MagicStick, User, Document, Check } from '@element-plus/icons-vue'
import * as echarts from 'echarts' // 引入 ECharts 用于绘制饼状图

// 统计数据
const farmPlotTotal = ref<number>(0) // 农场地块总数
const farmAreaTotal = ref<number>(0) // 农场面积总和
const categoryTotal = ref<number>(0) // 农场种类总数
const cropRotationTotal = ref<number>(0) // 农场轮作计划总数

// 任务统计数据
const taskTotal = ref<number>(0) // 总任务数
const unprocessedCount = ref<number>(0) // 未处理任务数
const processedCount = ref<number>(0) // 已处理任务数

// 任务饼状图相关引用
const taskPieChartRef = ref<HTMLDivElement | null>(null) // 饼图 DOM 容器
// 这里不强依赖 ECharts 的详细类型，用 any 即可，避免 TS 对命名空间的校验错误
let taskPieChart: any = null // 饼图实例

// 种植作物统计数据
interface CropDataItem {
  name: string // 作物名称
  count: number // 数量
}
const cropData = ref<CropDataItem[]>([]) // 种植作物统计数据
const hoveredBarIndex = ref<number>(-1) // 当前悬浮的柱状图索引

// 柱状图配置
const chartWidth = 600 // 图表宽度
const chartHeight = 300 // 图表高度
const padding = 60 // 内边距
const barWidth = 60 // 柱状图宽度
const barGap = 40 // 柱状图之间的间距

// 获取农场地块数据
const fetchFarmPlotData = async () => {
  try {
    const response = await farmPlotList.listfarmPlot()
    if (response) {
      farmPlotTotal.value = response.total || 0
      // 取第一个地块的 farmplotCount 作为农场总面积
      if (response.records && response.records.length > 0) {
        farmAreaTotal.value = response.records[0].farmplotCount || 0
      }
      
      // 处理种植作物统计数据
      processCropData(response.records || [])
    }
  } catch (error) {
    console.error('获取农场地块数据失败:', error)
  }
}

/**
 * 处理种植作物数据，按 farmplotZuowu 分组统计
 * @param records 地块数据列表
 */
const processCropData = (records: any[]) => {
  // 使用 Map 来统计每种作物的数量
  const cropMap = new Map<string, number>()
  
  records.forEach((record) => {
    const cropName = record.farmplotZuowu || '未知作物'
    // 如果该作物已存在，数量加1；否则初始化为1
    cropMap.set(cropName, (cropMap.get(cropName) || 0) + 1)
  })
  
  // 转换为数组格式，用于柱状图显示
  cropData.value = Array.from(cropMap.entries()).map(([name, count]) => ({
    name,
    count
  }))
}

// 获取农场种类数据
const fetchCategoryData = async () => {
  try {
    const response = await classManagementList.listclassManagement()
    if (response) {
      categoryTotal.value = response.total || 0
    }
  } catch (error) {
    console.error('获取农场种类数据失败:', error)
  }
}

// 获取农场轮作计划数据
const fetchCropRotationData = async () => {
  try {
    const response = await cropRotationList.listcropRotation()
    if (response) {
      cropRotationTotal.value = response.total || 0
    }
  } catch (error) {
    console.error('获取农场轮作计划数据失败:', error)
  }
}

// 获取任务数据
const fetchTaskData = async () => {
  try {
    const response = await farmTaskList.listfarmTask()
    if (response && response.records) {
      taskTotal.value = response.total || 0
      
      // 统计各状态任务数
      let unprocessed = 0
      let processed = 0
      
      response.records.forEach((task: FarmTaskItem) => {
        const status = task.status
        
        // 已处理：status 为 "1"
        if (status === '1') {
          processed++
        }
        // 未处理：status 为 "0" 或 null
        else {
          unprocessed++
        }
      })
      
      unprocessedCount.value = unprocessed
      processedCount.value = processed

      // 每次获取到任务数据后更新饼状图
      updateTaskPieChart()
    }
  } catch (error) {
    console.error('获取任务数据失败:', error)
  }
}

/**
 * 初始化或更新任务饼状图
 * 使用 ECharts 绘制一个只有红色（未处理）和绿色（已处理）两部分的环形图，不再显示灰色背景
 */
const updateTaskPieChart = () => {
  // DOM 未准备好时直接返回
  if (!taskPieChartRef.value) return

  // 首次调用时初始化图表实例
  if (!taskPieChart) {
    taskPieChart = echarts.init(taskPieChartRef.value)

    // 在窗口大小变化时自适应饼状图大小
    window.addEventListener('resize', () => {
      taskPieChart && taskPieChart.resize()
    })
  }

  // 构造饼图数据，只有两类：未处理、已处理
  const pieData = [
    {
      name: '未处理',
      value: unprocessedCount.value,
      itemStyle: { color: '#f56c6c' } // 红色
    },
    {
      name: '已处理',
      value: processedCount.value,
      itemStyle: { color: '#67c23a' } // 绿色
    }
  ]

  const option: any = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 条 ({d}%)'
    },
    series: [
      {
        name: '任务统计',
        type: 'pie',
        radius: ['65%', '90%'], // 内外半径，形成环形
        avoidLabelOverlap: false,
        label: {
          show: false // 图上不显示文字，中心自己写“总任务”
        },
        labelLine: {
          show: false
        },
        data: pieData,
        // 禁用选中放大，保持简洁
        selectedMode: false
      }
    ]
  }

  taskPieChart.setOption(option)
}

// 柱状图计算属性
/**
 * 计算Y轴的最大值（向上取整到最近的5的倍数）
 */
const maxYValue = computed(() => {
  if (cropData.value.length === 0) return 10
  const maxCount = Math.max(...cropData.value.map(item => item.count))
  return Math.ceil(maxCount / 5) * 5 || 10
})

/**
 * 计算Y轴刻度标签
 */
const yAxisLabels = computed(() => {
  const labels: { y: number; value: number }[] = []
  const step = maxYValue.value / 5 // 分为5个刻度
  for (let i = 0; i <= 5; i++) {
    const value = step * i
    const y = chartHeight - padding - (value / maxYValue.value) * (chartHeight - padding * 2)
    labels.push({ y, value })
  }
  return labels
})

/**
 * 计算网格线位置
 */
const gridLines = computed(() => {
  return yAxisLabels.value.map(label => ({ y: label.y }))
})

/**
 * 获取柱状图的X坐标
 * @param index 柱状图索引
 */
const getBarX = (index: number) => {
  return padding + index * (barWidth + barGap)
}

/**
 * 获取柱状图的Y坐标（柱状图顶部位置）
 * @param count 数量
 */
const getBarY = (count: number) => {
  const height = getBarHeight(count)
  return chartHeight - padding - height
}

/**
 * 获取柱状图的高度
 * @param count 数量
 */
const getBarHeight = (count: number) => {
  const availableHeight = chartHeight - padding * 2
  return (count / maxYValue.value) * availableHeight
}

/**
 * 获取柱状图的颜色（根据索引循环使用颜色）
 * @param index 索引
 */
const getBarColor = (index: number) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  return colors[index % colors.length]
}

/**
 * 处理柱状图悬浮事件
 * @param index 柱状图索引
 * @param isHover 是否悬浮
 */
const handleBarHover = (index: number, isHover: boolean) => {
  hoveredBarIndex.value = isHover ? index : -1
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchFarmPlotData(),
    fetchCategoryData(),
    fetchTaskData(),
    fetchCropRotationData()
  ])
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

.stat-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.value-number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.value-unit {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
}


.change-text {
  color: #67c23a;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}

/* 统计图表容器 - 任务统计和种植作物统计在同一行 */
.charts-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
  align-items: flex-start;
}

/* 任务统计卡片和种植作物统计卡片各占一半 */
.task-stat-card,
.crop-stat-card {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.task-stat-header,
.crop-stat-header {
  margin-bottom: 24px;
}

.task-stat-header h3,
.crop-stat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.task-stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 400px;
}

.crop-stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 400px;
}

/* 任务饼状图容器 */
.task-pie-wrapper {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.task-pie-chart {
  width: 220px;   /* 饼图宽度 */
  height: 220px;  /* 饼图高度 */
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-total {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #909399;
}

/* 状态卡片 */
.task-status-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
}

.task-status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.task-status-card:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon.unprocessed-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.status-icon.processed-icon {
  background: #f0f9ff;
  color: #67c23a;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.status-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.status-change {
  font-size: 12px;
  color: #67c23a;
}

/* 响应式布局 */
/* 柱状图样式 */
.bar-chart-wrapper {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

.bar-chart {
  width: 100%;
  height: 300px;
  display: block;
}

.bar {
  transition: all 0.3s ease;
  cursor: pointer;
}

.bar:hover,
.bar.bar-hover {
  opacity: 0.8;
  filter: brightness(1.2);
  transform: scaleY(1.05);
  transform-origin: bottom;
}

.bar-tooltip-overlays {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bar-tooltip-overlay {
  position: absolute;
  cursor: pointer;
  pointer-events: auto;
  background: transparent;
  z-index: 10;
}

.x-axis-label {
  user-select: none;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .charts-container {
    flex-direction: column;
  }
  
  .task-stat-content {
    flex-direction: column;
    align-items: center;
  }
  
  .task-status-cards {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .task-statistics {
    width: 100%;
  }
  
  .task-status-cards {
    grid-template-columns: 1fr;
  }
}
</style>
