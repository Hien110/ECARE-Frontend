import React, { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import adminService from "../services/adminService"

/** =========================
 * Helpers
 * ========================= */

// Ưu tiên hiển thị địa chỉ (bạn có thể mở rộng theo role nếu muốn)
const getDetailsByRole = (user) => {
  if (user?.address && user.address !== "N/A") return user.address
  return "Chưa có địa chỉ"
}

const getDetailLink = (user) => {
  switch (user.role) {
    case "doctor":
      return `/admin/doctors/view?id=${user.id}`
    case "elderly":
      return `/admin/elderly/view?id=${user.id}`
    case "supporter":
      return `/admin/supporters/view?id=${user.id}`
    case "family":
      return `/admin/family/view?id=${user.id}`
    default:
      return `/admin/users/view?id=${user.id}`
  }
}

// Map role -> label VN (đúng yêu cầu doctor/elderly/family)
const roleLabel = (role) => {
  if (!role) return "Không rõ"
  switch (role) {
    case "doctor":
      return "Bác sĩ"
    case "elderly":
      return "Người già"
    case "family":
      return "Người thân gia đình"
    case "supporter":
      return "Người hỗ trợ"
    case "admin":
      return "Quản trị viên"
    default:
      return role
  }
}

// Label dùng cho 2 nút tab (supporter -> Nhân viên theo yêu cầu)
const roleTabLabel = (role) => {
  switch (role) {
    case "doctor":
      return "Bác sĩ"
    case "supporter":
      return "Người hỗ trợ"
    case "elderly":
      return "Người già"
    case "family":
      return "Gia đình"
    default:
      return roleLabel(role)
  }
}

const roleBadgeStyle = (role) => {
  switch (role) {
    case "doctor":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
    case "elderly":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
    case "family":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
    case "supporter":
      return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200"
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200"
  }
}

const activeBadgeStyle = (isActive) =>
  isActive
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
    : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"

/** =========================
 * Monochrome Icons (SVG)
 * ========================= */

const PencilIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
  </svg>
)

const LockClosedIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <rect x="5" y="11" width="14" height="10" rx="2" />
  </svg>
)

const LockOpenIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M7 11V8a5 5 0 0 1 9.6-2" />
    <rect x="5" y="11" width="14" height="10" rx="2" />
  </svg>
)

const IconButton = ({ title, onClick, children, danger = false }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={[
      "inline-flex items-center justify-center w-9 h-9 rounded-lg",
      "ring-1 ring-inset transition",
      danger
        ? "text-rose-700 ring-rose-200 hover:bg-rose-50 hover:text-rose-800"
        : "text-slate-700 ring-slate-200 hover:bg-slate-100 hover:text-slate-900",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500",
    ].join(" ")}
  >
    {children}
  </button>
)

/** =========================
 * Role Tabs (2 nút bấm)
 * ========================= */

