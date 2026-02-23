import { useState, useRef } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { Edit2, Trash2, Link2, Unlink, Copy } from 'lucide-react';
import type { Task } from '../../models/types';

interface GanttTaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string, isCtrlClick: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onLinkTo?: (fromTaskId: string, toTaskId: string) => void;
  onUnlink?: (taskId: string) => void;
  allTasks: Task[];
  index: number;
}

export function GanttTaskItem({
  task,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onLinkTo,
  onUnlink,
  allTasks,
  index
}: GanttTaskItemProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(task.id, e.ctrlKey || e.metaKey);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleEdit = () => {
    onEdit(task);
    setShowContextMenu(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowContextMenu(false);
  };

  const handleDuplicate = () => {
    onDuplicate(task);
    setShowContextMenu(false);
  };

  const priorityColors: Record<string, string> = {
    low: '#11998e',
    medium: '#4facfe',
    high: '#f5576c',
    urgent: '#fa709a'
  };

  const statusIcons: Record<string, string> = {
    todo: '○',
    in_progress: '◐',
    review: '◑',
    done: '●'
  };

  const statusColors: Record<string, string> = {
    todo: '#94a3b8',
    in_progress: '#667eea',
    review: '#f093fb',
    done: '#11998e'
  };

  return (
    <>
      <div
        ref={rowRef}
        className={`gantt-task-item d-flex align-items-center px-3 py-2 ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'rgba(102, 126, 234, 0.1)' : index % 2 === 0 ? '#fff' : '#f8f9fa',
          borderLeft: isSelected ? '3px solid #667eea' : '3px solid transparent',
          transition: 'all 0.2s ease',
          minHeight: '38px'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa';
          }
        }}
      >
        {/* 复选框 */}
        <Form.Check
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(task.id, false);
          }}
          className="me-2"
          style={{ cursor: 'pointer' }}
        />

        {/* 状态图标 */}
        <span
          className="me-2"
          style={{
            color: statusColors[task.status],
            fontSize: '12px',
            width: '16px',
            textAlign: 'center'
          }}
        >
          {statusIcons[task.status]}
        </span>

        {/* 优先级指示条 */}
        <div
          className="me-2"
          style={{
            width: '4px',
            height: '20px',
            borderRadius: '2px',
            backgroundColor: priorityColors[task.priority]
          }}
        />

        {/* 任务名称 */}
        <div className="flex-grow-1 text-truncate" style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
          {task.title}
        </div>

        {/* 进度 */}
        <div className="ms-2" style={{ width: '60px' }}>
          <div className="d-flex align-items-center gap-1">
            <div
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: '#e2e8f0',
                borderRadius: '2px'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${task.progress}%`,
                  backgroundColor: task.progress === 100 ? '#11998e' : '#667eea',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '24px' }}>
              {task.progress}%
            </span>
          </div>
        </div>

        {/* 依赖标识 */}
        {task.dependencies.length > 0 && (
          <span className="ms-2" style={{ fontSize: '0.7rem', color: '#667eea' }} title={`依赖: ${task.dependencies.length} 个任务`}>
            <Link2 size={12} />
          </span>
        )}
      </div>

      {/* 右键菜单 */}
      {showContextMenu && (
        <Dropdown.Menu
          show
          style={{
            position: 'fixed',
            left: contextMenuPos.x,
            top: contextMenuPos.y,
            zIndex: 9999,
            border: 'none',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)',
            padding: '0.5rem',
            minWidth: '160px'
          }}
        >
          <Dropdown.Item
            className="dropdown-item-modern d-flex align-items-center gap-2"
            onClick={handleEdit}
          >
            <Edit2 size={14} />
            编辑任务
          </Dropdown.Item>

          <Dropdown.Item
            className="dropdown-item-modern d-flex align-items-center gap-2"
            onClick={handleDuplicate}
          >
            <Copy size={14} />
            复制任务
          </Dropdown.Item>

          <Dropdown.Divider />

          {/* 依赖操作 */}
          {task.dependencies.length > 0 && onUnlink && (
            <Dropdown.Item
              className="dropdown-item-modern d-flex align-items-center gap-2"
              onClick={() => {
                onUnlink(task.id);
                setShowContextMenu(false);
              }}
            >
              <Unlink size={14} />
              解除依赖
            </Dropdown.Item>
          )}

          {onLinkTo && (
            <Dropdown
              drop="end"
              onClick={(e) => e.stopPropagation()}
            >
              <Dropdown.Toggle
                as="div"
                className="dropdown-item-modern d-flex align-items-center gap-2"
                style={{ cursor: 'pointer' }}
              >
                <Link2 size={14} />
                添加依赖 →
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-modern">
                {allTasks
                  .filter(t => t.id !== task.id && !task.dependencies.includes(t.id))
                  .map(t => (
                    <Dropdown.Item
                      key={t.id}
                      className="dropdown-item-modern"
                      onClick={() => {
                        onLinkTo(task.id, t.id);
                        setShowContextMenu(false);
                      }}
                    >
                      {t.title}
                    </Dropdown.Item>
                  ))}
              </Dropdown.Menu>
            </Dropdown>
          )}

          <Dropdown.Divider />

          <Dropdown.Item
            className="dropdown-item-modern text-danger d-flex align-items-center gap-2"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
            删除任务
          </Dropdown.Item>
        </Dropdown.Menu>
      )}

      {/* 点击其他地方关闭菜单 */}
      {showContextMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998
          }}
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </>
  );
}
