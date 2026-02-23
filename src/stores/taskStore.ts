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
  // 乐观更新辅助方法
  updateTaskLocally: (id: string, changes: Partial<Task>) => void;
  addTaskLocally: (task: Task) => void;
  deleteTaskLocally: (id: string) => void;
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
      const id = await taskDB.add(taskData);
      // 乐观更新：从数据库获取刚添加的任务（包含生成的ID）
      const newTask = await taskDB.getById(id);
      if (newTask) {
        get().addTaskLocally(newTask);
      }
    } catch (err) {
      set({ error: '添加任务失败' });
    }
  },

  updateTask: async (id, changes) => {
    try {
      await taskDB.update(id, changes);
      // 乐观更新
      get().updateTaskLocally(id, { ...changes, updatedAt: new Date() });
    } catch (err) {
      set({ error: '更新任务失败' });
    }
  },

  deleteTask: async (id) => {
    try {
      await taskDB.delete(id);
      // 乐观更新
      get().deleteTaskLocally(id);
    } catch (err) {
      set({ error: '删除任务失败' });
    }
  },

  moveTask: async (taskId, newStatus, newOrder) => {
    try {
      await taskDB.updateOrder(taskId, newOrder, newStatus);
      // 乐观更新
      get().updateTaskLocally(taskId, { status: newStatus, order: newOrder, updatedAt: new Date() });
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
  },

  updateTaskLocally: (id, changes) => {
    const { tasks, filter } = get();
    const updatedTasks = tasks.map(t =>
      t.id === id ? { ...t, ...changes } : t
    );
    // 同时更新 filteredTasks
    let filteredTasks = [...updatedTasks];
    if (filter.versionId) {
      filteredTasks = filteredTasks.filter(t => t.versionId === filter.versionId);
    }
    if (filter.status) {
      filteredTasks = filteredTasks.filter(t => t.status === filter.status);
    }
    if (filter.priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === filter.priority);
    }
    set({ tasks: updatedTasks, filteredTasks });
  },

  addTaskLocally: (task) => {
    const { tasks, filter } = get();
    const newTasks = [...tasks, task];
    // 根据当前筛选条件决定是否添加到 filteredTasks
    let shouldAdd = true;
    if (filter.versionId && task.versionId !== filter.versionId) {
      shouldAdd = false;
    }
    if (filter.status && task.status !== filter.status) {
      shouldAdd = false;
    }
    if (filter.priority && task.priority !== filter.priority) {
      shouldAdd = false;
    }
    const newFilteredTasks = shouldAdd ? [...get().filteredTasks, task] : get().filteredTasks;
    set({ tasks: newTasks, filteredTasks: newFilteredTasks });
  },

  deleteTaskLocally: (id) => {
    const { tasks, filteredTasks } = get();
    const newTasks = tasks.filter(t => t.id !== id);
    const newFilteredTasks = filteredTasks.filter(t => t.id !== id);
    set({ tasks: newTasks, filteredTasks: newFilteredTasks });
  }
}));
