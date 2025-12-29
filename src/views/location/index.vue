<template>
  <!-- 地图页面的容器 -->
  <div class="map-page">
    <!-- 地图工具栏 -->
    <div class="map-toolbar">
      <!-- 开始绘制区域按钮 -->
      <el-button type="primary" size="small" @click="startDrawing" :disabled="isDrawing">
        圈选区域
      </el-button>
      <!-- 清除绘制区域按钮 -->
      <el-button size="small" @click="clearSelection" :disabled="!currentPolygon">
        清除圈选
      </el-button>
      <!-- 保存绘制区域按钮 -->
      <el-button type="success" size="small" @click="saveSelection" :disabled="!canSave">
        保存圈选
      </el-button>
      <!-- 显示选中区域的信息 -->
      <div class="area-info" v-if="selectedArea > 0">
        圈选面积：{{ areaText }}
      </div>
    </div>
    <!-- 地图容器 -->
    <div id="map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'  // 引入Vue的组合式API函数
import { ElMessage } from 'element-plus'  // 引入ElMessage用于消息提示
import { locationList, type LocationItem } from '@/api/locationApi'  // 导入API和类型定义

const AMAP_KEY = '4f60b764414d4c1b34f1a4fe6378b001'  // 高德地图 API 密钥

// 定义一个自定义事件，以便外层组件（如地块管理）可以监听圈选结果
const emit = defineEmits<{
  (e: 'selectionSaved', payload: { area: number; areaMu: number; polygonPath: string }): void
}>()

declare global {
  interface Window {
    AMap?: any  // 声明全局的 AMap 对象
  }
}

const map = ref<any>(null)  // 地图实例
const markers = ref<any[]>([])  // 存储地图标记的数组
const mouseTool = ref<any>(null)  // 鼠标工具实例
const currentPolygon = ref<any>(null)  // 当前绘制的多边形
const selectedArea = ref<number>(0)  // 选中区域的面积
const isDrawing = ref(false)  // 绘制状态
const savedPolygonId = ref<number | null>(null)  // 保存的多边形ID
const polygonPathCache = ref<[number, number][]>([])  // 存储多边形路径的缓存
const DEFAULT_CENTER: [number, number] = [108.3331, 22.8292]  // 设置地图中心点（广西农业职业技术大学附近）

// 计算选中区域的显示文本
const areaText = computed(() => {
  if (!selectedArea.value) return ''  // 如果没有选中区域，返回空字符串
  const squareMeters = selectedArea.value  // 选中区域的面积（平方米）
  const mu = squareMeters / 666.667  // 将平方米转换为亩（1亩 = 666.667平方米）
  return `${squareMeters.toFixed(0)} ㎡（约 ${mu.toFixed(2)} 亩）`  // 格式化输出
})

// 判断是否可以保存
const canSave = computed(() => selectedArea.value > 0 && polygonPathCache.value.length > 2)

