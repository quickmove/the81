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
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const oldStatus = task.status;
    const oldOrder = task.order;

    // 如果状态和位置都没变，不需要重新排序
    if (oldStatus === newStatus && oldOrder === newOrder) {
      return;
    }

    // 使用事务处理排序更新
    await db.transaction('rw', db.tasks, async () => {
      // 如果移动到了新位置，需要重新计算受影响任务的 order
      const tasksToUpdate: Task[] = [];

      if (oldStatus === newStatus) {
        // 同一列内移动
        if (newOrder > oldOrder) {
          // 向下移动：将 oldOrder 和 newOrder 之间的任务 order 减 1
          const tasks = await db.tasks
            .where('status')
            .equals(newStatus)
            .filter(t => t.id !== taskId && t.order > oldOrder && t.order <= newOrder)
            .toArray();
          tasksToUpdate.push(...tasks);
        } else {
          // 向上移动：将 newOrder 和 oldOrder 之间的任务 order 加 1
          const tasks = await db.tasks
            .where('status')
            .equals(newStatus)
            .filter(t => t.id !== taskId && t.order >= newOrder && t.order < oldOrder)
            .toArray();
          tasksToUpdate.push(...tasks);
        }
      } else {
        // 跨列移动：原列目标上移，新列目标下移
        // 原列：order > oldOrder 的任务上移
        const oldColumnTasks = await db.tasks
          .where('status')
          .equals(oldStatus)
          .filter(t => t.id !== taskId && t.order > oldOrder)
          .toArray();
        tasksToUpdate.push(...oldColumnTasks);

        // 新列：order >= newOrder 的任务下移
        const newColumnTasks = await db.tasks
          .where('status')
          .equals(newStatus)
          .filter(t => t.order >= newOrder)
          .toArray();
        tasksToUpdate.push(...newColumnTasks);
      }

      // 更新移动的任务
      await db.tasks.update(taskId, {
        order: newOrder,
        status: newStatus as Task['status'],
        updatedAt: new Date()
      });

      // 更新其他受影响的任务
      for (const t of tasksToUpdate) {
        const newTaskOrder = (() => {
          if (oldStatus === newStatus) {
            if (newOrder > oldOrder) {
              return t.order - 1;
            } else {
              return t.order + 1;
            }
          } else {
            if (t.status === oldStatus) {
              return t.order - 1;
            } else {
              return t.order + 1;
            }
          }
        })();
        await db.tasks.update(t.id, { order: newTaskOrder, updatedAt: new Date() });
      }
    });
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
