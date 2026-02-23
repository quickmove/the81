import Dexie, { type Table } from 'dexie';
import type { Version, Task, KanbanColumn } from '../models/types';

// 兼容的 UUID 生成函数
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 降级方案
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class MyPlanDatabase extends Dexie {
  versions!: Table<Version>;
  tasks!: Table<Task>;
  kanbanColumns!: Table<KanbanColumn>;

  constructor() {
    super('MyPlanDB');
    this.version(3).stores({
      versions: '++id, versionNumber, status, parentVersionId, createdAt',
      tasks: '++id, versionId, status, priority, order, createdAt',
      kanbanColumns: 'id, status, order'
    });
  }
}

export const db = new MyPlanDatabase();

// 初始化默认看板列
export async function initDefaultKanbanColumns(): Promise<void> {
  try {
    const count = await db.kanbanColumns.count();
    if (count === 0) {
      const defaultColumns: KanbanColumn[] = [
        { id: 'col-todo', title: '待办', status: 'todo', order: 0 },
        { id: 'col-in_progress', title: '进行中', status: 'in_progress', order: 1 },
        { id: 'col-review', title: '审核中', status: 'review', order: 2 },
        { id: 'col-done', title: '已完成', status: 'done', order: 3 }
      ];
      // 使用 put 代替 bulkAdd 以避免重复键错误
      for (const col of defaultColumns) {
        await db.kanbanColumns.put(col);
      }
    }
  } catch (error) {
    console.error('初始化看板列失败:', error);
  }
}

// 版本相关操作
export const versionDB = {
  async getAll(): Promise<Version[]> {
    return await db.versions.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: string): Promise<Version | undefined> {
    return await db.versions.get(id);
  },

  async add(version: Omit<Version, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const newVersion: Version = {
      ...version,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now
    };
    return await db.versions.add(newVersion);
  },

  async update(id: string, changes: Partial<Version>): Promise<number> {
    return await db.versions.update(id, { ...changes, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await db.tasks.where('versionId').equals(id).delete();
    await db.versions.delete(id);
  }
};

// 任务相关操作
export const taskDB = {
  async getAll(): Promise<Task[]> {
    return await db.tasks.orderBy('order').toArray();
  },

  async getByVersion(versionId: string): Promise<Task[]> {
    return await db.tasks.where('versionId').equals(versionId).sortBy('order');
  },

  async getByStatus(status: string): Promise<Task[]> {
    return await db.tasks.where('status').equals(status).sortBy('order');
  },

  async getById(id: string): Promise<Task | undefined> {
    return await db.tasks.get(id);
  },

  async add(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const newTask: Task = {
      ...task,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now
    };
    return await db.tasks.add(newTask);
  },

  async update(id: string, changes: Partial<Task>): Promise<number> {
    return await db.tasks.update(id, { ...changes, updatedAt: new Date() });
  },

  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  },

  async updateOrder(taskId: string, newOrder: number, newStatus: string): Promise<void> {
    await db.tasks.update(taskId, { order: newOrder, status: newStatus as Task['status'], updatedAt: new Date() });
  }
};

// 看板列操作
export const kanbanDB = {
  async getAllColumns(): Promise<KanbanColumn[]> {
    return await db.kanbanColumns.orderBy('order').toArray();
  },

  async updateColumn(id: string, changes: Partial<KanbanColumn>): Promise<number> {
    return await db.kanbanColumns.update(id, changes);
  }
};
