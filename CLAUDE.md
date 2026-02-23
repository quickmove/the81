# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 React + TypeScript + Vite 的任务管理应用，提供版本管理、看板视图和甘特图视图功能。数据存储在浏览器本地 IndexedDB 中，支持离线使用。

## Tech Stack

- **框架**: React 19 + TypeScript + Vite 7
- **状态管理**: Zustand (持久化到 localStorage)
- **本地数据库**: Dexie (IndexedDB 封装)
- **UI 组件**: Bootstrap 5 + react-bootstrap
- **路由**: react-router-dom
- **拖拽**: @dnd-kit/core + @dnd-kit/sortable
- **图表**: frappe-gantt
- **图标**: lucide-react

## Common Commands

```bash
# 启动开发服务器 (热更新)
npm run dev

# 构建生产版本
npm run build

# 运行 ESLint 检查
npm run lint

# 预览生产构建
npm run preview
```

## Architecture

### 数据流

```
Pages → Zustand Stores → Dexie DB → IndexedDB
                ↑
         localStorage (持久化选中的版本ID)
```

### 核心模块

- **src/models/types.ts**: TypeScript 类型定义 (Version, Task, KanbanColumn, GanttTask)
- **src/db/database.ts**: Dexie 数据库实例和 CRUD 操作
- **src/stores/**: Zustand 状态管理
  - `versionStore.ts`: 版本管理 (支持持久化 selectedVersionId)
  - `taskStore.ts`: 任务管理 (支持筛选、排序、拖拽移动)
- **src/pages/**: 页面组件
  - `Dashboard/`: 概览页面
  - `Versions/`: 版本管理
  - `Kanban/`: 看板视图 (使用 @dnd-kit 实现拖拽)
  - `Gantt/`: 甘特图 (使用 frappe-gantt)
- **src/components/**: 公共组件
  - `Modals/`: TaskModal, VersionModal
  - `Layout/`: 布局组件

### 路由

| 路径 | 页面 |
|------|------|
| `/` | Dashboard |
| `/versions` | 版本管理 |
| `/gantt` | 甘特图 |
| `/kanban` | 看板 |

### 数据模型关系

- Version (版本) 1:N Task (任务)
- Task 有状态 (todo/in_progress/review/done)、优先级 (low/medium/high/urgent)
- 看板列配置存储在 kanbanColumns 表，支持自定义