const RoleTabs = ({ roles = [], value, onChange }) => {
  if (!roles?.length) return null
  return (
    <div className="inline-flex rounded-xl ring-1 ring-slate-200 bg-white p-1 gap-1">
      {roles.map((r) => {
        const active = value === r
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={[
              "px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer",
              active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            {roleTabLabel(r)}
          </button>
        )
      })}
    </div>
  )
}

/** =========================
 * Component
 * ========================= */

const UserListTable = ({
  filterRoles = [],
  title = "Danh sách người dùng",
  description = "Quản lý người dùng trong hệ thống",
  showAddButtons = false,
}) => {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // roleFilter: nếu filterRoles có truyền -> mặc định role đầu tiên (vd doctor trước)
  // nếu không truyền -> fallback "all" để dùng select như cũ
  const [roleFilter, setRoleFilter] = useState(filterRoles?.length ? filterRoles[0] : "all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  /** PAGINATION */
  const PAGE_SIZE = 15
  const [page, setPage] = useState(1)

  /** MODAL STATE */
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    userId: null,
    isActive: null,
    type: null, // 'lock' | 'resetPassword'
  })

  const [notifyModal, setNotifyModal] = useState({
    visible: false,
    message: "",
    type: "success", // 'success' | 'error'
  })

  // Khi filterRoles thay đổi theo page, set tab mặc định cho đúng
  useEffect(() => {
    if (filterRoles?.length) setRoleFilter(filterRoles[0])
    else setRoleFilter("all")
  }, [filterRoles])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getAllUsers()
        const data = res?.data || []
        const mapped = data
          .map((u) => ({
            id: u._id || u.id,
            fullName: u.fullName,
            role: u.role,
            isActive: u.isActive,
            phoneNumber: u.phoneNumber || "N/A",
            email: u.email || "N/A",
            address: u.address || "N/A",
            createdAt: u.createdAt,
            gender: u.gender,
            details: getDetailsByRole(u),
          }))
          .filter((u) => u && u.role !== "admin")

        setUsers(mapped)
      } catch (e) {
        console.error("❌ UserListTable.fetchUsers Error:", e)
        setError(e?.response?.data?.message || "Tải danh sách người dùng thất bại")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const okRole =
        (filterRoles.length === 0 || filterRoles.includes(u.role)) &&
        (roleFilter === "all" ? true : u.role === roleFilter)

      const okStatus = statusFilter === "all" || (statusFilter === "active" ? u.isActive : !u.isActive)

      const q = search.trim().toLowerCase()
      const okSearch =
        !q ||
        (u.fullName || "").toLowerCase().includes(q) ||
        (u.phoneNumber || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.address || "").toLowerCase().includes(q) ||
        (u.details || "").toLowerCase().includes(q)

      return okRole && okStatus && okSearch
    })
  }, [users, filterRoles, roleFilter, statusFilter, search])

  // Reset page khi filter/search đổi
  useEffect(() => {
    setPage(1)
  }, [roleFilter, statusFilter, search, filterRoles])

  // Pagination computed
  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))

  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  // Clamp page nếu totalPages giảm
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleConfirm = async () => {
    const { userId, isActive, type } = confirmModal

    if (type === "lock") {
      try {
        await adminService.setUserActive(userId, !isActive)
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u)))
        setNotifyModal({
          visible: true,
          message: isActive ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",
          type: "success",
        })
      } catch (err) {
        setNotifyModal({
          visible: true,
          message: err?.response?.data?.message || "Đổi trạng thái thất bại",
          type: "error",
        })
      } finally {
        setConfirmModal({ visible: false, userId: null, isActive: null, type: null })
      }
      return
    }

    if (type === "resetPassword") {
      try {
        await adminService.resetUserPassword(userId)
        setNotifyModal({
          visible: true,
          message: "Đã đặt lại mật khẩu về '1'.",
          type: "success",
        })
      } catch (err) {
        setNotifyModal({
          visible: true,
          message: err?.response?.data?.message || "Đặt lại mật khẩu thất bại",
          type: "error",
        })
      } finally {
        setConfirmModal({ visible: false, userId: null, isActive: null, type: null })
      }
    }
  }

  const NotifyModal = ({ visible, message, type, onClose }) => {
    if (!visible) return null
    return (
      <>
        <div className="fixed inset-0 bg-black/30 z-50" />
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 min-w-[320px] max-w-[90vw] text-center ring-1 ring-slate-200">
            <div className={`text-2xl mb-2 ${type === "error" ? "text-rose-500" : "text-emerald-500"}`}>
              {type === "error" ? "❌" : "✅"}
            </div>
            <div className="text-lg font-semibold text-slate-900 mb-4">{message}</div>
            <button
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-sm"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700">
          <p className="font-semibold">⚠ Lỗi</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // danh sách role option (nếu filterRoles rỗng thì show tất cả role phổ biến)
  const roleOptions = filterRoles.length ? filterRoles : ["elderly", "family", "supporter", "doctor"]

  return (
    <div className="min-h-screen relative">
      {/* MODAL THÔNG BÁO */}
      <NotifyModal
        visible={notifyModal.visible}
        message={notifyModal.message}
        type={notifyModal.type}
        onClose={() => setNotifyModal((prev) => ({ ...prev, visible: false }))}
      />

      {/* MODAL XÁC NHẬN */}
      {confirmModal.visible && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-[92vw] max-w-md ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Xác nhận</h2>

              {confirmModal.type === "lock" ? (
                <p className="text-slate-700 mb-6">
                  Bạn có chắc muốn{" "}
                  <span className="font-semibold text-rose-600">{confirmModal.isActive ? "KHÓA" : "MỞ KHÓA"}</span>{" "}
                  tài khoản này không?
                </p>
              ) : (
                <p className="text-slate-700 mb-6">
                  Bạn có chắc muốn đặt lại mật khẩu tài khoản này về{" "}
                  <span className="font-semibold text-indigo-600">'1'</span>?
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModal({ visible: false, userId: null, isActive: null, type: null })}
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CONTENT */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600 mt-2">{description}</p>
          </div>

          {showAddButtons && (
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/supporters/create"
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-sky-700 flex items-center gap-2 shadow-sm"
              >
                <span className="font-bold">+</span>
                <span className="font-semibold">Thêm người hỗ trợ</span>
              </Link>

              <Link
                to="/admin/doctors/create"
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm"
              >
                <span className="font-bold">+</span>
                <span className="font-semibold">Thêm bác sĩ</span>
              </Link>
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400">🔍</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên, email, số điện thoại, địa chỉ..."
                  className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* ROLE FILTER: nếu có filterRoles -> dùng 2 nút tab, không dùng select */}
              {filterRoles.length > 0 ? (
                <RoleTabs roles={filterRoles} value={roleFilter} onChange={setRoleFilter} />
              ) : (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]"
                >
                  <option value="all">Lọc theo vai trò</option>
                  {roleOptions.includes("elderly") && <option value="elderly">Người già</option>}
                  {roleOptions.includes("family") && <option value="family">Người thân gia đình</option>}
                  {roleOptions.includes("supporter") && <option value="supporter">Người hỗ trợ</option>}
                  {roleOptions.includes("doctor") && <option value="doctor">Bác sĩ</option>}
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]"
              >
                <option value="all">Lọc theo trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đang bị khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Danh sách người dùng ({filtered.length})</h3>
            <p className="text-sm text-slate-600 mt-1">Danh sách đầy đủ tất cả người dùng trong hệ thống</p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Không có người dùng phù hợp</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* min-w giúp table không bị bóp gây xuống dòng lạ */}
                <table className="w-full min-w-[980px] divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap w-[170px]">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap w-[170px]">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                        Địa chỉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap w-[110px]">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-slate-100">
                    {pagedData.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                        onClick={() => navigate(getDetailLink(u))}
                        title="Xem chi tiết"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{u.fullName || "N/A"}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {(u.email && u.email !== "N/A" ? u.email : "Chưa có email") +
                              " • " +
                              (u.phoneNumber && u.phoneNumber !== "N/A" ? u.phoneNumber : "Chưa có SĐT")}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 text-xs rounded-full font-semibold whitespace-nowrap leading-none ${roleBadgeStyle(
                              u.role
                            )}`}
                          >
                            {roleLabel(u.role)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 text-xs rounded-full font-semibold whitespace-nowrap leading-none ${activeBadgeStyle(
                              u.isActive
                            )}`}
                          >
                            {u.isActive ? "Đang hoạt động" : "Đang bị khóa"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-800">
                          <span className="line-clamp-2">{u.details}</span>
                        </td>

                        <td
                          className="px-6 py-4"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {u.role === "doctor" && u.role === "supporter" && (
                            <IconButton
                              title="Đặt lại mật khẩu về '1'"
                              onClick={() =>
                                setConfirmModal({
                                  visible: true,
                                  userId: u.id,
                                  isActive: u.isActive,
                                  type: "resetPassword",
                                })
                              }
                            >
                              <PencilIcon />
                            </IconButton>
                            )}

                            <IconButton
                              title={u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              danger={u.isActive}
                              onClick={() =>
                                setConfirmModal({
                                  visible: true,
                                  userId: u.id,
                                  isActive: u.isActive,
                                  type: "lock",
                                })
                              }
                            >
                              {u.isActive ? <LockClosedIcon /> : <LockOpenIcon />}
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-white">
                <div className="text-sm text-slate-600">
                  Hiển thị{" "}
                  <span className="font-semibold text-slate-900">
                    {totalItems === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-900">{Math.min(page * PAGE_SIZE, totalItems)}</span> trong{" "}
                  <span className="font-semibold text-slate-900">{totalItems}</span> người dùng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className={[
                      "px-3 py-2 rounded-xl text-sm font-semibold ring-1 ring-inset transition",
                      page === 1
                        ? "text-slate-400 ring-slate-200 cursor-not-allowed"
                        : "text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    « Đầu
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={[
                      "px-3 py-2 rounded-xl text-sm font-semibold ring-1 ring-inset transition",
                      page === 1
                        ? "text-slate-400 ring-slate-200 cursor-not-allowed"
                        : "text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    ‹ Trước
                  </button>

                  <div className="px-3 py-2 rounded-xl ring-1 ring-slate-200 text-sm font-semibold text-slate-800 bg-slate-50">
                    Trang {page} / {totalPages}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={[
                      "px-3 py-2 rounded-xl text-sm font-semibold ring-1 ring-inset transition",
                      page === totalPages
                        ? "text-slate-400 ring-slate-200 cursor-not-allowed"
                        : "text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Sau ›
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className={[
                      "px-3 py-2 rounded-xl text-sm font-semibold ring-1 ring-inset transition",
                      page === totalPages
                        ? "text-slate-400 ring-slate-200 cursor-not-allowed"
                        : "text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Cuối »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserListTable
