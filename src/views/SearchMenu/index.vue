<!-- 搜索菜单组件：用于展示可搜索的列表数据，支持分页和选择功能 -->
<template>
  <div class="search-menu">
    <!-- 标题区域 -->
    <div class="search-menu-header">{{ title }}</div>
    <div class="search-menu-body">
      <!-- 搜索输入框 -->
      <el-input
        v-model="queryParams[searchParma]"
        @input="handleInput"
        :placeholder="searchPlaceholder"
        prefix-icon="el-icon-search"
        class="search-input"
      />

      <!-- 列表展示区域 -->
      <div v-if="list.length > 0" class="batch-list" v-loading="loading">
        <el-card
          v-for="(item, index) in list"
          :key="item[keyName]"
          :class="['batch-card', { 'is-active': selectedIndex === index }]"
          @click="handleSelect(index)"
          shadow="hover"
        >
          <div class="batch-content">
            <div class="batch-main">
              <svg-icon :icon-class="icon" class="batch-icon" />
              <span class="batch-name" :title="item[labelName]">
                {{ item[labelName].length > 11 ? `${item[labelName].substring(0, 11)}...` : item[labelName] }}
              </span>
            </div>
            <!-- 自定义插槽，允许父组件添加额外的内容 -->
            <slot :data="item"></slot>
          </div>
        </el-card>
      </div>
      <!-- 空数据提示 -->
      <el-empty v-else :image-size="100" description="暂无数据"></el-empty>
    </div>
    <!-- 左侧列表数据大于8条时，显示分页区域 -->
    <div class="search-menu-footer" v-if="total > 8">
      <el-pagination
        small
        background
        layout="prev, pager, next"
        :page-size="queryParams.pageSize"
        :total="total"
        @current-change="handlePagination"
        @prev-click="handlePagination"
        @next-click="handlePagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 定义组件属性
const props = defineProps({
  // 组件标题
  title: {
    type: String,
    required: true
  },
  // 获取列表数据的函数
  fun: {
    type: Function,
    required: true
  },
  // 搜索参数名
  searchParma: {
    type: String,
    required: true
  },
  // 搜索框占位符
  searchPlaceholder: {
    type: String,
    required: true
  },
  // 列表项的唯一标识字段名
  keyName: {
    type: String,
    required: true
  },
  // 列表项显示名称的字段名
  labelName: {
    type: String,
    required: true
  },
  // 激活菜单配置
  activeMenu: {
    type: Object,
    default: () => ({
      isActive: false,
      name: '', // 属性
      value: '' // 值
    })
  },
  // 列表项图标
  icon: {
    type: String,
    default: 'land'
  },
  // 是否为子菜单
  isSub: {
    type: Boolean,
    default: false
  },
  // 子菜单图标
  subIcon: {
    type: String,
    default: 'channel'
  },
  // 子菜单唯一标识字段名
  subKeyName: String,
  // 子菜单显示名称字段名
  subLabelName: String,
  // 子菜单标签配置
  subTag: Object,
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
})

// 定义事件
const emit = defineEmits(['select'])

// 响应式状态
const loading = ref(false)
const list = ref([])
const total = ref(null)
const selectedIndex = ref(null)
const queryParams = ref({
  pageNum: 1,
  pageSize: 16,
  [props.searchParma]: null
})

// 计算属性：默认选中项
const defaultActive = computed(() => {
  const { isActive, name, value } = props.activeMenu
  if (isActive) {
    if (name && value) {
      const index = list.value.findIndex(item => item[name] === value)
      return index === -1 ? '0' : index.toString()
    }
    return '0'
  }
  return ''
})

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    if (typeof props.fun === 'function') {
      const { rows, total: totalCount } = await props.fun(queryParams.value)
      list.value = rows
      total.value = totalCount
      
      // 当列表更新时，如果有数据则选中第一项
      if (list.value && list.value.length > 0) {
        selectedIndex.value = 0
        emit('select', list.value[0])
      } else {
        selectedIndex.value = null
      }
    }
  } finally {
    loading.value = false
  }
}

// 处理列表项选择
const handleSelect = (index) => {
  selectedIndex.value = index
  if (props.isSub) {
    let childrenList = []
    list.value.forEach(item => {
      childrenList = childrenList.concat(item.children)
    })
    emit('select', childrenList.filter(item => item.channelSipId === index)[0])
  } else {
    emit('select', list.value[Number(index)])
  }
}

// 处理搜索输入
const handleInput = (value) => {
  queryParams.value[props.searchParma] = value
  queryParams.value.pageNum = 1
  getList()
}

// 处理分页变化
const handlePagination = (e) => {
  queryParams.value.pageNum = e
  getList()
}

// 组件挂载时获取数据
onMounted(async () => {
  await getList()
})
</script>

<style scoped>
.search-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.search-menu-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #f0f2f5;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.search-menu-body {
  height: calc(100vh - 84px - 56px - 50px - 30px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.search-menu-body .search-input {
  margin-bottom: 20px;
}

.search-menu-body .search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
}

.search-menu-body .search-input :deep(.el-input__wrapper:hover) {
  border-color: #409EFF;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.search-menu-body .search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.search-menu-body .batch-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.search-menu-body .batch-list::-webkit-scrollbar {
  width: 6px;
}

.search-menu-body .batch-list::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 10px;
}

.search-menu-body .batch-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
  transition: background 0.3s;
}

.search-menu-body .batch-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.search-menu-body .batch-list .batch-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-menu-body .batch-list .batch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(64, 158, 255, 0.3);
}

.search-menu-body .batch-list .batch-card.is-active {
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f7ff 100%) !important;
  border: 2px solid #409EFF !important;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2) !important;
}

.search-menu-body .batch-list .batch-card.is-active :deep(.el-card__body) {
  border: none;
}

.search-menu-body .batch-list .batch-card.is-active .batch-name {
  color: #409EFF;
  font-weight: 600;
}

.search-menu-body .batch-list .batch-card.is-active .batch-icon {
  color: #409EFF;
}

.search-menu-body .batch-list .batch-card .batch-content {
  display: flex;
  align-items: center;
}

.search-menu-body .batch-list .batch-card .batch-content .batch-main {
  display: flex;
  align-items: center;
  flex: 1;
}

.search-menu-body .batch-list .batch-card .batch-content .batch-main .batch-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #909399;
  transition: all 0.3s;
}

.search-menu-body .batch-list .batch-card:hover .batch-content .batch-main .batch-icon {
  color: #409EFF;
  transform: scale(1.1);
}

.search-menu-body .batch-list .batch-card .batch-content .batch-main .batch-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  transition: color 0.3s;
}

.search-menu-body .batch-list .batch-card:hover .batch-content .batch-main .batch-name {
  color: #409EFF;
}

.search-menu-footer {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  border-top: 2px solid #f0f2f5;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

:deep(.el-card__body) {
  padding: 16px 18px;
  border: none;
}

:deep(.el-card) {
  border: none;
  box-shadow: none !important;
}

:deep(.el-card:hover),
:deep(.el-card:focus) {
  border: none;
}

:deep(.el-pagination .el-pager li) {
  background: transparent;
  border-radius: 6px;
  transition: all 0.3s;
  margin: 0 2px;
}

:deep(.el-pagination .el-pager li.active) {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

:deep(.el-pagination .el-pager li:hover) {
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  border-radius: 6px;
  transition: all 0.3s;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}
</style>