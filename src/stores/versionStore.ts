import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Version } from '../models/types';
import { versionDB, initDefaultKanbanColumns } from '../db/database';

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
          await initDefaultKanbanColumns();
          const versions = await versionDB.getAll();
          set({ versions, isLoading: false });
        } catch (err) {
          set({ error: '加载版本失败', isLoading: false });
        }
      },

      addVersion: async (versionData) => {
        try {
          await versionDB.add(versionData);
          const versions = await versionDB.getAll();
          set({ versions });
        } catch (err) {
          set({ error: '添加版本失败' });
        }
      },

      updateVersion: async (id, changes) => {
        try {
          await versionDB.update(id, changes);
          const versions = await versionDB.getAll();
          set({ versions });
        } catch (err) {
          set({ error: '更新版本失败' });
        }
      },

      deleteVersion: async (id) => {
        try {
          await versionDB.delete(id);
          const versions = await versionDB.getAll();
          set({ versions });
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
      }
    }),
    {
      name: 'version-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedVersionId: state.selectedVersionId })
    }
  )
);
