import React from "react";
import Header from "../components/Header";

const AdminLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 min-h-screen">
        {children}
      </main>
    </>
  );
};

export default AdminLayout;


