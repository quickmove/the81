import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Versions } from './pages/Versions/Versions';
import { GanttPage } from './pages/Gantt/Gantt';
import { Kanban } from './pages/Kanban/Kanban';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/versions" element={<Versions />} />
          <Route path="/gantt" element={<GanttPage />} />
          <Route path="/kanban" element={<Kanban />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;