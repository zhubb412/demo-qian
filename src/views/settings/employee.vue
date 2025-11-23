<template>
  <div class="employee-page">
    <el-card>
      <div class="header">
        <div class="actions">
          <el-form :inline="true" class="search-form" @submit.prevent>
            <el-form-item label="员工姓名">
              <el-input
                class="search-input"
                v-model="searchForm.userName"
                placeholder="请输入员工姓名"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table :data="userList" border stripe v-loading="loading">
        <el-table-column label="用户名" prop="userName" align="center" />
        <el-table-column label="邮箱" prop="email" align="center" width="220" />
        <el-table-column label="性别" prop="sex" align="center" width="80" />
        <el-table-column label="电话号码" prop="number" align="center" width="140" />
        <el-table-column label="入职时间" prop="createTime" align="center" width="180" />
        <el-table-column label="备注" prop="remark" align="center" />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleUpdate(row)">修改</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && userList.length === 0" description="暂无员工数据" />
    </el-card>

    <!-- 新增/编辑员工弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" @close="handleDialogClose">
      <el-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-width="100px"
        label-position="left"
        :hide-required-asterisk="true"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formModel.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formModel.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formModel.sex">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话号码" prop="number">
          <el-input v-model="formModel.number" placeholder="请输入电话号码" />
        </el-form-item>
        <el-form-item label="入职时间" prop="createTime">
          <el-date-picker
            v-model="formModel.createTime"
            type="datetime"
            placeholder="请选择入职时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formModel.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 说明：员工管理页面，支持根据姓名模糊搜索
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { sysUserList, type SysUserItem } from '@/api/sysUserApi'

// 员工列表
const userList = ref<SysUserItem[]>([])
// 加载状态
const loading = ref(false)
// 搜索表单（仅包含员工姓名）
const searchForm = ref({
  userName: ''
})
// 弹窗是否显示
const dialogVisible = ref(false)
// 弹窗标题
const dialogTitle = ref('新增员工')
// 是否为编辑模式
const isEdit = ref(false)
// 表单引用
const formRef = ref<FormInstance>()
// 表单数据
const formModel = reactive({
  id: undefined as number | undefined,
  userName: '',
  email: '',
  sex: '',
  number: '',
  createTime: '',
  remark: ''
})
// 表单校验规则
const formRules: FormRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  number: [{ required: true, message: '请输入电话号码', trigger: 'blur' }],
  createTime: [{ required: true, message: '请选择入职时间', trigger: 'change' }]
}

// 获取员工数据
const getUserList = async () => {
  loading.value = true
  try {
    // 仅当输入了姓名时才携带查询参数，实现后端模糊搜索
    const params = searchForm.value.userName
      ? { userName: searchForm.value.userName }
      : undefined
    const res = await sysUserList.listSysUser(params)
    userList.value = res.records || []
  } catch (error) {
    console.error('获取员工列表失败', error)
    ElMessage.error('获取员工列表失败，请稍后重试')
    userList.value = []
  } finally {
    loading.value = false
  }
}

// 搜索按钮：触发查询
const handleSearch = () => {
  getUserList()
}

//删除按钮
const handleDelete = (row: SysUserItem) => {
  ElMessageBox.confirm(`确认删除员工「${row.userName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await sysUserList.delete(row.id)
        ElMessage.success('删除成功')
        getUserList()
      } catch (error) {
        console.error('删除员工失败', error)
        ElMessage.error('删除失败，请稍后重试')
      }
    })
    .catch(() => {
      // 用户取消，无需处理
    })
}
// 重置按钮：清空输入并重新获取数据
const handleReset = () => {
  searchForm.value.userName = ''
  getUserList()
}

// 新增按钮：占位提示（可在此处接入新增弹窗）
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增员工'
  resetForm()
  dialogVisible.value = true
}

// 修改按钮
const handleUpdate = (row: SysUserItem) => {
  isEdit.value = true
  dialogTitle.value = '修改员工'
  resetForm()
  formModel.id = row.id
  formModel.userName = row.userName
  formModel.email = row.email
  formModel.sex = row.sex
  formModel.number = String(row.number ?? '')
  formModel.createTime = row.createTime
  formModel.remark = row.remark
  dialogVisible.value = true
}

// 提交表单（新增/修改）
const submitForm = () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      // 新增时在前端先做一次唯一性校验，避免重复提交无效请求
      if (!isEdit.value) {
        const duplicateField = (['userName', 'email', 'number'] as const).find((field) => {
          const currentValue = String(formModel[field] ?? '').trim()
          if (!currentValue) return false
          return userList.value.some((item) => String(item[field] ?? '').trim() === currentValue)
        })
        if (duplicateField) {
          const fieldLabelMap: Record<string, string> = {
            userName: '用户名',
            email: '邮箱',
            number: '电话号码'
          }
          ElMessage.warning(`${fieldLabelMap[duplicateField]}已存在，新增失败`)
          return
        }
      }

      const payload: SysUserItem = {
        id: isEdit.value ? (formModel.id as number) : 0,
        userName: formModel.userName,
        email: formModel.email,
        sex: formModel.sex,
        number: Number(formModel.number),
        createTime: formModel.createTime,
        remark: formModel.remark
      }
      if (isEdit.value) {
        await sysUserList.update(payload)
        ElMessage.success('修改成功')
      } else {
        await sysUserList.register(payload)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getUserList()
    } catch (error) {
      console.error(isEdit.value ? '修改员工失败' : '新增员工失败', error)
      ElMessage.error(`${isEdit.value ? '修改' : '新增'}员工失败，请稍后重试`)
    }
  })
}

// 重置表单内容
const resetForm = () => {
  formModel.id = undefined
  formModel.userName = ''
  formModel.email = ''
  formModel.sex = ''
  formModel.number = ''
  formModel.createTime = ''
  formModel.remark = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 弹窗关闭时重置
const handleDialogClose = () => {
  resetForm()
}

// 页面初始化时，加载员工数据
onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.employee-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.header p {
  margin: 4px 0 0;
  color: #606266;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-input {
  width: 240px;
}

.table-card {
  background: #fff;
}
</style>