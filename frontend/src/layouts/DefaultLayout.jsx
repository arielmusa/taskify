import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function DefaultLayout() {
  const { logout } = useAuth();
  return (
    <>
      <nav className="navbar navbar-light bg-light px-3">
        <span className="navbar-brand">Plaza Todo</span>
        <button
          className="btn btn-outline-danger"
          onClick={() => {
            logout();
          }}
        >
          Logout
        </button>
      </nav>

      <Outlet />
    </>
  );
}
