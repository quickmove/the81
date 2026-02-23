import { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import type { TaskStatus, Priority } from '../../models/types';
import { useVersionStore } from '../../stores/versionStore';
import { X } from 'lucide-react';

interface TaskModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (task: {
    title: string;
    description: string;
    versionId: string;
    status: TaskStatus;
    priority: Priority;
    startDate: Date;
    endDate: Date;
    progress: number;
    dependencies: string[];
    tags: string[];
    order: number;
  }) => void;
  editTask?: {
    title: string;
    description: string;
    versionId: string;
    status: TaskStatus;
    priority: Priority;
    startDate: Date;
    endDate: Date;
    progress: number;
    dependencies: string[];
    tags: string[];
    order: number;
  };
  defaultVersionId?: string;
}

export function TaskModal({ show, onHide, onSave, editTask, defaultVersionId }: TaskModalProps) {
  const { versions, selectedVersionId } = useVersionStore();
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    versionId: editTask?.versionId || defaultVersionId || selectedVersionId || '',
    status: editTask?.status || 'todo' as TaskStatus,
    priority: editTask?.priority || 'medium' as Priority,
    startDate: editTask?.startDate ? editTask.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: editTask?.endDate ? editTask.endDate.toISOString().split('T')[0] : '',
    progress: editTask?.progress || 0,
    tags: editTask?.tags || [] as string[]
  });

  useEffect(() => {
    if (show) {
      setFormData({
        title: editTask?.title || '',
        description: editTask?.description || '',
        versionId: editTask?.versionId || defaultVersionId || selectedVersionId || '',
        status: editTask?.status || 'todo',
        priority: editTask?.priority || 'medium',
        startDate: editTask?.startDate ? editTask.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: editTask?.endDate ? editTask.endDate.toISOString().split('T')[0] : '',
        progress: editTask?.progress || 0,
        tags: editTask?.tags || []
      });
    }
  }, [show, editTask, defaultVersionId, selectedVersionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      dependencies: [],
      order: 0
    });
    onHide();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

    const priorityGradients = {
    low: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    medium: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    high: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    urgent: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <div className="modal-content-modern">
        <div className="modal-header-modern">
          <Modal.Title className="fw-bold">{editTask ? '编辑任务' : '新建任务'}</Modal.Title>
        </div>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>任务标题 *</Form.Label>
              <Form.Control
                type="text"
                placeholder="输入任务标题"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="form-control-modern"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>描述</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="任务描述"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-control-modern"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>所属版本 *</Form.Label>
              <Form.Select
                value={formData.versionId}
                onChange={(e) => setFormData({ ...formData, versionId: e.target.value })}
                required
                className="form-control-modern"
              >
                <option value="">选择版本</option>
                {versions.map(v => (
                  <option key={v.id} value={v.id}>{v.versionNumber} - {v.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>优先级</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="form-control-modern"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>状态</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="form-control-modern"
                  >
                    <option value="todo">待办</option>
                    <option value="in_progress">进行中</option>
                    <option value="review">审核中</option>
                    <option value="done">已完成</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>开始日期 *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="form-control-modern"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>结束日期 *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="form-control-modern"
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>进度: {formData.progress}%</Form.Label>
              <Form.Range
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                min={0}
                max={100}
                style={{ accentColor: '#667eea' }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>标签</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  placeholder="添加标签，按回车确认"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="form-control-modern"
                />
                <button type="button" className="btn-gradient" onClick={addTag}>
                  添加
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="badge badge-modern d-flex align-items-center gap-2"
                    style={{ 
                      background: priorityGradients[formData.priority],
                      color: 'white',
                      fontSize: '0.85rem',
                      padding: '0.5rem 0.75rem'
                    }}
                  >
                    {tag}
                    <X size={16} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                  </span>
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 pb-4 px-4">
            <Button variant="light" onClick={onHide} style={{ borderRadius: 'var(--radius-md)', padding: '0.625rem 1.5rem' }}>
              取消
            </Button>
            <button type="submit" className="btn-gradient">
              保存
            </button>
          </Modal.Footer>
        </Form>
      </div>
    </Modal>
  );
}
