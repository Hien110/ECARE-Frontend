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
import { Link, useLocation, useNavigate } from "react-router-dom";

import ROUTE_PATH from "../constants/routePath";

function Header() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  //const [isPackagesOpen, setIsPackagesOpen] = useState(false); // NEW
  const [isSupporterServicesOpen, setIsSupporterServicesOpen] = useState(false); // NEW

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
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Notifications"
            >
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2"
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
                type="button"
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
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    onClick={() => navigate("/")}
                  >
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

        {/* User Management dropdown: giống dịch vụ hỗ trợ sức khỏe */}
        <div
          className="relative"
          onMouseEnter={() => setIsUserMenuOpen(true)}
          onMouseLeave={() => setIsUserMenuOpen(false)}
        >
          <button
            onClick={() => setIsUserMenuOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
              pathname.startsWith("/admin/staff") || 
              pathname.startsWith("/admin/user") || 
              pathname.startsWith("/admin/elderly-location")
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
            type="button"
          >
            <Users size={16} /> Quản Lý Người Dùng
            <ChevronDown size={14} className="ml-1" />
          </button>
          {isUserMenuOpen && (
            <div className="absolute left-0 top-full mt-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <Link
                to="/admin/staff"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition"
              >
                Quản lý nhân viên
              </Link>
              <Link
                to="/admin/user"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition"
              >
                Quản lý người dùng
              </Link>
              <Link
                to={ROUTE_PATH.ADMIN_ELDERLY_LOCATION}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition"
              >
                Quản lý vị trí người cao tuổi
              </Link>
            </div>
          )}
        </div>

        {/* Packages dropdown: use mouse events to control open state */}
        <div
          className="relative"
          onMouseEnter={() => setIsPackagesOpen(true)}
          onMouseLeave={() => setIsPackagesOpen(false)}
        >
          <button
            // allow click toggle for touch users
            onClick={() => setIsPackagesOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
              pathname.startsWith("/admin/registered-packages") ||
              pathname.startsWith("/admin/health-packages")
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-haspopup="true"
            aria-expanded={isPackagesOpen}
            type="button"
          >
            <MessagesSquare size={16} /> Dịch vụ hỗ trợ sức khỏe
            <ChevronDown size={14} className="ml-1" />
          </button>

          {/* Rendered based on state, so no flicker when moving mouse */}
          {isPackagesOpen && (
            <div className="absolute left-0 top-full mt-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <Link
                to="/admin/health-consultation-schedules"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition"
              >
                Lịch khám đã đặt
              </Link>
            </div>
          )}
        </div>

        {/* Supporter Services dropdown: Similar to health packages dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setIsSupporterServicesOpen(true)}
          onMouseLeave={() => setIsSupporterServicesOpen(false)}
        >
          <button
            onClick={() => setIsSupporterServicesOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
              pathname.startsWith(ROUTE_PATH.SUPPORTER_SERVICES)
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-haspopup="true"
            aria-expanded={isSupporterServicesOpen}
            type="button"
          >
            Dịch vụ hỗ trợ
            <ChevronDown size={14} className="ml-1" />
          </button>

          {isSupporterServicesOpen && (
            <div className="absolute left-0 top-full mt-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <Link
                to={ROUTE_PATH.SUPPORTER_SERVICES}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition"
              >
                Quản lý dịch vụ
              </Link>
              <Link
                to={ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_LIST}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition"
              >
                Dịch vụ đã đặt
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
