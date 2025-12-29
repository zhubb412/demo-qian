<template>
  <div>
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="售卖作物名称" prop="sellName">
          <el-input
            v-model="queryParams.sellName"
            placeholder="请输入售卖作物名称"
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
      <el-table v-loading="loading" :data="sellList" border>
        <el-table-column label="售卖作物名称" align="center" prop="sellName" />
        <el-table-column label="售卖价格(元/斤)" align="center" prop="sellJiage" />
        <el-table-column label="售卖总额(元)" align="center" prop="sellAge" />
        <el-table-column label="售卖人" align="center" prop="sellRen" />
        <el-table-column label="售卖时间" align="center" prop="sellTime" width="180" />
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
        style="float: right; margin-top: 20px"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px" label-position="left">
        <el-form-item label="售卖作物名称" prop="sellName">
          <el-select
            v-model="form.sellName"
            placeholder="请选择售卖作物名称"
            style="width: 100%"
            clearable
            @change="handleHarvestChange"
          >
            <el-option
              v-for="item in filteredHarvestList"
              :key="item.id"
              :label="item.className"
              :value="item.className"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="售卖价格(元/斤)" prop="sellJiage">
          <el-input
            v-model="form.sellJiage"
            placeholder="请输入售卖价格"
            @input="handlePriceInput"
          >
            <template #append>元/斤</template>
          </el-input>
        </el-form-item>
        <el-form-item label="售卖总额(元)" prop="sellAge">
          <el-input
            v-model="form.sellAge"
            placeholder="由系统根据售卖价格自动计算"
            disabled
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="售卖人" prop="sellRen">
          <el-select
            v-model="form.sellRen"
            placeholder="请选择售卖人"
            style="width: 100%"
            clearable
            @change="handleUserChange"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.userName"
              :value="user.userName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="售卖时间" prop="sellTime">
          <el-date-picker
            v-model="form.sellTime"
            type="datetime"
            placeholder="请选择售卖时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
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

const sellList = ref<SellItem[]>([])
const harvestList = ref<HarvestItem[]>([]) // 收获记录列表
const filteredHarvestList = ref<HarvestItem[]>([]) // 过滤后的收获记录列表（排除已售卖的）
const userList = ref<SysUserItem[]>([]) // 用户列表
const open = ref(false)
const loading = ref(false)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const formRef = ref<FormInstance>()
const lastValidPrice = ref('') // 存储上一次有效的价格值

const queryParams = reactive({
  current: 1,
  size: 10,
  sellName: ''
})

const form = reactive({
  id: undefined,
  sellId: undefined,
  sellName: '',
  sellJiage: '',
  sellAge: '',
  sellRen: '',
  sellRenId: undefined,
  sellStatus: '0', // 默认未售卖
  sellTime: ''
} as any)

const rules = reactive({
  sellName: [{ required: true, message: '售卖作物名称不能为空', trigger: 'blur' }],
  sellJiage: [
    { required: true, message: '售卖价格不能为空', trigger: 'blur' },
    { 
      pattern: /^\d+(\.\d{1,2})?$/, 
      message: '请输入有效的价格（最多两位小数）', 
      trigger: 'blur' 
    }
  ],
  sellAge: [{ required: true, message: '售卖总额不能为空', trigger: 'blur' }],
  sellRen: [{ required: true, message: '售卖人不能为空', trigger: 'blur' }],
  sellTime: [{ required: true, message: '售卖时间不能为空', trigger: 'change' }]
})

/**
 * 获取售卖列表
 */
