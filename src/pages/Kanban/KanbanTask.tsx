import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from 'react-bootstrap';
import { Calendar, Flag, CheckCircle2 } from 'lucide-react';
import type { Task } from '../../models/types';

interface KanbanTaskProps {
  task: Task;
  priorityColor: string;
  priorityLabel: string;
  isOverlay?: boolean;
}

export function KanbanTask({ task, priorityColor, priorityLabel, isOverlay }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  };

  const isOverdue = new Date(task.endDate) < new Date() && task.status !== 'done';

  const priorityGradients: Record<string, string> = {
    success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    danger: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: isOverlay ? '2px 2px 0 #000' : '2px 2px 0 #000',
        padding: '12px',
        border: isDragging ? '2px dashed var(--primary-color)' : '2px solid transparent',
        transform: isDragging ? `${style.transform} rotate(3deg)` : style.transform,
        transition: 'all 0.2s ease'
      }}
      {...attributes}
      {...listeners}
      className="kanban-task"
    >
      <div className="d-flex justify-content-between align-items-start mb-3">
        <span 
          className="badge badge-modern d-flex align-items-center gap-1"
          style={{ 
            background: priorityGradients[priorityColor],
            color: 'white'
          }}
        >
          <Flag size={10} />
          {priorityLabel}
        </span>
        {task.progress === 100 && (
          <CheckCircle2 size={18} style={{ color: '#11998e' }} />
        )}
      </div>
      
      <h6 className="mb-2 fw-semibold" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
        {task.title}
      </h6>
      
      {task.description && (
        <p className="small mb-3 text-truncate" style={{ color: 'var(--text-muted)' }}>
          {task.description}
        </p>
      )}

      <div className="d-flex align-items-center gap-2 mb-3">
        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
        <small className={isOverdue ? 'text-danger fw-medium' : ''} style={{ color: isOverdue ? undefined : 'var(--text-muted)' }}>
          {new Date(task.endDate).toLocaleDateString('zh-CN')}
          {isOverdue && ' (逾期)'}
        </small>
      </div>

      {task.progress > 0 && (
        <div className="progress-modern mb-3">
          <div 
            className="progress-bar-modern"
            style={{ 
              width: `${task.progress}%`,
              background: task.progress === 100 ? 'var(--success-gradient)' : 'var(--primary-gradient)'
            }}
          />
        </div>
      )}

      {task.tags.length > 0 && (
        <div className="d-flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map(tag => (
            <Badge 
              key={tag} 
              bg="light" 
              className="fw-normal" 
              style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)',
                borderRadius: '100px'
              }}
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge 
              bg="light" 
              className="fw-normal" 
              style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)',
                borderRadius: '100px'
              }}
            >
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
