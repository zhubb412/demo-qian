<template>
    <!-- 状态选择器组件：使用 Popover 实现下拉选择功能 -->
    <el-popover
        placement="bottom-start"
        width="150"
        trigger="manual"
        v-model:visible="visible"
        popper-class="message-popover"
    >
        <!-- 下拉选项列表 -->
        <ul class="group" @click.stop>
            <!-- 遍历状态选项列表，显示"未处理"和"已处理"两个选项 -->
            <li
                class="radio"
                :class="{active: item.value === activeIndex}"
                v-for="item in dataList"
                :key="item.value"
                @click="select(item)"
            >{{item.label}}</li>
        </ul>
        
        <!-- 触发器：显示当前选中状态的区域 -->
        <template #reference>
            <div class="radioSelect" :style="{cursor:disabled?'not-allowed':'pointer'}" @click="handleClick">
                <div style="display:flex;align-items:center;height:100%">
                    <!-- 状态图标：根据选中状态显示不同颜色和图标（红色/绿色） -->
                    <div class="icon" :style="{background:color,borderColor:color}">
                        <el-icon :size="20" color="#fff">
                            <component :is="activeIcon"></component>
                        </el-icon>
                    </div>
                    <!-- 状态文本：显示当前状态名称和标签 -->
                    <span class="title">
                        <!-- 显示状态名称（未处理/已处理） -->
                        <div>{{activeName}}</div>
                        <!-- 插槽：允许父组件传入自定义标签 -->
                        <div><slot></slot></div>
                    </span>
                    <!-- 清除按钮：点击可清空选择 -->
                    <div class="del">
                        <el-icon v-if="!disabled" @click.stop="clear"><Close /></el-icon>
                    </div>
                </div>
            </div>
        </template>
    </el-popover>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Minus, Check, Close } from '@element-plus/icons-vue'

/**
 * 组件 Props 定义
 */
const props = defineProps({
    // v-model 绑定的值，支持字符串或数字类型（"0" 表示未处理，"1" 表示已处理）
    modelValue: {
        type: [Number, String],
        default: null
    },
    // 是否禁用组件
    disabled: {
        default: false,
        type: Boolean
    },
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['update:modelValue', 'change'])

/**
 * 响应式状态变量
 */
const visible = ref(false)        // 控制下拉框的显示/隐藏
const activeIndex = ref(null)     // 当前选中项的值（用于高亮显示）
const activeName = ref('--')       // 当前选中项的显示文本
const activeIcon = ref(Minus)      // 当前选中项的图标组件
const color = ref('#70B4E0')       // 当前选中项的颜色（默认灰色）

/**
 * 状态选项列表（固定只有两个选项）
 * - 未处理：value="0"，红色图标 #F71653，使用 Minus 图标
 * - 已处理：value="1"，绿色图标 #13ce66，使用 Check 图标
 */
const dataList = computed(() => [
    {label: "未处理", activeIcon: Minus, color: "#F71653", value: "0"},
    {label: "已处理", activeIcon: Check, color: "#13ce66", value: "1"},
])

/**
 * 选择状态项的处理函数
 * @param {Object} data - 选中的状态项数据对象，包含 label、value、color、activeIcon 等属性
 */
const select = (data) => {
    // 更新当前选中项的值（用于高亮显示）
    activeIndex.value = data.value
    // 更新显示的文本（"未处理" 或 "已处理"）
    activeName.value = data.label
    // 更新图标颜色（红色 #F71653 或绿色 #13ce66）
    color.value = data.color
    // 更新图标类型（Minus 减号图标 或 Check 对勾图标）
    activeIcon.value = data.activeIcon
    // 更新父组件的 v-model 值（实现双向绑定）
    emit('update:modelValue', data.value)
    // 关闭下拉选择框
    visible.value = false
    // 如果值发生了变化，触发 change 事件通知父组件
    if (props.modelValue != data.value) {
        emit('change', data.value)
    }
}

/**
 * 监听 modelValue 的变化
 * 当父组件传入的状态值发生变化时，自动更新组件显示
 */
watch(() => props.modelValue, (val) => {
    // 如果值为空，直接返回
    if (val === null || val === undefined) {
        return
    }
    // 将值转换为字符串进行匹配（兼容数字和字符串类型）
    const normalizedVal = String(val)
    // 在选项列表中查找匹配的项
    const matchedItem = dataList.value.find(item => String(item.value) === normalizedVal)
    // 如果找到匹配项，更新组件显示
    if (matchedItem) {
        select(matchedItem)
    }
}, { immediate: true })  // immediate: true 表示组件初始化时立即执行一次

/**
 * 组件挂载后，添加全局点击事件监听
 * 当用户点击组件外部区域时，自动关闭下拉框
 */
onMounted(() => {
    document.addEventListener('mouseup', e => {
        const dom1 = document.querySelector('.radioSelect')
        if (dom1) {
            // 如果点击的不是组件内部区域，则关闭下拉框
            if (!dom1.contains(e.target)) {
                visible.value = false
            }
        }
    })
})

/**
 * 清空选择：将状态重置为默认值
 * 点击清除按钮时调用
 */
const clear = () => {
    const data = {
        value: null,           // 清空值
        label: "--",           // 显示默认文本
        color: "#70B4E0",     // 默认灰色
        activeIcon: Minus     // 默认减号图标
    }
    select(data)
}

/**
 * 点击触发器区域时的处理函数
 * 打开下拉选择框（如果组件未禁用）
 */
const handleClick = () => {
    if (!props.disabled) {
        visible.value = true
    }
}
</script>

<style>
.message-popover{
  padding: 0 !important;
}
</style>

<style scoped>
.radioSelect{
    margin-top: 14px;
    cursor: pointer;
    user-select: none;
    height: 50px;
    display: flex;
    align-items: center;
}
.radioSelect .icon{
    width: 35px;
    height: 35px;
    border-radius: 50%;
    margin-right:10px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.radioSelect .icon i{
    font-size: 20px;
}
.radioSelect .el-avatar{
    margin-right: 10px;
    font-size: 20px;
}
.radioSelect .title{
    user-select: none;
    color: #aaa;
    width: 70px;
    height:40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.radioSelect .title div{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.radioSelect .title div:first-of-type{
    color: #666;
    font-size:16px;
}
.radioSelect .title div:last-of-type{
    color: #999;
    font-size:12px;
}
.radioSelect .del{
    width: 20px;
    height: 100%;
    display: flex;
    align-items: center;
}
.radioSelect .del .el-icon{
    visibility: hidden;
    cursor: pointer;
}
.radioSelect:hover .del .el-icon{
    visibility:visible;
}
.radioSelect:hover .del .el-icon:hover{
    color:red;
}
.group :deep(){
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 200px;
    overflow:auto;
}
.group :deep() .radio{
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 35px;
    line-height: 35px;
    padding: 0 10px;
    box-sizing: border-box;
}
.group :deep() .radio:hover{
    background: #eee;
}
.empty{
    text-align: center;
}
</style>