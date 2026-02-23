import { Container, Row, Col } from 'react-bootstrap';
import { CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import { useVersionStore } from '../../stores/versionStore';
import { useTaskStore } from '../../stores/taskStore';

export function Dashboard() {
  const { versions } = useVersionStore();
  const { tasks } = useTaskStore();

  // 统计数据
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;

  // 即将到期的任务（未来7天）
  const upcomingTasks = tasks
    .filter(t => t.status !== 'done' && new Date(t.endDate) > new Date())
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  // 活跃版本
  const activeVersions = versions.filter(v => v.status === 'in_progress');

    const statusText = {
    todo: '待办',
    in_progress: '进行中',
    review: '审核中',
    done: '已完成'
  };

  return (
    <Container className="py-2">
      <div className="d-flex align-items-center mb-4">
        <h1 className="mb-0 fw-bold" style={{ color: 'var(--primary-gold)' }}>🐵 取经之路 🐲</h1>
        <div className="ms-auto">
          <span className="badge badge-gradient-primary" style={{ fontSize: '0.9rem' }}>
            总任务: {totalTasks}
          </span>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <Row className="g-4 mb-4">
        <Col md={3} className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon success me-3">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{completedTasks}</h2>
                <small style={{ color: 'var(--text-secondary)' }}>已完成任务</small>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon warning me-3">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{inProgressTasks}</h2>
                <small style={{ color: 'var(--text-secondary)' }}>进行中</small>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3} className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon info me-3">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{todoTasks}</h2>
                <small style={{ color: 'var(--text-secondary)' }}>待办任务</small>
              </div>
            </div>
          </div>
        </Col>
        <Col md={3} className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon danger me-3">
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{urgentTasks}</h2>
                <small style={{ color: 'var(--text-secondary)' }}>紧急任务</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* 总体进度 */}
      {totalTasks > 0 && (
        <div className="card-gradient mb-4 p-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>总体进度</h5>
            <span className="badge badge-gradient-primary">{Math.round((completedTasks / totalTasks) * 100)}%</span>
          </div>
          <div className="progress-modern">
            <div 
              className="progress-bar-modern"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
          <div className="d-flex justify-content-between mt-2" style={{ color: 'var(--text-muted)' }}>
            <small>总任务: {totalTasks}</small>
            <small>完成率: {((completedTasks / totalTasks) * 100).toFixed(1)}%</small>
          </div>
        </div>
      )}

      <Row className="g-4">
        {/* 即将到期 */}
        <Col md={6} className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="card-gradient h-100">
            <div className="p-3 border-bottom" style={{ borderColor: 'var(--bg-secondary)' }}>
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>即将到期</h5>
            </div>
            <div className="p-3">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>📋</div>
                  <p style={{ color: 'var(--text-muted)' }}>暂无即将到期的任务</p>
                </div>
              ) : (
                upcomingTasks.map(task => (
                  <div key={task.id} className="d-flex align-items-center py-3 border-bottom" style={{ borderColor: 'var(--bg-secondary)' }}>
                    <span className={`badge badge-modern me-3 ${
                      task.priority === 'urgent' ? 'bg-danger' : 
                      task.priority === 'high' ? 'bg-warning text-dark' :
                      task.priority === 'medium' ? 'bg-info text-dark' : 'bg-success'
                    }`}>
                      {task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : task.priority === 'high' ? '高' : '紧急'}
                    </span>
                    <div className="flex-grow-1">
                      <div className="fw-medium" style={{ color: 'var(--text-primary)' }}>{task.title}</div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        截止: {new Date(task.endDate).toLocaleDateString('zh-CN')}
                      </small>
                    </div>
                    <span className="badge bg-secondary">{statusText[task.status]}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        {/* 活跃版本 */}
        <Col md={6} className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="card-gradient h-100">
            <div className="p-3 border-bottom" style={{ borderColor: 'var(--bg-secondary)' }}>
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>进行中版本</h5>
            </div>
            <div className="p-3">
              {activeVersions.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>🚀</div>
                  <p style={{ color: 'var(--text-muted)' }}>暂无进行中的版本</p>
                </div>
              ) : (
                activeVersions.map(version => {
                  const versionTasks = tasks.filter(t => t.versionId === version.id);
                  const versionCompleted = versionTasks.filter(t => t.status === 'done').length;
                  const progress = versionTasks.length > 0 
                    ? (versionCompleted / versionTasks.length) * 100 
                    : 0;
                  
                  return (
                    <div key={version.id} className="py-3 border-bottom" style={{ borderColor: 'var(--bg-secondary)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{version.versionNumber}</span>
                        <small style={{ color: 'var(--text-muted)' }}>
                          {versionCompleted}/{versionTasks.length} 任务
                        </small>
                      </div>
                      <div className="progress-modern mb-2">
                        <div 
                          className="progress-bar-modern"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <small style={{ color: 'var(--text-muted)' }}>
                        目标: {new Date(version.targetDate).toLocaleDateString('zh-CN')}
                      </small>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
