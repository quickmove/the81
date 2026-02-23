import { Container, Nav, Navbar, NavDropdown, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GitBranch, CalendarDays, KanbanSquare } from 'lucide-react';
import { useVersionStore } from '../../stores/versionStore';
import { useTaskStore } from '../../stores/taskStore';
import { useEffect, useRef, useState } from 'react';
import { initDefaultKanbanColumns } from '../../db/database';
import { VERSION } from './VERSION';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { versions, selectedVersionId, selectVersion, loadVersions, isLoading: versionLoading } = useVersionStore();
  const { loadTasks, isLoading: taskLoading } = useTaskStore();
  const hasInitialized = useRef(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 只在首次挂载时加载数据，避免重复加载
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // 初始化看板列配置
      initDefaultKanbanColumns();
      // 加载版本和任务数据
      Promise.all([loadVersions(), loadTasks()]).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [loadVersions, loadTasks]);

  const isLoading = initialLoading || versionLoading || taskLoading;
  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
      <Navbar expand="lg" className="navbar-custom sticky-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>🐵</span>
            <span>九九八一</span>
          </Navbar.Brand>
          <Navbar.Toggle style={{ border: '3px solid #000' }} />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/"
                active={location.pathname === '/'}
                className="d-flex align-items-center gap-2"
              >
                <LayoutDashboard size={16} />
                主页
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/versions"
                active={location.pathname === '/versions'}
                className="d-flex align-items-center gap-2"
              >
                <GitBranch size={16} />
                取经版本
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/gantt"
                active={location.pathname === '/gantt'}
                className="d-flex align-items-center gap-2"
              >
                <CalendarDays size={16} />
                筋斗云
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/kanban"
                active={location.pathname === '/kanban'}
                className="d-flex align-items-center gap-2"
              >
                <KanbanSquare size={16} />
                八卦炉
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown
                title={selectedVersion ? `📜 ${selectedVersion.versionNumber}` : '📜 选择经书'}
                align="end"
              >
                <NavDropdown.Item onClick={() => selectVersion(null)}>
                  📚 全部经书
                </NavDropdown.Item>
                <NavDropdown.Divider style={{ borderColor: '#000' }} />
                {versions.map(v => (
                  <NavDropdown.Item
                    key={v.id}
                    onClick={() => selectVersion(v.id)}
                    active={v.id === selectedVersionId}
                  >
                    {v.versionNumber} - {v.name}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 p-3" style={{ overflowX: 'hidden' }}>
        <div className="page-content p-4">
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
              <div className="text-center">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐉</div>
                <Spinner animation="border" variant="warning" className="mb-3" style={{ width: '3rem', height: '3rem', borderWidth: '4px' }} />
                <p style={{ color: 'var(--primary-gold)', fontFamily: "'Press Start 2P', monospace", fontSize: '10px' }}>
                  腾云驾雾中...
                </p>
              </div>
            </div>
          ) : children}
        </div>
      </main>

      <footer className="py-3 mt-auto" style={{ background: 'var(--bg-darker)', borderTop: '4px solid #000' }}>
        <Container className="text-center">
          <small style={{ color: 'var(--primary-gold)', fontFamily: "'Press Start 2P', monospace", fontSize: '8px' }}>
            🐵 九九八一 - 西天取经任务管理系统 🐲 {VERSION}
          </small>
        </Container>
      </footer>
    </div>
  );
}
