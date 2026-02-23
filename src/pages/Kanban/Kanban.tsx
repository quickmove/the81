import { useEffect, useState } from 'react';
import { Container, Badge, Button, Form } from 'react-bootstrap';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTask } from './KanbanTask';
import { TaskModal } from '../../components/Modals/TaskModal';
import { useVersionStore } from '../../stores/versionStore';
import { useTaskStore } from '../../stores/taskStore';
import type { Task, TaskStatus } from '../../models/types';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: '待办' },
  { id: 'in_progress', title: '进行中' },
  { id: 'review', title: '审核中' },
  { id: 'done', title: '已完成' }
];

export function Kanban() {
  const { versions, selectedVersionId, selectVersion, loadVersions } = useVersionStore();
  const { tasks, loadTasks, addTask, updateTask } = useTaskStore();
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  
  // 本地状态用于拖拽时的临时显示
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
    loadTasks();
  }, [loadVersions, loadTasks]);
  
  // 同步本地任务状态
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const getTasksByStatus = (status: TaskStatus) => {
    let filtered = localTasks.filter(t => t.status === status);
    if (selectedVersionId) {
      filtered = filtered.filter(t => t.versionId === selectedVersionId);
    }
    return filtered.sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = localTasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // 检查是否拖拽到列上（overId 是列 ID）
    const overColumn = COLUMNS.find(col => col.id === overId);
    
    if (overColumn && activeTask.status !== overColumn.id) {
      // 更新本地状态，实现视觉反馈
      setLocalTasks(prev => prev.map(t => 
        t.id === activeId ? { ...t, status: overColumn.id } : t
      ));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      // 如果拖拽到无效区域，恢复原始状态
      setLocalTasks(tasks);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // 确定目标列
    const overColumn = COLUMNS.find(col => col.id === overId);
    const targetStatus = overColumn ? overColumn.id : activeTask.status;
    
    // 计算新的排序
    const columnTasks = getTasksByStatus(targetStatus);
    const overTask = localTasks.find(t => t.id === overId);
    
    let newOrder = activeTask.order;
    if (overTask && overTask.id !== activeId) {
      const overIndex = columnTasks.findIndex(t => t.id === overId);
      newOrder = overIndex >= 0 ? overIndex : columnTasks.length;
    } else if (overColumn) {
      newOrder = columnTasks.length;
    }

    // 更新服务器状态
    updateTask(activeId, { 
      status: targetStatus,
      order: newOrder 
    });
  };

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setShowTaskModal(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask({ ...taskData, status: defaultStatus });
    setShowTaskModal(false);
  };

  const priorityColors = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'danger'
  };

  const priorityLabels = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  };

  const columnColors: Record<TaskStatus, string> = {
    todo: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    in_progress: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    review: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    done: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  };

  // 获取拖拽覆盖层的任务
  const getActiveTask = () => {
    if (!activeId) return null;
    return localTasks.find(t => t.id === activeId) || null;
  };

  return (
    <Container fluid className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>看板</h1>
        <Form.Select 
          style={{ width: '200px', borderRadius: 'var(--radius-md)', border: '2px solid var(--bg-secondary)' }}
          value={selectedVersionId || ''}
          onChange={(e) => selectVersion(e.target.value || null)}
        >
          <option value="">全部版本</option>
          {versions.map(v => (
            <option key={v.id} value={v.id}>{v.versionNumber}</option>
          ))}
        </Form.Select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="d-flex gap-4 overflow-auto pb-3" style={{ minHeight: '70vh' }}>
          {COLUMNS.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} style={{ minWidth: '320px', width: '320px' }}>
                <div className="kanban-column p-3">
                  <div className="kanban-column-header">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        background: columnColors[column.id]
                      }} />
                      <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{column.title}</span>
                      <Badge bg="light" text="dark" pill className="ms-2">{columnTasks.length}</Badge>
                    </div>
                    <Button 
                      variant="light" 
                      size="sm" 
                      className="border-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '28px', height: '28px', background: 'var(--bg-secondary)' }}
                      onClick={() => handleAddTask(column.id)}
                    >
                      <Plus size={16} style={{ color: 'var(--text-secondary)' }} />
                    </Button>
                  </div>
                  <SortableContext 
                    items={columnTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <KanbanColumn status={column.id}>
                      {columnTasks.map(task => (
                        <KanbanTask 
                          key={task.id} 
                          task={task}
                          priorityColor={priorityColors[task.priority]}
                          priorityLabel={priorityLabels[task.priority]}
                        />
                      ))}
                    </KanbanColumn>
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({}) }}>
          {(() => {
            const overlayTask = getActiveTask();
            return overlayTask ? (
              <KanbanTask 
                task={overlayTask}
                priorityColor={priorityColors[overlayTask.priority]}
                priorityLabel={priorityLabels[overlayTask.priority]}
                isOverlay
              />
            ) : null;
          })()}
        </DragOverlay>
      </DndContext>

      <TaskModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        defaultVersionId={selectedVersionId || undefined}
      />
    </Container>
  );
}
