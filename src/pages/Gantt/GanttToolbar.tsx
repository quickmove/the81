import { useState } from 'react';
import { Form, InputGroup, Dropdown } from 'react-bootstrap';
import { Plus, Search, Link2, Trash2, MoreHorizontal } from 'lucide-react';
import type { Version } from '../../models/types';

interface GanttToolbarProps {
  versions: Version[];
  selectedVersionId: string | null;
  onVersionChange: (versionId: string | null) => void;
  onAddTask: () => void;
  onSearch: (query: string) => void;
  selectedTasks: string[];
  onBatchDelete: () => void;
  onBatchLink: () => void;
}

export function GanttToolbar({
  versions,
  selectedVersionId,
  onVersionChange,
  onAddTask,
  onSearch,
  selectedTasks,
  onBatchDelete,
  onBatchLink
}: GanttToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
      {/* 左侧：标题和版本选择 */}
      <div className="d-flex align-items-center gap-3">
        <h1 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>
          甘特图
        </h1>
        <Form.Select
          style={{
            width: '180px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--bg-secondary)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem'
          }}
          value={selectedVersionId || ''}
          onChange={(e) => onVersionChange(e.target.value || null)}
        >
          <option value="">全部版本</option>
          {versions.map(v => (
            <option key={v.id} value={v.id}>{v.versionNumber}</option>
          ))}
        </Form.Select>
      </div>

      {/* 中间：搜索和筛选 */}
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <InputGroup style={{ maxWidth: '280px' }}>
          <InputGroup.Text style={{ background: 'var(--bg-secondary)', border: 'none' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              border: '2px solid var(--bg-secondary)',
              borderLeft: 'none',
              fontSize: '0.875rem'
            }}
          />
        </InputGroup>
      </div>

      {/* 右侧：操作按钮组 */}
      <div className="d-flex align-items-center gap-2">
        {/* 批量操作 */}
        {selectedTasks.length > 0 && (
          <Dropdown>
            <Dropdown.Toggle 
              variant="light" 
              className="d-flex align-items-center gap-2"
              style={{ 
                borderRadius: 'var(--radius-md)', 
                border: '2px solid var(--bg-secondary)',
                fontSize: '0.875rem'
              }}
            >
              <MoreHorizontal size={16} />
              批量操作 ({selectedTasks.length})
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-modern">
              <Dropdown.Item className="dropdown-item-modern" onClick={onBatchLink}>
                <Link2 size={14} className="me-2" />
                建立依赖
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="dropdown-item-modern text-danger" onClick={onBatchDelete}>
                <Trash2 size={14} className="me-2" />
                删除选中
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}

        {/* 添加任务按钮 */}
        <button
          className="btn-gradient d-flex align-items-center gap-2"
          onClick={onAddTask}
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        >
          <Plus size={18} />
          新建任务
        </button>
      </div>
    </div>
  );
}