// 加载高德地图API
const loadAMap = () => {
  if (window.AMap) {
    return Promise.resolve(window.AMap)  // 如果已经加载，则直接返回已加载的 AMap
  }

  return new Promise((resolve, reject) => {
    // 查找已有的高德地图脚本，如果存在，则直接返回已加载的 AMap
    const existing = document.querySelector<HTMLScriptElement>('script[data-amap="true"]')
    if (existing) {
      existing.onload = () => resolve(window.AMap)  // 如果脚本已加载，解析Promise
      existing.onerror = reject  // 如果加载失败，拒绝Promise
      return
    }

    const script = document.createElement('script')  // 创建新的script标签
    //加载高德地图 JS 文件
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.ToolBar,AMap.Scale,AMap.MouseTool,AMap.GeometryUtil`
    script.async = true  // 设置为异步加载
    script.defer = true  // 设置延迟加载
    script.setAttribute('data-amap', 'true')  // 设置标识
    script.onload = () => resolve(window.AMap)  // 加载成功
    script.onerror = reject  // 加载失败
    document.body.appendChild(script)  // 将script添加到文档中
  })
}

// 移除当前多边形
const removeCurrentPolygon = () => {
  if (!currentPolygon.value) return  // 如果没有路径，清空ID
  currentPolygon.value.setMap(null)  // 移除当前多边形
  currentPolygon.value = null  // 清空当前多边形引用
}

// 添加标记到地图
const addMarker = (lng: number, lat: number) => {
  if (!map.value || !window.AMap) return  // 如果地图未加载，返回
  const marker = new window.AMap.Marker({
    position: [lng, lat],  // 设置标记位置
    offset: new window.AMap.Pixel(-9, -30)  // 设置标记偏移
  })
  marker.setMap(map.value)  // 将标记添加到地图
  markers.value.push(marker)  // 存储标记到数组
}

// 清除所有标记
const clearMarkers = () => {
  markers.value.forEach((marker) => marker.setMap(null))  // 从地图中移除所有标记
  markers.value = []  // 清空标记数组
}

// 渲染保存的多边形
const renderSavedPolygon = (records: LocationItem[]) => {
  if (!map.value || !window.AMap) return  // 如果地图未加载，返回
  const polygonRecord = records.find((item) => item.polygonPath)  // 查找有路径的记录
  if (!polygonRecord?.polygonPath) {
    savedPolygonId.value = null  // 如果没有路径，清空ID
    return
  }
  try {
    const parsedPath = JSON.parse(polygonRecord.polygonPath) as [number, number][]  // 解析多边形路径
    if (!Array.isArray(parsedPath) || parsedPath.length < 3) {
      return  // 若路径不合法，直接返回
    }
    const formattedPath = parsedPath
      .map((point) => [Number(point[0]), Number(point[1])] as [number, number])  // 格式化路径
      .filter(([lng, lat]) => !Number.isNaN(lng) && !Number.isNaN(lat))  // 过滤无效点
    if (formattedPath.length < 3) {
      return  // 若点数不足，直接返回
    }
    removeCurrentPolygon()  // 移除当前多边形
    const polygon = new window.AMap.Polygon({
      path: formattedPath,  // 设置多边形路径
      fillColor: '#409EFF',  // 填充颜色
      fillOpacity: 0.2,  // 填充透明度
      strokeColor: '#409EFF',  // 边框颜色
      strokeWeight: 2  // 边框宽度
    })
    polygon.setMap(map.value)  // 将多边形添加到地图
    currentPolygon.value = polygon  // 记录当前多边形
    polygonPathCache.value = formattedPath  // 缓存多边形路径
    selectedArea.value = Number(polygonRecord.mj) || 0  // 设置选中面积
    savedPolygonId.value = polygonRecord.id  // 记录保存的多边形ID
    map.value.setFitView([polygon])  // 缩放地图以适应多边形
  } catch (error) {
    console.error('恢复圈选区域失败:', error)  // 处理解析错误
  }
}

// 获取位置数据
const fetchLocations = async () => {
  try {
    const res = await locationList.listLocation()  // 调用API获取位置
    const fallbackData = (res as unknown as { data?: LocationItem[] })?.data || []  // 备用数据
    const records: LocationItem[] = (res?.records || fallbackData || []) as LocationItem[]  // 记录数据
    clearMarkers()  // 清除已有的标记
    records.forEach((item) => {
      const lat = Number(item.latitude)  // 获取纬度
      const lng = Number(item.longitude)  // 获取经度
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        addMarker(lng, lat)  // 添加有效的标记
      }
    })
    renderSavedPolygon(records)  // 渲染保存的多边形
  } catch (error) {
    console.error('获取位置失败:', error)  // 处理获取位置错误
    ElMessage.error('获取位置失败')  // 提示用户
  }
}

// 处理绘制完成事件
const handleDrawComplete = (event: any) => {
  isDrawing.value = false  // 设置绘制状态为结束
  mouseTool.value?.close(false)  // 关闭鼠标工具
  if (!event?.obj) return  // 检查事件对象
  removeCurrentPolygon()  // 移除当前多边形
  currentPolygon.value = event.obj  // 设置当前多边形
  const path = currentPolygon.value.getPath()  // 获取多边形路径
  polygonPathCache.value = path.map((point: any) => [point.lng, point.lat])  // 缓存路径
  if (window.AMap?.GeometryUtil) {
    // 计算圆形区域面积
    selectedArea.value = window.AMap.GeometryUtil.ringArea(path)  
    ElMessage.success('圈选完成，已计算面积')  // 提示用户
  }
}

// 开始绘制多边形
const startDrawing = () => {
  if (!mouseTool.value) return  // 检查鼠标工具是否存在
  isDrawing.value = true  // 设置绘制状态为进行中
  selectedArea.value = 0  // 重置选中区域面积
  polygonPathCache.value = []  // 清空路径缓存
  removeCurrentPolygon()  // 移除当前多边形
  mouseTool.value.polygon({  // 启动绘制多边形
    fillColor: '#409EFF',  // 填充颜色
    fillOpacity: 0.2,  // 填充透明度
    strokeColor: '#409EFF',  // 边框颜色
    strokeWeight: 2  // 边框宽度
  })
}

// 清楚当前选中的多边形
const clearSelection = async () => {
  if (savedPolygonId.value) {
    await deleteSelectionFromServer()  // 如果有保存的多边形，删除该多边形
  }
  removeCurrentPolygon()  // 移除当前多边形
  selectedArea.value = 0  // 选中区域面积重置
  polygonPathCache.value = []  // 清空路径缓存
  savedPolygonId.value = null  // 清空保存的多边形ID
}

// 保存当前选中的多边形
const saveSelection = async () => {
  if (!canSave.value) {  // 检查是否可以保存
    ElMessage.warning('请先圈选区域')  // 提示用户
    return
  }
  const [firstLng, firstLat] = polygonPathCache.value[0]  // 获取第一个顶点的经纬度
  const payload: LocationItem = {  // 构建保存的多边形数据
    id: savedPolygonId.value ?? 0,  // 使用已有ID或默认0
    latitude: String(firstLat),  // 纬度
    longitude: String(firstLng),  // 经度
    mj: Number(selectedArea.value.toFixed(0)),  // 面积（平方米）
    polygonPath: JSON.stringify(polygonPathCache.value)  // 路径字符串
  }
  try {
    await locationList.addLocation(payload)  // 调用API保存数据
    ElMessage.success('圈选区域已保存')  // 提示用户
    await fetchLocations()  // 重新获取位置数据
  } catch (error) {
    console.error('保存圈选区域失败:', error)  // 处理错误
    ElMessage.error('保存圈选区域失败')  // 提示用户
  }
  // 同步选中结果给父组件，以便更新界面
  emit('selectionSaved', {
    area: selectedArea.value,  // 面积
    areaMu: Number((selectedArea.value / 666.667).toFixed(2)),  // 面积（亩）
    polygonPath: JSON.stringify(polygonPathCache.value)  // 路径字符串
  })
}

// 从服务器删除保存的多边形
const deleteSelectionFromServer = async () => {
  if (!savedPolygonId.value) return  // 如果没有保存的ID，返回
  try {
    await locationList.deleteLocation(savedPolygonId.value)  // 调用API删除
    ElMessage.success('圈选区域已删除')  // 提示用户
  } catch (error) {
    console.error('删除圈选区域失败:', error)  // 处理错误
    ElMessage.error('删除圈选区域失败')  // 提示用户
  }
}

// 处理地图点击事件以添加新的位置
const handleMapClick = async (event: any) => {
  if (isDrawing.value || !event?.lnglat) return  // 如果正在绘制或未获取到经纬度，返回
  const { lng, lat } = event.lnglat  // 获取点击的经纬度
  const newLocation: LocationItem = {  // 构建新位置的数据
    id: 0,  // 暂时给ID为0
    latitude: String(lat),  // 纬度
    longitude: String(lng)  // 经度
  }
  try {
    await locationList.addLocation(newLocation)  // 保存新位置
    addMarker(lng, lat)  // 在地图上添加标记
    ElMessage.success('位置已保存')  // 提示用户
  } catch (error) {
    console.error('保存位置失败:', error)  // 处理错误
    ElMessage.error('保存位置失败')  // 提示用户
  }
}

// 地图初始化
const initMap = async () => {
  try {
    await loadAMap()  // 加载高德地图API
    map.value = new window.AMap.Map('map', {  // 创建地图实例
      viewMode: '3D',  // 选择3D视图
      zoom: 15,  // 设置初始缩放级别
      center: DEFAULT_CENTER  // 设置地图中心点（广西农业职业技术大学附近）
    })
    map.value.addControl(new window.AMap.ToolBar())  // 添加工具条
    map.value.addControl(new window.AMap.Scale())  // 添加比例尺
    mouseTool.value = new window.AMap.MouseTool(map.value)  // 创建鼠标工具实例
    mouseTool.value.on('draw', handleDrawComplete)  // 监听绘制完成事件
    map.value.on('click', handleMapClick)  // 监听地图点击事件
    await fetchLocations()  // 获取位置数据
  } catch (error) {
    console.error('地图初始化失败:', error)  // 处理初始化错误
    ElMessage.error('地图加载失败，请稍后重试')  // 提示用户
  }
}

// 组件挂载时初始化地图
onMounted(() => {
  initMap()  // 调用地图初始化
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  map.value?.destroy?.()  // 销毁地图实例
  map.value = null  // 清空地图引用
  markers.value = []  // 清空标记数组
  mouseTool.value = null  // 清空鼠标工具
  removeCurrentPolygon()  // 移除当前多边形
})
</script>

<style scoped>
  /* 地图样式 */
  #map {
    width: 100%;  /* 宽度100% */
    height: 520px;  /* 高度520px */
    border-radius: 12px;  /* 圆角边框 */
    background: #f0f2f5;  /* 背景色 */
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.1);  /* 阴影效果 */
  }

  /* 页面样式 */
  .map-page {
    padding: 24px;  /* 内边距 */
    background: #f5f7fa;  /* 背景色 */
    min-height: 100%;  /* 最小高度100% */
    box-sizing: border-box;  /* 调整盒模型计算方式 */
  }

  /* 工具栏样式 */
  .map-toolbar {
    display: flex;  /* 使用弹性布局 */
    align-items: center;  /* 垂直居中对齐 */
    gap: 12px;  /* 元素间距 */
    margin-bottom: 16px;  /* 下边距 */
  }

  /* 选区信息样式 */
  .area-info {
    font-size: 14px;  /* 字体大小 */
    color: #303133;  /* 字体颜色 */
  }
</style>
