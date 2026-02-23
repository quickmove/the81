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
        <h1 className="mb-0 fw-bold" style={{ color: 'var(--primary-gold)', fontSize: '1.2rem' }}>
          ☁️ 筋斗云 ☁️
        </h1>
        <Form.Select
          style={{
            width: '180px',
            borderRadius: '0',
            border: '3px solid #000',
            padding: '0.5rem 0.75rem',
            fontSize: '10px',
            background: 'var(--bg-card)',
            color: 'var(--primary-gold)',
            fontFamily: "'Press Start 2P', monospace"
          }}
          value={selectedVersionId || ''}
          onChange={(e) => onVersionChange(e.target.value || null)}
        >
          <option value="" style={{ background: 'var(--bg-darker)' }}>📚 全部经书</option>
          {versions.map(v => (
            <option key={v.id} value={v.id} style={{ background: 'var(--bg-darker)' }}>{v.versionNumber}</option>
          ))}
        </Form.Select>
      </div>

      {/* 中间：搜索和筛选 */}
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <InputGroup style={{ maxWidth: '280px' }}>
          <InputGroup.Text style={{ background: 'var(--bg-card)', border: '3px solid #000', borderRight: 'none' }}>
            <Search size={16} style={{ color: 'var(--primary-gold)' }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              borderRadius: '0',
              border: '3px solid #000',
              borderLeft: 'none',
              fontSize: '10px',
              background: 'var(--bg-card)',
              color: 'var(--text-light)',
              fontFamily: "'Press Start 2P', monospace"
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
                borderRadius: '0',
                border: '3px solid #000',
                fontSize: '10px',
                background: 'var(--bg-card)',
                color: 'var(--primary-gold)',
                fontFamily: "'Press Start 2P', monospace"
              }}
            >
              <MoreHorizontal size={16} />
              批量 ({selectedTasks.length})
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-modern">
              <Dropdown.Item className="dropdown-item-modern" onClick={onBatchLink}>
                <Link2 size={14} className="me-2" />
                建立依赖
              </Dropdown.Item>
              <Dropdown.Divider style={{ borderColor: '#000' }} />
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
          style={{ fontSize: '10px', padding: '0.5rem 1rem' }}
        >
          <Plus size={18} />
          新建任务
        </button>
      </div>
    </div>
  );
}
