// components/layout/AdminLayout.jsx
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "../../Footer";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
        <Footer theme="light" />
      </div>
    </div>
  );
};

export default AdminLayout;
