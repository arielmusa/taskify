import { Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./routes/PrivateRoute";
<<<<<<< Updated upstream
=======
import TenantsPage from "./pages/TenantsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TaskPage";
import RegisterPage from "./pages/RegisterPage";
>>>>>>> Stashed changes

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DefaultLayout />}>
<<<<<<< Updated upstream
          <Route index element={<HomePage />} />
=======
          <Route index element={<TenantsPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route
            path="/tenants/:tenantId/projects"
            element={<ProjectsPage />}
          />
          <Route
            path="tenants/:tenantId/projects/:projectId"
            element={<TasksPage />}
          />
>>>>>>> Stashed changes
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
