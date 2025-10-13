# demo-qian

农场地块信息与作物轮作管理系统的设计与实现-客户端

## 项目介绍

这是一个基于Vue 3 + TypeScript + Vite构建的农场地块信息与作物轮作管理系统客户端。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus (UI组件库)
- Axios (HTTP请求)

## 项目结构

```
src/
├── api/           # API接口
├── router/        # 路由配置
├── types/         # 类型定义
├── utils/         # 工具函数
└── views/         # 页面组件
    ├── login/     # 登录页面
    ├── dashboard/ # 仪表板
    ├── classManagement/ # 班级管理
    ├── settings/  # 设置页面
    └── leftNavigation/ # 左侧导航
```

## 开发环境设置

### 推荐IDE

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (禁用Vetur)

### 项目安装

```sh
npm install
```

### 开发环境运行

```sh
npm run dev
```

### 生产环境构建

```sh
npm run build
```

## 功能特性

- 用户登录注册
- 班级管理
- 仪表板展示
- 系统设置
- 响应式设计
