import { Routes, Route } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./routes/PrivateRoute";
import TenantsPage from "./pages/TenantsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DefaultLayout />}>
          <Route index element={<TenantsPage />} />
          <Route path="tenants" element={<TenantsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
