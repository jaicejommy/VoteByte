// pages/admin/AdminDashboard.jsx
import { Outlet } from "react-router-dom";
import Topbar from "../../components/admin/Topbar";
import Sidebar from "../../components/admin/Sidebar";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet /> {/* This is where nested pages render */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
