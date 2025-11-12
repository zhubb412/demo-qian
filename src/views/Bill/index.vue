<template>
  <div>
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="地块名称" prop="farmplotName">
          <el-input
            v-model="queryParams.sellName"
            placeholder="请输入地块名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="盈利状态" prop="farmplotName">
          <el-input
            v-model="queryParams.sellName"
            placeholder="请输入盈利状态"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" :icon="Plus" @click="handleAdd" plain>新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table v-loading="loading" :data="billListData" border>
        <el-table-column label="种植地块" align="center" prop="billName" />
        <el-table-column label="种植作物" align="center" prop="billZuowu" />
        <el-table-column label="种类使用量价格" align="center" prop="classAge" />
        <el-table-column label="地块使用量价格" align="center" prop="farmAge" />
        <!-- 显示农资使用量价格：使用账单中的 materialAge 字段（由接口 usePlotzj 映射而来） -->
        <el-table-column label="农资使用量价格" align="center" prop="materialAge" />
        <el-table-column label="收获总价" align="center" prop="harvestAge" />
        <el-table-column label="种植总成本" align="center" prop="billAge" />
        <el-table-column label="盈利亏损状况" align="center">
          <template #default="{ row }">
            <span>{{ formatProfitStatus(row.billYli) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="售卖人" align="center" prop="billRen" />
        <el-table-column label="售卖时间" align="center" prop="billTime" width="180" />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleUpdate(row)">修改</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :hide-on-single-page="true"
        :total="total"
        :current-page="queryParams.current"
        :page-size="queryParams.size"
        @size-change=""
        @current-change=""
        layout="total, sizes, prev, pager, next, jumper"
        style="float: right; margin-top: 20px"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form"  label-width="120px">
        <el-form-item label="种植地块" prop="billName">
          <el-select
            v-model="form.billName"
            placeholder="请选择种植地块"
            style="width: 100%"
            clearable
            @change="handleFarmPlotChange"
          >
            <el-option
              v-for="item in farmPlotOptions"
              :key="item.farmplotId"
              :label="item.farmplotName"
              :value="item.farmplotName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="种植作物" prop="billZuowu">
          <el-input
            v-model="form.billZuowu"
            placeholder="选择地块后自动填充"
            disabled
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { SellItemApi, type SellItem } from '@/api/sellApi'
import { HarvestItemApi, type HarvestItem } from '@/api/harvestApi'
import { sysUserList, type SysUserItem } from '@/api/sysUserApi'
import { farmPlotList, type FarmPlotItem } from '@/api/farmPlotApi'
import { billList, type BillItem } from '@/api/billApi'
// 引入农资使用接口，用于根据地块ID(farmId)获取对应地块的农资使用统计
import { MaterialUseItemApi } from '@/api/materialUseApi'

const sellList = ref<SellItem[]>([])
const billListData = ref<BillItem[]>([]) // 账单列表
const harvestList = ref<HarvestItem[]>([]) // 收获记录列表
const filteredHarvestList = ref<HarvestItem[]>([]) // 过滤后的收获记录列表（排除已售卖的）
const userList = ref<SysUserItem[]>([]) // 用户列表
const farmPlotListData = ref<FarmPlotItem[]>([]) // 地块列表
const farmPlotOptions = ref<FarmPlotItem[]>([]) // 地块下拉选项
const cropOptions = ref<string[]>([]) // 作物下拉选项（去重后的farmplotZuowu）
const open = ref(false)
const loading = ref(false)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const formRef = ref<FormInstance>()

const queryParams = reactive({
  current: 1,
  size: 10,
  sellName: ''
})

const form = reactive({

} as any)


/**
 * 获取地块列表
 */
const getFarmPlotList = async () => {
  try {
    const res = await farmPlotList.listfarmPlot({
      current: 1,
      size: 1000 // 获取所有数据
    })
    farmPlotListData.value = res.records || []
    farmPlotOptions.value = res.records || []
    // 提取所有作物并去重
    const crops = res.records?.map(item => item.farmplotZuowu).filter((value, index, self) => self.indexOf(value) === index) || []
    cropOptions.value = crops
  } catch (error) {
    console.error('获取地块列表失败:', error)
    ElMessage.error('获取地块列表失败')
    farmPlotListData.value = []
    farmPlotOptions.value = []
    cropOptions.value = []
  }
}

/**
 * 获取账单列表
 */
const getList = async () => {
  loading.value = true
  try {
    const res = await billList.listBill({
      current: queryParams.current,
      size: queryParams.size
    })
    billListData.value = res.records || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取账单列表失败:', error)
    ElMessage.error('获取账单列表失败')
    billListData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/**
 * 搜索按钮操作
 */
const handleQuery = () => {
  queryParams.current = 1
  getList()
}

/**
 * 盈利状况展示格式化
 */
const formatProfitStatus = (billYli: string) => {
  if (!billYli) {
    return '--'
  }
  const numericValue = Number(billYli)
  if (Number.isNaN(numericValue)) {
    return billYli
  }
  if (numericValue > 0) {
    return `盈利${billYli}`
  }
  if (numericValue < 0) {
    return `亏损${billYli}`
  }
  return billYli
}

/**
 * 重置按钮操作
 */
const handleReset = () => {
  queryParams.sellName = ''
  queryParams.current = 1
  if (queryRef.value) queryRef.value.resetFields()
  getList()
}


  

/**
 * 处理地块选择变化
 */
const handleFarmPlotChange = (farmplotName: string) => {
  if (!farmplotName) {
    // 如果清空选择，也清空相关字段
    form.billZuowu = ''
    form.farmId = undefined
    return
  }
  // 根据选择的地块名称找到对应的地块数据
  const selectedFarmPlot = farmPlotOptions.value.find(item => item.farmplotName === farmplotName)
  if (selectedFarmPlot) {
    // 自动填充种植作物
    form.billZuowu = selectedFarmPlot.farmplotZuowu
    // 将 farmplotId 赋值给 farmId
    form.farmId = selectedFarmPlot.farmplotId
  }
}

/**
 * 新增按钮操作
 */
const handleAdd = async () => {
  // 打开对话框前先获取地块列表
  await getFarmPlotList()
  // 重置表单
  Object.assign(form, {
    id: undefined,
    billName: '',
    billZuowu: '',
    farmId: undefined
  })
  open.value = true
  title.value = '新增账单'
}

/**
 * 修改按钮操作
 */
const handleUpdate = async (row: BillItem) => {
  // 打开对话框前先获取地块列表
  await getFarmPlotList()
  // 填充表单数据
  Object.assign(form, {
    id: row.id,
    billName: row.billName,
    billZuowu: row.billZuowu,
    farmId: row.farmId
  })
  open.value = true
  title.value = '修改账单'
}


/**
 * 删除按钮操作
 */
const handleDelete = async (row: BillItem) => {
  try {
    await ElMessageBox.confirm(`是否确认删除${row.billZuowu}的账单记录`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    try {
      await billList.deleteBill(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  } catch {
    // 用户取消删除
  }
}

/**
 * 提交表单
 */
const submitForm = async () => {
  try {
    const isEdit = form.id && form.id > 0
    // 新增/编辑前，确保拿到最新地块信息
    await getFarmPlotList()
    // 根据已选择的地块，取出对应的单价/总价
    const selectedById = farmPlotOptions.value.find(item => item.farmplotId === form.farmId)
    const selectedByName = farmPlotOptions.value.find(item => item.farmplotName === form.billName)
    const selectedFarm = selectedById || selectedByName
    // 获取农资使用数据并按地块过滤
    // 业务约定：
    // - getMaterialUseItemList 返回的数据中包含 plotId（地块ID）、materialId（农资ID）、usePlotzj（该地块农资使用量价格汇总）
    // - bill 表字段需求：materialAge 使用 usePlotzj；materialId 直接保存 materialUse 的 materialId
    // - bill 表的地块ID字段为 farmId，因此通过 plotId === farmId 进行匹配/过滤
    const materialUseRes = await MaterialUseItemApi.getMaterialUseItemList({
      current: 1,
      size: 1000
    })
    // 当前实现：取第一条匹配记录。如需按同地块多条汇总，可在此处累加 usePlotzj 后再赋值
    const materialUseMatch = materialUseRes?.records?.find((r: any) => Number(r.plotId) === Number(form.farmId))

    // 构建提交数据
    const parseAmount = (value: unknown) => {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    }
    const totalCost =
      parseAmount(selectedFarm?.farmplotSyzongjia) +
      parseAmount(selectedFarm?.farmplotZongjia) +
      parseAmount(materialUseMatch?.usePlotzj)

    const submitData: any = {
      billName: form.billName,
      billZuowu: form.billZuowu,
      farmId: form.farmId,
      // 将 farmplotSyzongjia 赋值给 classAge，将 farmplotZongjia 赋值给 farmAge
      classAge: selectedFarm?.farmplotSyzongjia ?? '',
      farmAge: selectedFarm ? Number(selectedFarm.farmplotZongjia) : undefined,
      // 将农资使用返回的 usePlotzj 赋值给 materialAge，将返回的 materialId 赋值给账单的 materialId
      materialAge: materialUseMatch?.usePlotzj ?? '',
      materialId: materialUseMatch?.materialId,
      billAge: totalCost.toString()
    }

    // 编辑模式才添加 id
    if (isEdit) {
      submitData.id = form.id
    }

    if (isEdit) {
      // 编辑
      await billList.updateBill(submitData as BillItem)
      ElMessage.success('修改成功')
    } else {
      // 新增
      await billList.addBill(submitData as BillItem)
      ElMessage.success('新增成功')
    }
    open.value = false
    getList()
  } catch (error: any) {
    console.error('操作失败:', error)
    ElMessage.error(`操作失败: ${error.response?.data?.msg || error.message || '请重试'}`)
  }
}

/**
 * 取消按钮操作
 */
const cancel = () => {
  open.value = false
}

/**
 * 对话框关闭时重置表单
 */
const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: undefined,
    billName: '',
    billZuowu: '',
    farmId: undefined
  })
}

// 页面加载时获取列表
onMounted(() => {
  getList()
})

</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>

