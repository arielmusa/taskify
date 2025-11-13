import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";
import { Outlet } from "react-router";

export default function PrivateRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
