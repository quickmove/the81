import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import type { VersionStatus } from '../../models/types';

interface VersionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (version: {
    versionNumber: string;
    name: string;
    description: string;
    startDate: Date;
    targetDate: Date;
    status: VersionStatus;
    parentVersionId?: string;
  }) => void;
  editVersion?: {
    versionNumber: string;
    name: string;
    description: string;
    startDate: Date;
    targetDate: Date;
    status: VersionStatus;
    parentVersionId?: string;
  };
}

export function VersionModal({ show, onHide, onSave, editVersion }: VersionModalProps) {
  const [formData, setFormData] = useState({
    versionNumber: editVersion?.versionNumber || '',
    name: editVersion?.name || '',
    description: editVersion?.description || '',
    startDate: editVersion?.startDate ? editVersion.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    targetDate: editVersion?.targetDate ? editVersion.targetDate.toISOString().split('T')[0] : '',
    status: editVersion?.status || 'planning' as VersionStatus
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      startDate: new Date(formData.startDate),
      targetDate: new Date(formData.targetDate)
    });
    if (!editVersion) {
      setFormData({
        versionNumber: '',
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '',
        status: 'planning'
      });
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <div className="modal-content-modern">
        <div className="modal-header-modern">
          <Modal.Title className="fw-bold">{editVersion ? '编辑版本' : '新建版本'}</Modal.Title>
        </div>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>版本号 *</Form.Label>
              <Form.Control
                type="text"
                placeholder="如: v1.0.0 或 v2.0.0-beta"
                value={formData.versionNumber}
                onChange={(e) => setFormData({ ...formData, versionNumber: e.target.value })}
                required
                className="form-control-modern"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>版本名称 *</Form.Label>
              <Form.Control
                type="text"
                placeholder="输入版本名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="form-control-modern"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>描述</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="版本描述"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-control-modern"
              />
            </Form.Group>
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
                  <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>目标日期 *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    required
                    className="form-control-modern"
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: 'var(--text-primary)' }}>状态</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VersionStatus })}
                className="form-control-modern"
              >
                <option value="planning">规划中</option>
                <option value="in_progress">进行中</option>
                <option value="released">已发布</option>
                <option value="archived">已归档</option>
              </Form.Select>
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