const getList = async () => {
  loading.value = true
  try {
    const res = await SellItemApi.getSellItemList(queryParams)
    sellList.value = res.records || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取售卖列表失败:', error)
    ElMessage.error('获取售卖列表失败')
    sellList.value = []
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
 * 重置按钮操作
 */
const handleReset = () => {
  queryParams.sellName = ''
  queryParams.current = 1
  if (queryRef.value) queryRef.value.resetFields()
  getList()
}

/**
 * 获取收获记录列表并过滤已售卖的记录
 */
const getHarvestList = async () => {
  try {
    // 获取所有收获记录
    const res = await HarvestItemApi.getHarvestItemList({
      current: 1,
      size: 1000 // 获取所有数据
    })
    harvestList.value = res.records || []
    
    // 获取所有售卖记录，找出已售卖的记录（sellStatus 为 '1'）
    try {
      const sellRes = await SellItemApi.getSellItemList({
        current: 1,
        size: 1000 // 获取所有售卖记录
      })
      const soldRecords = (sellRes.records || []).filter(item => item.sellStatus === '1')
      // 获取已售卖的收获记录 ID 列表
      const soldHarvestIds = soldRecords.map(item => item.sellId)
      
      // 过滤掉已售卖的收获记录
      filteredHarvestList.value = harvestList.value.filter(
        item => !soldHarvestIds.includes(item.id)
      )
    } catch (error) {
      console.error('获取售卖记录失败:', error)
      // 如果获取售卖记录失败，显示所有收获记录
      filteredHarvestList.value = harvestList.value
    }
  } catch (error) {
    console.error('获取收获记录列表失败:', error)
    ElMessage.error('获取收获记录列表失败')
    harvestList.value = []
    filteredHarvestList.value = []
  }
}

/**
 * 获取用户列表
 */
const getUserList = async () => {
  try {
    const res = await sysUserList.listSysUser({
      current: 1,
      size: 1000
    })
    userList.value = res.records || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
    userList.value = []
  }
}

/**
 * 处理价格输入，只允许数字和小数点
 */
const handlePriceInput = (value: string) => {
  // 只允许数字和小数点，最多两位小数
  const regex = /^\d*\.?\d{0,2}$/
  if (regex.test(value)) {
    // 如果符合格式，更新值和上次有效值
    form.sellJiage = value
    lastValidPrice.value = value
    // 触发计算
    calculateSellAge()
  } else {
    // 如果不符合格式，恢复为上次的有效值
    form.sellJiage = lastValidPrice.value
  }
}

/**
 * 计算售卖总额
 * 售卖总额 = 售卖价格 × 作物斤数
 */
const calculateSellAge = () => {
  // 如果售卖价格为空或未选择收获记录，清空总额
  if (!form.sellJiage || !form.sellName) {
    form.sellAge = ''
    return
  }
  
  // 根据选择的 sellName 找到对应的收获记录（从过滤后的列表中查找）
  const selectedHarvest = filteredHarvestList.value.find(item => item.className === form.sellName) || 
                          harvestList.value.find(item => item.className === form.sellName)
  if (selectedHarvest && selectedHarvest.classWeight) {
    // 计算：售卖总额 = 售卖价格 × 作物斤数
    const price = parseFloat(form.sellJiage) || 0
    const weight = parseFloat(selectedHarvest.classWeight) || 0
    const total = price * weight
    // 保留两位小数
    form.sellAge = total.toFixed(2)
  } else {
    form.sellAge = ''
  }
}

/**
 * 收获记录选择变化处理
 */
const handleHarvestChange = (className: string) => {
  // 根据选择的 className 找到对应的收获记录（从过滤后的列表中查找）
  const selectedHarvest = filteredHarvestList.value.find(item => item.className === className) ||
                          harvestList.value.find(item => item.className === className)
  if (selectedHarvest) {
    // 设置 sellId 为选中项的 id
    form.sellId = selectedHarvest.id
    // v-model 已经绑定了 sellName，这里确保一致性
    form.sellName = selectedHarvest.className
    // 重新计算售卖总额
    calculateSellAge()
  } else {
    // 清空选择时，清空 sellId 和总额
    form.sellId = undefined
    form.sellAge = ''
  }
}

/**
 * 用户选择变化处理
 */
const handleUserChange = (userName: string) => {
  // 根据选择的 userName 找到对应的用户
  const selectedUser = userList.value.find(item => item.userName === userName)
  if (selectedUser) {
    // 设置 sellRenId 为选中项的 id
    form.sellRenId = selectedUser.id
    // v-model 已经绑定了 sellRen，这里确保一致性
    form.sellRen = selectedUser.userName
  } else {
    // 清空选择时，清空 sellRenId
    form.sellRenId = undefined
  }
}

/**
 * 新增按钮操作
 */
const handleAdd = async () => {
  // 打开对话框前先获取收获记录列表和用户列表
  await Promise.all([getHarvestList(), getUserList()])
  Object.assign(form, {
    id: undefined,
    sellId: undefined,
    sellName: '',
    sellJiage: '',
    sellAge: '',
    sellRen: '',
    sellRenId: undefined,
    sellStatus: '0', // 默认未售卖
    sellTime: ''
  })
  lastValidPrice.value = '' // 重置上次有效价格
  open.value = true
  title.value = '新增售卖记录'
}

/**
 * 修改按钮操作
 */
const handleUpdate = async (row: SellItem) => {
  // 打开对话框前先获取收获记录列表和用户列表
  await Promise.all([getHarvestList(), getUserList()])
  
  // 编辑时，需要包含当前正在编辑的收获记录（即使它已被标记为已售卖）
  // 所以需要将当前记录的收获记录也加入到过滤后的列表中
  const currentHarvest = harvestList.value.find(item => item.id === row.sellId)
  if (currentHarvest) {
    // 如果当前收获记录不在过滤后的列表中，添加它
    const exists = filteredHarvestList.value.find(item => item.id === currentHarvest.id)
    if (!exists) {
      filteredHarvestList.value.push(currentHarvest)
    }
  }
  
  Object.assign(form, {
    id: row.id,
    sellId: row.sellId,
    sellName: row.sellName,
    sellJiage: row.sellJiage?.toString() || '', // 转换为字符串（后端返回的是 number）
    sellAge: row.sellAge?.toString() || '', // 转换为字符串（后端返回的是 number）
    sellRen: row.sellRen,
    sellRenId: row.sellRenId,
    sellStatus: row.sellStatus || '0',
    sellTime: row.sellTime
  })
  lastValidPrice.value = row.sellJiage?.toString() || '' // 设置上次有效价格为当前值
  open.value = true
  title.value = '修改售卖记录'
}

/**
 * 删除按钮操作
 */
const handleDelete = async (row: SellItem) => {
  try {
    await ElMessageBox.confirm(`是否确认删除售卖记录"${row.sellName}"？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    try {
      await SellItemApi.deleteSellItem(row.id)
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
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const isEdit = form.id && form.id > 0
        
        // 确保售卖总额已计算（如果还未计算）
        if (!form.sellAge && form.sellJiage && form.sellName) {
          calculateSellAge()
        }
        
        // 构建提交数据，确保价格和总额转换为数字类型（后端是 double 类型）
        const submitData: any = {
          sellName: form.sellName,
          sellJiage: parseFloat(form.sellJiage) || 0, // 转换为数字类型
          sellAge: parseFloat(form.sellAge) || 0, // 转换为数字类型
          sellRen: form.sellRen,
          sellTime: form.sellTime,
          sellId: form.sellId, // 始终包含 sellId（来自选中的收获记录 id）
          sellRenId: form.sellRenId, // 始终包含 sellRenId（来自选中的用户 id）
          sellStatus: isEdit ? form.sellStatus : '1' // 新增时设置为1（已售卖），编辑时保持原值
        }

        // 编辑模式才添加 id（id 是主键自增，新增时不应发送）
        if (isEdit) {
          submitData.id = form.id
        }

        if (isEdit) {
          // 编辑
          await SellItemApi.updateSellItem(submitData as SellItem)
          ElMessage.success('修改成功')
        } else {
          // 新增（不包含 id，因为 id 是主键自增）
          await SellItemApi.addSellItem(submitData as SellItem)
          ElMessage.success('新增成功')
          // 新增成功后，重新获取收获记录列表以更新过滤后的列表
          await getHarvestList()
        }
        open.value = false
        getList()
      } catch (error: any) {
        console.error('操作失败:', error)
        ElMessage.error(`操作失败: ${error.response?.data?.msg || error.message || '请重试'}`)
      }
    }
  })
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
}

/**
 * 每页条数改变
 */
const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.current = 1
  getList()
}

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  queryParams.current = page
  getList()
}

// 注意：价格输入已通过 handlePriceInput 处理，这里不再需要 watch

// 组件挂载时获取列表数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  white-space: nowrap;
  text-align: left;
  padding-right: 12px;
}

:deep(.el-dialog .el-form-item) {
  margin-bottom: 22px;
}
</style>

