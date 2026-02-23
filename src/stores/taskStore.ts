import { create } from 'zustand';
import type { Task, TaskStatus, TaskFilter } from '../models/types';
import { taskDB } from '../db/database';

interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
  
  // 操作
  loadTasks: () => Promise<void>;
  loadTasksByVersion: (versionId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  applyFilter: () => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  isLoading: false,
  error: null,
  filter: {},

  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskDB.getAll();
      set({ tasks, filteredTasks: tasks, isLoading: false });
    } catch (err) {
      set({ error: '加载任务失败', isLoading: false });
    }
  },

  loadTasksByVersion: async (versionId) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = versionId 
        ? await taskDB.getByVersion(versionId)
        : await taskDB.getAll();
      set({ tasks, filteredTasks: tasks, isLoading: false });
    } catch (err) {
      set({ error: '加载任务失败', isLoading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      await taskDB.add(taskData);
      await get().loadTasks();
    } catch (err) {
      set({ error: '添加任务失败' });
    }
  },

  updateTask: async (id, changes) => {
    try {
      await taskDB.update(id, changes);
      await get().loadTasks();
    } catch (err) {
      set({ error: '更新任务失败' });
    }
  },

  deleteTask: async (id) => {
    try {
      await taskDB.delete(id);
      await get().loadTasks();
    } catch (err) {
      set({ error: '删除任务失败' });
    }
  },

  moveTask: async (taskId, newStatus, newOrder) => {
    try {
      await taskDB.updateOrder(taskId, newOrder, newStatus);
      await get().loadTasks();
    } catch (err) {
      set({ error: '移动任务失败' });
    }
  },

  setFilter: (filter) => {
    set({ filter });
    get().applyFilter();
  },

  applyFilter: () => {
    const { tasks, filter } = get();
    let filtered = [...tasks];

    if (filter.versionId) {
      filtered = filtered.filter(t => t.versionId === filter.versionId);
    }
    if (filter.status) {
      filtered = filtered.filter(t => t.status === filter.status);
    }
    if (filter.priority) {
      filtered = filtered.filter(t => t.priority === filter.priority);
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search)
      );
    }
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(t => 
        filter.tags!.some(tag => t.tags.includes(tag))
      );
    }

    set({ filteredTasks: filtered });
  },

  getTasksByStatus: (status) => {
    return get().filteredTasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);
  }
}));
