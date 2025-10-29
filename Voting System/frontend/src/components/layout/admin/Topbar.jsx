import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../../store/adminAuthStore";

const Topbar = () => {
  const { admin, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-white border-b shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
      <div className="flex items-center gap-3">
        <span className="text-gray-600">{admin?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
