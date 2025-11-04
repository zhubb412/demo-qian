<template>
  <div>
    <el-card> 
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="queryParams.taskName" placeholder="请输入任务名称" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
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
      <el-table v-loading="loading" :data="jobList">
        <el-table-column label="任务名称" align="center" prop="taskName" />
        <el-table-column label="任务人" align="center" prop="taskRen" />
        <el-table-column label="预计开始周" align="center" prop="yjkaishiTime" />
        <el-table-column label="预计完成周" align="center" prop="yjwanchengTime" />
        <el-table-column label="操作" align="center">
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
        layout="prev, pager, next"
        style="float: right"
      />
    </el-card>

    <el-dialog :title="title" v-model="open" width="470px">
      <el-form ref="jobRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务人" prop="taskRen">
          <el-select v-model="form.taskRen" placeholder="请选择任务人" style="width: 100%">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.userName"
              :value="user.userName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预计开始周" prop="yjkaishiTime">
          <el-input v-model="form.yjkaishiTime" placeholder="请输入预计开始周" />
        </el-form-item>
        <el-form-item label="预计完成周" prop="yjwanchengTime">
          <el-input v-model="form.yjwanchengTime" placeholder="请输入预计完成周" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
  <script setup lang="ts">
import { taskClList } from '@/api/taskClApi'
import type { TaskClItem } from '@/api/taskClApi'
import { sysUserList, type SysUserItem } from '@/api/sysUserApi'
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Grid } from '@element-plus/icons-vue'

    const jobList = ref<TaskClItem[]>([])  
    const open = ref(false)                
    const loading = ref(true)              
    const total = ref(0)                   
    const title = ref('')                 
    const queryRef = ref()                 
    const jobRef = ref<FormInstance>()     
    const userList = ref<SysUserItem[]>([])

   
    const prop = defineProps({
      category: {
        type: Object,           
        default: () => ({})     
      }
    })
    
    
    //   从category对象中提取classId
    
    const classId = computed(() => prop.category?.classId)
    const form = reactive({
      taskName: '',                    
      taskRen: '',                    
      yjkaishiTime: '',                
      yjwanchengTime: '',              
      classId: classId.value          // 种类ID（关键字段，用于关联）
    } as any)
    
   
    const queryParams = reactive({
      current: 1,                      
      size: 5,                       
      taskName: '',                   
      classId: classId.value           // 种类ID（关键字段，用于API过滤）
    })
    const rules = reactive({
      taskName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
      taskRen: [{ required: true, message: '任务人不能为空', trigger: 'blur' }],
      yjkaishiTime: [{ required: true, message: '预计开始周不能为空', trigger: 'blur' }],
      yjwanchengTime: [{ required: true, message: '预计完成周不能为空', trigger: 'blur' }]
    })
  
  
    
    /**
     * 获取用户列表
     */
    const getUserList = async () => {
      try {
        const res = await sysUserList.listSysUser()
        userList.value = res.records || []
      } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
      }
    }

    /**
     * 
     * 使用queryParams中的classId来过滤特定种类的任务
     */
    const getList = async () => {
      loading.value = true
      console.log('查询参数:', queryParams)  // 调试：查看查询参数
      const res = await taskClList.listtaskCl(queryParams)
      jobList.value = res.records
      total.value = res.total
      loading.value = false
    }
  
    /**
     * 新增任务
     * 重置表单并设置classId为当前种类的ID
     */
    const handleAdd = async () => {
      // 重置表单基础字段
      Object.assign(form, { 
        taskId: undefined, 
        taskName: '', 
        taskRen: '', 
        yjkaishiTime: '', 
        yjwanchengTime: '', 
        classId: classId.value  // 关键：设置种类ID
      })
      
      open.value = true
      title.value = '添加任务'
    }
  
    /** 搜索按钮操作 */
    const handleQuery = () => {
      queryParams.current = 1
      getList()
    }

    const handleReset = () => {
      queryParams.taskName = ''
      queryParams.current = 1
      if (queryRef.value) queryRef.value.resetFields()
      getList()
    }
  
    const cancel = () => {
      open.value = false
    }
  
    /** 每页条数改变 */
    const handleSizeChange = (size: number) => {
      queryParams.size = size
      getList()
    }
  
    /** 当前页改变 */
    const handleCurrentChange = (page: number) => {
      queryParams.current = page
      getList()
    }
  
    const handleUpdate = async (row: TaskClItem) => {
      Object.assign(form, row)
      open.value = true
      title.value = '修改任务'
    }
  
    /** 提交按钮 */
    const submitForm = async () => {
      if (!jobRef.value) return
      await jobRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const submitData = { ...form }
            if (form.taskId) submitData.taskId = form.taskId
            
            console.log('表单数据:', form)
            console.log('提交数据:', submitData)
            
            // 根据是否有taskId判断是新增还是修改
            const res = form.taskId && form.taskId > 0
              ? await taskClList.edittaskCl(submitData as TaskClItem)
              : await taskClList.addtaskCl(submitData as TaskClItem)
            
            console.log('API响应:', res)
            
            // 后端直接返回数据，没有包装在BaseResult中
            if (res.data !== undefined) {
              ElMessage.success(form.taskId ? '修改成功' : '新增成功')
              open.value = false
              getList()
            } else {
              ElMessage.error('操作失败')
            }
          } catch (error: any) {
            ElMessage.error(`操作失败: ${error.response?.data?.msg || error.message}`)
          }
        }
      })
    }
  
    /** 删除按钮操作 */
    const handleDelete = async (row: any) => {
      const Tr = await ElMessageBox.confirm(`是否确认删除任务编号为"${row.taskId}"的数据项？`)
      if (Tr) {
        try {
          const res = await taskClList.deletetaskCl(row.taskId)
          console.log('删除响应:', res)
          
          // 后端直接返回数据，没有包装在BaseResult中
          if (res.data !== undefined) {
            ElMessage.success('删除成功')
            getList()
          } else {
            ElMessage.error('删除失败')
          }
        } catch (error) {
          ElMessage.error('删除失败，请重试')
        }
      }
    }
 
    watch(classId, (newClassId) => {
      console.log('classId变化:', newClassId)  // 调试：查看classId变化
      if (newClassId) {
        // 更新查询参数中的classId
        queryParams.classId = newClassId
        // 更新表单中的classId
        form.classId = newClassId
        // 重新获取任务列表
        getList()
      }
    }, { immediate: true })  // immediate: true 表示组件初始化时立即执行

    // 组件挂载时获取用户列表
    onMounted(() => {
      getUserList()
    })
  </script>
  