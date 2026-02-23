import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Version } from '../models/types';
import { versionDB } from '../db/database';

interface VersionState {
  versions: Version[];
  selectedVersionId: string | null;
  isLoading: boolean;
  error: string | null;

  // 操作
  loadVersions: () => Promise<void>;
  addVersion: (version: Omit<Version, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVersion: (id: string, changes: Partial<Version>) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  selectVersion: (id: string | null) => void;
  getVersionById: (id: string) => Version | undefined;
  // 乐观更新辅助方法
  updateVersionLocally: (id: string, changes: Partial<Version>) => void;
  addVersionLocally: (version: Version) => void;
  deleteVersionLocally: (id: string) => void;
}

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      versions: [],
      selectedVersionId: null,
      isLoading: false,
      error: null,

      loadVersions: async () => {
        set({ isLoading: true, error: null });
        try {
          const versions = await versionDB.getAll();
          set({ versions, isLoading: false });
        } catch (err) {
          set({ error: '加载版本失败', isLoading: false });
        }
      },

      addVersion: async (versionData) => {
        try {
          const id = await versionDB.add(versionData);
          // 乐观更新：从数据库获取刚添加的版本（包含生成的ID）
          const newVersion = await versionDB.getById(id);
          if (newVersion) {
            get().addVersionLocally(newVersion);
          }
        } catch (err) {
          set({ error: '添加版本失败' });
        }
      },

      updateVersion: async (id, changes) => {
        try {
          await versionDB.update(id, changes);
          // 乐观更新
          get().updateVersionLocally(id, { ...changes, updatedAt: new Date() });
        } catch (err) {
          set({ error: '更新版本失败' });
        }
      },

      deleteVersion: async (id) => {
        try {
          await versionDB.delete(id);
          // 乐观更新
          get().deleteVersionLocally(id);
          if (get().selectedVersionId === id) {
            set({ selectedVersionId: null });
          }
        } catch (err) {
          set({ error: '删除版本失败' });
        }
      },

      selectVersion: (id) => {
        set({ selectedVersionId: id });
      },

      getVersionById: (id) => {
        return get().versions.find(v => v.id === id);
      },

      updateVersionLocally: (id, changes) => {
        const { versions } = get();
        const updatedVersions = versions.map(v =>
          v.id === id ? { ...v, ...changes } : v
        );
        set({ versions: updatedVersions });
      },

      addVersionLocally: (version) => {
        const { versions } = get();
        set({ versions: [...versions, version] });
      },

      deleteVersionLocally: (id) => {
        const { versions } = get();
        set({ versions: versions.filter(v => v.id !== id) });
      }
    }),
    {
      name: 'version-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedVersionId: state.selectedVersionId })
    }
  )
);
