import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, GitBranch, CalendarDays, KanbanSquare } from 'lucide-react';
import { useVersionStore } from '../../stores/versionStore';
import { useEffect } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { versions, selectedVersionId, selectVersion, loadVersions } = useVersionStore();

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <Navbar expand="lg" className="navbar-custom sticky-top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center">
            <div className="stat-icon primary me-2" style={{ width: '36px', height: '36px' }}>
              <LayoutDashboard size={20} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>The81</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                active={location.pathname === '/'}
                className="d-flex align-items-center gap-2"
              >
                <LayoutDashboard size={18} />
                仪表盘
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/versions" 
                active={location.pathname === '/versions'}
                className="d-flex align-items-center gap-2"
              >
                <GitBranch size={18} />
                版本
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/gantt" 
                active={location.pathname === '/gantt'}
                className="d-flex align-items-center gap-2"
              >
                <CalendarDays size={18} />
                甘特图
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/kanban" 
                active={location.pathname === '/kanban'}
                className="d-flex align-items-center gap-2"
              >
                <KanbanSquare size={18} />
                看板
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown 
                title={selectedVersion ? `版本: ${selectedVersion.versionNumber}` : '选择版本'} 
                align="end"
              >
                <NavDropdown.Item onClick={() => selectVersion(null)}>
                  全部版本
                </NavDropdown.Item>
                <NavDropdown.Divider />
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
          {children}
        </div>
      </main>
      
      <footer className="py-3 mt-auto bg-white border-top">
        <Container className="text-center">
          <small className="text-muted">The81 - 九九八十一</small>
        </Container>
      </footer>
    </div>
  );
}
