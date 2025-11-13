import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Users,
  LayoutGrid,
  MessagesSquare,
  CalendarDays,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import ROUTE_PATH from "../constants/routePath";

function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      {/* ===== Hàng 1: Logo + Profile ===== */}
      <div className="w-full px-6 lg:px-10 border-b border-gray-100">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
              EC
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-gray-900">
                Elder Care Admin Portal
              </h1>
              <p className="text-[11px] text-gray-500">
                System Management Dashboard
              </p>
            </div>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <Bell size={18} className="text-gray-700" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 text-white text-[10px] px-1">
                3
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                  AU
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    Admin User
                  </p>
                  <p className="text-[11px] text-gray-500">
                    System Administrator
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-700" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    to="#"
                  >
                    Profile
                  </Link>
                  <Link
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    to="#"
                  >
                    Settings
                  </Link>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Hàng 2: Navigation ===== */}
      <nav className="w-full flex items-center justify-center gap-1 px-6 lg:px-10 h-12 bg-white">
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
            pathname.startsWith("/admin/dashboard")
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <LayoutGrid size={16} /> Bảng Thống Kê
        </Link>

        <Link
          to="/admin/users"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
            pathname.startsWith("/admin/users")
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Users size={16} /> Quản Lý Người Dùng
        </Link>

        <Link
          to="/admin/registered-packages"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
            pathname.startsWith("/admin/content")
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <MessagesSquare size={16} /> Quản Lý Gói Khám Đã Đăng Ký
        </Link>

        <Link
          to="/admin/services"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
            pathname.startsWith("/admin/services")
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <MessageCircle size={16} /> Dịch Vụ
        </Link>

        <Link
          to="/admin/appointments"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
            pathname.startsWith("/admin/appointments")
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <CalendarDays size={16} /> Lịch Hẹn
        </Link>

        <Link
          to="/admin/reports"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
            pathname.startsWith("/admin/reports")
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <BarChart3 size={16} /> Báo Cáo
        </Link>

        <Link
          to={ROUTE_PATH.SUPPORTER_SERVICES}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
            pathname.startsWith(ROUTE_PATH.SUPPORTER_SERVICES)
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Dịch vụ hỗ trợ
        </Link>
      </nav>
    </header>
  );
}

export default Header;
