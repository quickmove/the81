import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface KanbanColumnProps {
  status: string;
  children: ReactNode;
}

export function KanbanColumn({ status, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status
  });

  return (
    <div
      ref={setNodeRef}
      className="d-flex flex-column gap-3"
      style={{ 
        minHeight: '500px',
        background: isOver ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.2s ease',
        padding: '8px',
        border: isOver ? '2px dashed #667eea' : '2px solid transparent'
      }}
    >
      {children}
    </div>
  );
}
