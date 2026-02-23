import { useState, useEffect } from 'react';
import { Container, Row, Col, Dropdown } from 'react-bootstrap';
import { Plus, MoreVertical, Edit2, Trash2, Archive, Play, CheckCircle } from 'lucide-react';
import { VersionModal } from '../../components/Modals/VersionModal';
import { useVersionStore } from '../../stores/versionStore';
import { useTaskStore } from '../../stores/taskStore';
import type { Version, VersionStatus } from '../../models/types';

export function Versions() {
  const { versions, loadVersions, addVersion, updateVersion, deleteVersion } = useVersionStore();
  const { tasks, loadTasks } = useTaskStore();
  const [showModal, setShowModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);

  useEffect(() => {
    loadVersions();
    loadTasks();
  }, [loadVersions, loadTasks]);

  const handleSave = (versionData: Omit<Version, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingVersion) {
      updateVersion(editingVersion.id, versionData);
    } else {
      addVersion(versionData);
    }
    setEditingVersion(null);
  };

  const handleEdit = (version: Version) => {
    setEditingVersion(version);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个版本吗？相关的任务也会被删除。')) {
      await deleteVersion(id);
    }
  };

  const handleStatusChange = (versionId: string, newStatus: VersionStatus) => {
    updateVersion(versionId, { status: newStatus });
  };

  const getVersionProgress = (versionId: string) => {
    const versionTasks = tasks.filter(t => t.versionId === versionId);
    if (versionTasks.length === 0) return 0;
    const completed = versionTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / versionTasks.length) * 100);
  };

  return (
    <Container className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>版本管理</h1>
        <button 
          className="btn-gradient d-flex align-items-center gap-2"
          onClick={() => { setEditingVersion(null); setShowModal(true); }}
        >
          <Plus size={18} />
          新建版本
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="card-gradient p-5 text-center">
          <div className="mb-3" style={{ fontSize: '4rem', opacity: 0.5 }}>📦</div>
          <h5 className="mb-2" style={{ color: 'var(--text-primary)' }}>暂无版本</h5>
          <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>点击"新建版本"开始创建你的第一个版本计划</p>
          <button 
            className="btn-gradient"
            onClick={() => { setEditingVersion(null); setShowModal(true); }}
          >
            <Plus size={18} className="me-2" />
            新建版本
          </button>
        </div>
      ) : (
        <Row className="g-4">
          {versions.map((version, index) => {
            const progress = getVersionProgress(version.id);
            const versionTasks = tasks.filter(t => t.versionId === version.id);
            
            return (
              <Col md={6} lg={4} key={version.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`version-card ${version.status} h-100`}>
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1 fw-bold" style={{ color: 'var(--text-primary)' }}>{version.versionNumber}</h5>
                        <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>{version.name}</p>
                      </div>
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" className="border-0 rounded-circle" style={{ width: '32px', height: '32px' }}>
                          <MoreVertical size={16} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu-modern">
                          <Dropdown.Item className="dropdown-item-modern" onClick={() => handleEdit(version)}>
                            <Edit2 size={14} className="me-2" />编辑
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className="dropdown-item-modern"
                            onClick={() => handleStatusChange(version.id, 'in_progress')}
                            disabled={version.status === 'in_progress'}
                          >
                            <Play size={14} className="me-2" />标记为进行中
                          </Dropdown.Item>
                          <Dropdown.Item 
                            className="dropdown-item-modern"
                            onClick={() => handleStatusChange(version.id, 'released')}
                            disabled={version.status === 'released'}
                          >
                            <CheckCircle size={14} className="me-2" />标记为已发布
                          </Dropdown.Item>
                          <Dropdown.Item 
                            className="dropdown-item-modern"
                            onClick={() => handleStatusChange(version.id, 'archived')}
                            disabled={version.status === 'archived'}
                          >
                            <Archive size={14} className="me-2" />归档
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className="dropdown-item-modern text-danger"
                            onClick={() => handleDelete(version.id)}
                          >
                            <Trash2 size={14} className="me-2" />删除
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>

                    <p className="small mb-3" style={{ minHeight: '40px', color: 'var(--text-muted)' }}>
                      {version.description || '暂无描述'}
                    </p>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className={`badge badge-modern ${
                        version.status === 'planning' ? 'bg-secondary' :
                        version.status === 'in_progress' ? 'badge-gradient-primary' :
                        version.status === 'released' ? 'badge-gradient-success' : 'bg-dark'
                      }`}>
                        {version.status === 'planning' && '规划中'}
                        {version.status === 'in_progress' && '进行中'}
                        {version.status === 'released' && '已发布'}
                        {version.status === 'archived' && '已归档'}
                      </span>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {versionTasks.filter(t => t.status === 'done').length}/{versionTasks.length} 任务
                      </small>
                    </div>

                    <div className="progress-modern mb-3">
                      <div 
                        className="progress-bar-modern"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="d-flex justify-content-between small" style={{ color: 'var(--text-muted)' }}>
                      <span>
                        开始: {new Date(version.startDate).toLocaleDateString('zh-CN')}
                      </span>
                      <span>
                        目标: {new Date(version.targetDate).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      <VersionModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditingVersion(null); }}
        onSave={handleSave}
        editVersion={editingVersion || undefined}
      />
    </Container>
  );
}
