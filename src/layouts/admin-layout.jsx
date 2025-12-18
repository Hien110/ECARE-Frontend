import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <>
      <Sidebar />

      {/* Phần bên phải: chừa đúng chiều rộng sidebar */}
      <div className="ml-72 min-h-screen flex flex-col">
        <Header />

        {/* Chỉ nội dung cuộn */}
        <main className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
