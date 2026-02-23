import { useEffect, useRef, useState, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Gantt from 'frappe-gantt';
import { GanttToolbar } from './GanttToolbar';
import { GanttTaskItem } from './GanttTaskItem';
import { TaskModal } from '../../components/Modals/TaskModal';
import { useVersionStore } from '../../stores/versionStore';
import { useTaskStore } from '../../stores/taskStore';
import type { Task } from '../../models/types';
import '../../../node_modules/frappe-gantt/dist/frappe-gantt.css';

export function InteractiveGantt() {
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstance = useRef<Gantt | null>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  const { versions, selectedVersionId, selectVersion } = useVersionStore();
  const { tasks, updateTask, addTask, deleteTask } = useTaskStore();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingDependency, setIsCreatingDependency] = useState(false);
  const [dependencySource, setDependencySource] = useState<string | null>(null);

  // 过滤和排序任务
  const getFilteredTasks = useCallback(() => {
    let filtered = tasks;

    // 按版本过滤
    if (selectedVersionId) {
      filtered = filtered.filter(t => t.versionId === selectedVersionId);
    }

    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => a.order - b.order);
  }, [tasks, selectedVersionId, searchQuery]);

  const filteredTasks = getFilteredTasks();

  // 使用 ref 来跟踪状态
  const isCreatingDependencyRef = useRef(isCreatingDependency);
  const dependencySourceRef = useRef(dependencySource);
  const tasksRef = useRef(tasks);
  const updateTaskRef = useRef(updateTask);

  useEffect(() => {
    isCreatingDependencyRef.current = isCreatingDependency;
    dependencySourceRef.current = dependencySource;
    tasksRef.current = tasks;
    updateTaskRef.current = updateTask;
  }, [isCreatingDependency, dependencySource, tasks, updateTask]);

  // 甘特图初始化和更新 - 统一管理
  useEffect(() => {
    if (!ganttRef.current) return;

    // 如果已经有实例，先清理
    if (ganttInstance.current && ganttRef.current) {
      ganttRef.current.innerHTML = '';
      ganttInstance.current = null;
    }

    // 只有有数据时才创建
    if (filteredTasks.length > 0) {
      const ganttTasks = filteredTasks.map(task => ({
        id: task.id,
        name: task.title,
        start: task.startDate.toISOString().split('T')[0],
        end: task.endDate.toISOString().split('T')[0],
        progress: task.progress,
        dependencies: task.dependencies.join(','),
        custom_class: selectedTaskIds.includes(task.id) ? `selected-${task.priority}` : `priority-${task.priority}`
      }));

      ganttInstance.current = new Gantt(ganttRef.current, ganttTasks, {
        view_mode: 'Day',
        date_format: 'YYYY-MM-DD',
        language: 'zh',
        on_click: (ganttTask: any) => {
          const task = tasksRef.current.find(t => t.id === ganttTask.id);
          if (task) {
            if (isCreatingDependencyRef.current && dependencySourceRef.current && dependencySourceRef.current !== task.id) {
              handleLinkTasks(dependencySourceRef.current, task.id);
              setIsCreatingDependency(false);
              setDependencySource(null);
            } else {
              handleSelectTask(task.id, false);
            }
          }
        },
        on_date_change: (task: any, start: string, end: string) => {
          updateTaskRef.current(task.id, {
            startDate: new Date(start),
            endDate: new Date(end)
          });
        },
        on_progress_change: (task: any, progress: number) => {
          updateTaskRef.current(task.id, { progress });
        }
      });
    }

    // 清理函数
    return () => {
      if (ganttInstance.current && ganttRef.current) {
        ganttRef.current.innerHTML = '';
        ganttInstance.current = null;
      }
    };
  }, [filteredTasks, selectedTaskIds]);

  // 选择任务
  const handleSelectTask = (taskId: string, isCtrlClick: boolean) => {
    if (isCtrlClick) {
      setSelectedTaskIds(prev =>
        prev.includes(taskId)
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      );
    } else {
      setSelectedTaskIds(prev =>
        prev.length === 1 && prev[0] === taskId ? [] : [taskId]
      );
    }
  };

  // 编辑任务
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(taskId);
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedTaskIds.length} 个任务吗？`)) {
      selectedTaskIds.forEach(id => deleteTask(id));
      setSelectedTaskIds([]);
    }
  };

  // 复制任务
  const handleDuplicateTask = (task: Task) => {
    addTask({
      title: `${task.title} (复制)`,
      description: task.description,
      versionId: task.versionId,
      status: 'todo',
      priority: task.priority,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 0,
      dependencies: [],
      tags: [...task.tags],
      order: tasks.length
    });
  };

  // 创建依赖关系
  const handleLinkTasks = (fromId: string, toId: string) => {
    const targetTask = tasks.find(t => t.id === toId);
    if (targetTask && !targetTask.dependencies.includes(fromId)) {
      updateTask(toId, {
        dependencies: [...targetTask.dependencies, fromId]
      });
    }
  };

  // 解除依赖
  const handleUnlinkTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { dependencies: [] });
    }
  };

  // 批量建立依赖
  const handleBatchLink = () => {
    if (selectedTaskIds.length >= 2) {
      // 第一个任务依赖其他所有任务
      const [targetId, ...depIds] = selectedTaskIds;
      const targetTask = tasks.find(t => t.id === targetId);
      if (targetTask) {
        const newDeps = [...new Set([...targetTask.dependencies, ...depIds])];
        updateTask(targetId, { dependencies: newDeps });
      }
      setSelectedTaskIds([]);
    }
  };

  // 添加新任务
  const handleAddTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  // 保存任务
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
    } else {
      addTask({
        ...taskData,
        order: tasks.length
      });
    }
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  // 搜索过滤
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Container fluid className="py-2">
      <GanttToolbar
        versions={versions}
        selectedVersionId={selectedVersionId}
        onVersionChange={selectVersion}
        onAddTask={handleAddTask}
        onSearch={handleSearch}
        selectedTasks={selectedTaskIds}
        onBatchDelete={handleBatchDelete}
        onBatchLink={handleBatchLink}
      />

      {isCreatingDependency && (
        <div className="alert alert-info mb-3 d-flex align-items-center justify-content-between">
          <span>
            <strong>依赖模式：</strong> 点击另一个任务以建立依赖关系
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setIsCreatingDependency(false);
              setDependencySource(null);
            }}
          >
            取消
          </button>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="card-gradient p-5 text-center">
          <div className="mb-3" style={{ fontSize: '4rem', opacity: 0.5 }}>📊</div>
          <h5 className="mb-2" style={{ color: 'var(--text-primary)' }}>
            {searchQuery ? '没有找到匹配的任务' : '暂无任务数据'}
          </h5>
          <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
            {searchQuery ? '请尝试其他搜索词' : '点击下方按钮创建新任务'}
          </p>
          <button className="btn-gradient" onClick={handleAddTask}>
            新建任务
          </button>
        </div>
      ) : (
        <div className="card-modern overflow-hidden" style={{ minHeight: '400px', background: 'var(--bg-card)', borderColor: '#000' }}>
          <Row className="g-0" style={{ height: '100%' }}>
            {/* 左侧任务列表 */}
            <Col xs={4} lg={3} className="border-end" style={{ background: 'var(--bg-card)', height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#000 !important' }}>
              <div className="p-2 border-bottom flex-shrink-0" style={{ background: 'var(--bg-darker)', borderColor: '#000' }}>
                <small className="fw-medium" style={{ color: 'var(--primary-gold)' }}>任务列表 ({filteredTasks.length})</small>
              </div>
              <div
                ref={taskListRef}
                className="flex-grow-1"
                style={{
                  overflowY: 'auto'
                }}
              >
                {filteredTasks.map((task, index) => (
                  <GanttTaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskIds.includes(task.id)}
                    onSelect={handleSelectTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onDuplicate={handleDuplicateTask}
                    onLinkTo={handleLinkTasks}
                    onUnlink={handleUnlinkTask}
                    allTasks={filteredTasks}
                    index={index}
                  />
                ))}
              </div>
            </Col>

            {/* 右侧甘特图 */}
            <Col xs={8} lg={9} style={{ height: '100%', padding: '10px', background: 'var(--bg-card)' }}>
              <div
                ref={ganttRef}
                className="gantt-container"
                style={{
                  width: '100%',
                  height: '100%'
                }}
                onWheel={(e) => e.preventDefault()}
              />
            </Col>
          </Row>
        </div>
      )}

      <style>{`
        /* 强制所有甘特图元素使用深色背景 */
        .gantt-container,
        .gantt-container * {
          background-color: transparent !important;
        }
        .gantt-container .gantt,
        .gantt-container .gantt * {
          fill: #16213e !important;
          background: #16213e !important;
        }
        .gantt-container {
          background: var(--bg-card) !important;
        }
        .gantt-container .gantt {
          overflow: auto;
          background: var(--bg-card) !important;
        }
        .gantt .bar-label {
          font-size: 11px;
          font-weight: 500;
          fill: #ffffff !important;
          color: #ffffff !important;
        }
        .gantt .grid-header,
        .gantt .grid-header rect,
        .gantt .grid-header-row,
        .gantt .grid-header-row rect,
        .gantt .date-picker,
        .gantt .date-picker-container,
        .gantt .calendar-header,
        .gantt .calendar-weekday {
          fill: #16213e !important;
          background: #16213e !important;
        }
        .gantt .grid-header span,
        .gantt .grid-header text,
        .gantt .date-picker-text,
        .gantt .calendar-weekday text {
          fill: #ffffff !important;
          color: #ffffff !important;
        }
        .gantt .grid-row,
        .gantt .grid-row rect {
          fill: var(--bg-card) !important;
          background: var(--bg-card) !important;
        }
        .gantt .grid-row:nth-child(even),
        .gantt .grid-row:nth-child(even) rect {
          fill: #0f3460 !important;
          background: #0f3460 !important;
        }
        .gantt .today-highlight {
          fill: rgba(184, 134, 11, 0.3);
        }
        .gantt .today-highlight text,
        .gantt .today-text,
        .gantt .today-label {
          fill: #ffffff !important;
          color: #ffffff !important;
        }
        .gantt .month-duration-text,
        .gantt .month-text,
        .gantt .calendar-month-text,
        .gantt .upper-text,
        .gantt .upper-text text {
          fill: #ffffff !important;
          color: #ffffff !important;
          font-weight: bold;
        }
        .gantt text {
          fill: #ffffff !important;
          color: #ffffff !important;
        }
        .gantt .tick {
          stroke: #586e75;
        }
        .gantt .grid-vertical-line {
          stroke: #586e75;
        }
        .gantt .grid-cell {
          fill: var(--bg-card) !important;
        }
        .gantt .day-wrapper {
          background: var(--bg-card) !important;
        }
        .gantt .holiday {
          fill: rgba(139, 0, 0, 0.3) !important;
        }
        .gantt-container svg {
          background: var(--bg-card) !important;
        }
        .gantt .popup-wrapper {
          background: var(--bg-card) !important;
          border: 2px solid #000;
        }
        .gantt .popup-wrapper .title {
          color: var(--primary-gold) !important;
        }
        .gantt .popup-wrapper .subtitle {
          color: var(--text-secondary) !important;
        }
        .gantt .popup-wrapper .date {
          color: var(--text-muted) !important;
        }
        .priority-urgent .bar, .selected-urgent .bar {
          fill: url(#gradient-urgent);
        }
        .priority-high .bar, .selected-high .bar {
          fill: url(#gradient-high);
        }
        .priority-medium .bar, .selected-medium .bar {
          fill: url(#gradient-medium);
        }
        .priority-low .bar, .selected-low .bar {
          fill: url(#gradient-low);
        }
        .gantt .bar-wrapper.selected-urgent .bar,
        .gantt .bar-wrapper.selected-high .bar,
        .gantt .bar-wrapper.selected-medium .bar,
        .gantt .bar-wrapper.selected-low .bar {
          stroke: #667eea;
          stroke-width: 3px;
          filter: drop-shadow(0 0 6px rgba(102, 126, 234, 0.5));
        }
      `}</style>

      {/* SVG 渐变定义 */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient-urgent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fa709a" />
            <stop offset="100%" stopColor="#fee140" />
          </linearGradient>
          <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f093fb" />
            <stop offset="100%" stopColor="#f5576c" />
          </linearGradient>
          <linearGradient id="gradient-medium" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4facfe" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>
          <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#11998e" />
            <stop offset="100%" stopColor="#38ef7d" />
          </linearGradient>
        </defs>
      </svg>

      <TaskModal
        show={showTaskModal}
        onHide={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        editTask={selectedTask || undefined}
        defaultVersionId={selectedVersionId || undefined}
      />
    </Container>
  );
}
