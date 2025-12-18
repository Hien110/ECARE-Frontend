import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Users,
  MapPin,
  BadgeDollarSign,
  CalendarCheck,
  HeartHandshake,
  ClipboardList,
} from "lucide-react";
import ROUTE_PATH from "../constants/routePath";

const SIDEBAR_WIDTH_CLASS = "w-72"; // 18rem

function SidebarItem({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-blue-100 hover:text-blue-700",
        ].join(" ")
      }
    >
      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/80">
        <Icon size={18} />
      </div>

      <span className="flex-1">{label}</span>

      {/* Active indicator */}
      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-white/80 opacity-0 group-[.active]:opacity-100" />
    </NavLink>
  );
}

function SidebarGroup({ title, children }) {
  return (
    <div className="mt-6">
      <div className="px-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </p>
      </div>

      <div className="space-y-1">{children}</div>

      <div className="mt-4 border-t border-gray-200/70" />
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside
      className={[
        "fixed top-0 left-0 z-40 h-screen",
        SIDEBAR_WIDTH_CLASS,
        "border-r border-gray-200 flex flex-col",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="h-16 px-4 flex items-center gap-3 bg-white border-b border-gray-200">
        <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
          EC
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-gray-900">
            Elder Care Admin
          </h1>
          <p className="text-[11px] text-gray-500">System Management</p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <SidebarItem
          to="/admin/dashboard"
          icon={LayoutDashboard}
          label="Bảng Thống Kê"
          end
        />

        <SidebarGroup title="Quản lý người dùng">
          <SidebarItem to="/admin/staff" icon={UserCog} label="Nhân viên" />
          <SidebarItem to="/admin/user" icon={Users} label="Khách hàng" />
          <SidebarItem
            to={ROUTE_PATH.ADMIN_ELDERLY_LOCATION}
            icon={MapPin}
            label="Vị trí người cao tuổi"
          />
        </SidebarGroup>

        <SidebarGroup title="Tư vấn sức khỏe">
          <SidebarItem
            to="/admin/consultation-price"
            icon={BadgeDollarSign}
            label="Quản lý giá khám"
          />
          <SidebarItem
            to="/admin/health-consultation-schedules"
            icon={CalendarCheck}
            label="Lịch khám đã đặt"
          />
        </SidebarGroup>

        <SidebarGroup title="Hỗ trợ sức khỏe">
          <SidebarItem
            to={ROUTE_PATH.SUPPORTER_SERVICES}
            icon={HeartHandshake}
            label="Quản lý dịch vụ"
          />
          <SidebarItem
            to={ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_LIST}
            icon={ClipboardList}
            label="Dịch vụ đã đặt"
          />
        </SidebarGroup>
      </div>
    </aside>
  );
}
