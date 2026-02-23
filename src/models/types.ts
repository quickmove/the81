// 版本状态
export type VersionStatus = 'planning' | 'in_progress' | 'released' | 'archived';

// 任务状态
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

// 优先级
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// 版本模型
export interface Version {
  id: string;
  versionNumber: string;
  name: string;
  description: string;
  startDate: Date;
  targetDate: Date;
  status: VersionStatus;
  parentVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 任务模型
export interface Task {
  id: string;
  title: string;
  description: string;
  versionId: string;
  status: TaskStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee?: string;
  dependencies: string[];
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// 看板列模型
export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  order: number;
}

// 看板配置
export interface KanbanConfig {
  columns: KanbanColumn[];
  versionId?: string;
}

// 甘特图任务（用于 frappe-gantt）
export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
  custom_class?: string;
}

// 筛选条件
export interface TaskFilter {
  versionId?: string;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  tags?: string[];
}
