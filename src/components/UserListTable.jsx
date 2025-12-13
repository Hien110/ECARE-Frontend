import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../services/adminService";

// Helper function to get details based on role
const getDetailsByRole = (user) => {
  if (user.address && user.address !== "N/A") {
    return user.address;
  }
  return "Address N/A";
};

// Helper function to get detail link based on role
const getDetailLink = (user) => {
  switch (user.role) {
    case "doctor":
      return `/admin/doctors/view?id=${user.id}`;
    case "elderly":
      return `/admin/elderly/view?id=${user.id}`;
    case "supporter":
      return `/admin/supporters/view?id=${user.id}`;
    case "family":
      return `/admin/family/view?id=${user.id}`;
    default:
      return `/admin/users/view?id=${user.id}`;
  }
};

// Local helper to map role codes to display labels
const roleLabel = (role) => {
  if (!role) return "N/A";
  switch (role) {
    case "elderly":
      return "Người Cao Tuổi";
    case "supporter":
      return "Người Hỗ Trợ";
    case "family":
      return "Thành Viên Gia Đình";
    case "doctor":
      return "Bác Sĩ";
    case "admin":
      return "Quản Trị Viên";
    default:
      return role;
  }
};

const UserListTable = ({
  filterRoles = [],
  title = "Danh Sách Người Dùng",
  description = "Quản Lý Người Dùng Trong Hệ Thống",
  showAddButtons = false,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  /** MODAL STATE */
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    userId: null,
    isActive: null,
    type: null, // 'lock', 'resetPassword'
  });
  // State cho thông báo custom
  const [notifyModal, setNotifyModal] = useState({
    visible: false,
    message: "",
    type: "success", // hoặc 'error'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getAllUsers();
        const data = res?.data || [];
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
          .filter((u) => u && u.role !== "admin");
        setUsers(mapped);
      } catch (e) {
        console.error("❌ UserListTable.fetchUsers Error:", e);
        console.error("Response data:", e?.response?.data);
        setError(
          e?.response?.data?.message || "Tải danh sách người dùng thất bại"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const okRole =
        (filterRoles.length === 0 || filterRoles.includes(u.role)) &&
        (roleFilter === "all" || u.role === roleFilter);

      const okStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? u.isActive : !u.isActive);

      const q = search.trim().toLowerCase();
      const okSearch =
        !q ||
        (u.fullName || "").toLowerCase().includes(q) ||
        (u.phoneNumber || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.address || "").toLowerCase().includes(q) ||
        (u.details || "").toLowerCase().includes(q);

      return okRole && okStatus && okSearch;
    });
  }, [users, filterRoles, roleFilter, statusFilter, search]);

  /** HANDLE CONFIRM */
  const handleConfirm = async () => {
    const { userId, isActive, type } = confirmModal;
    if (type === "lock") {
      try {
        await adminService.setUserActive(userId, !isActive);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
        );
      } catch (err) {
        setNotifyModal({
          visible: true,
          message: err?.response?.data?.message || "Đổi trạng thái thất bại",
          type: "error",
        });
      } finally {
        setConfirmModal({ visible: false, userId: null, isActive: null, type: null });
      }
    } else if (type === "resetPassword") {
      try {
        await adminService.resetUserPassword(userId);
        setNotifyModal({
          visible: true,
          message: "Đã reset mật khẩu về '1'.",
          type: "success",
        });
      } catch (err) {
        setNotifyModal({
          visible: true,
          message: err?.response?.data?.message || "Reset mật khẩu thất bại",
          type: "error",
        });
      } finally {
        setConfirmModal({ visible: false, userId: null, isActive: null, type: null });
      }
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  // Modal thông báo custom
  const NotifyModal = ({ visible, message, type, onClose }) => {
    if (!visible) return null;
    return (
      <>
        <div className="fixed inset-0 bg-black/30 z-50"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 min-w-[300px] max-w-[90vw] text-center">
            <div className={`text-2xl mb-2 ${type === "error" ? "text-red-500" : "text-green-500"}`}>
              {type === "error" ? "❌" : "✅"}
            </div>
            <div className="text-lg font-semibold mb-4">{message}</div>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* MODAL THÔNG BÁO */}
      <NotifyModal
        visible={notifyModal.visible}
        message={notifyModal.message}
        type={notifyModal.type}
        onClose={() => setNotifyModal({ ...notifyModal, visible: false })}
      />

      {/* MODAL CONFIRM */}
      {confirmModal.visible && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Xác Nhận</h2>
              {confirmModal.type === "lock" ? (
                <p className="text-gray-700 mb-6">
                  Bạn có chắc muốn{" "}
                  <span className="font-semibold text-red-600">
                    {confirmModal.isActive ? "KHÓA" : "MỞ KHÓA"}
                  </span>{" "}
                  tài khoản này không?
                </p>
              ) : (
                <p className="text-gray-700 mb-6">
                  Bạn có chắc muốn reset mật khẩu tài khoản này về <span className="font-semibold text-blue-600">'1'</span>?
                </p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setConfirmModal({
                      visible: false,
                      userId: null,
                      isActive: null,
                      type: null,
                    })
                  }
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>

          {showAddButtons && (
            <div className="flex space-x-3">
              <Link
                to="/admin/supporters/create"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <span>+</span>
                <span>Thêm Cộng Tác Viên</span>
              </Link>

              <Link
                to="/admin/doctors/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>+</span>
                <span>Thêm Bác Sĩ</span>
              </Link>
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên, email, số điện thoại, địa chỉ..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Lọc Theo Vai Trò</option>
                {filterRoles.includes("elderly") && (
                  <option value="elderly">Người Cao Tuổi</option>
                )}
                {filterRoles.includes("supporter") && (
                  <option value="supporter">Cộng Tác Viên</option>
                )}
                {filterRoles.includes("family") && (
                  <option value="family">Thành Viên Gia Đình</option>
                )}
                {filterRoles.includes("doctor") && (
                  <option value="doctor">Bác Sĩ</option>
                )}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Lọc Theo Trạng Thái</option>
                <option value="active">Đã Kích Hoạt</option>
                <option value="inactive">Không Kích Hoạt</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Thư Mục Người Dùng
            </h3>
            <p className="text-sm text-gray-600">
              Danh sách đầy đủ tất cả người dùng trong hệ thống
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có người dùng phù hợp
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Người Dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vai Trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thông Tin Chi Tiết
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày Tham Gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((u) => (
                  <Link
                    key={u.id}
                    to={getDetailLink(u)}
                    className="table-row hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {u.fullName}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full font-semibold ${
                          u.role === "elderly"
                            ? "bg-blue-100 text-blue-800"
                            : u.role === "supporter"
                            ? "bg-green-100 text-green-800"
                            : u.role === "family"
                            ? "bg-purple-100 text-purple-800"
                            : u.role === "doctor"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {roleLabel(u.role)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full font-semibold ${
                          u.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {u.details}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td 
                      className="px-6 py-4 text-sm font-medium"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex space-x-3">
                        {/* EDIT ICON - Reset Password */}
                        <span
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          title="Reset mật khẩu về '1'"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setConfirmModal({
                              visible: true,
                              userId: u.id,
                              isActive: u.isActive,
                              type: "resetPassword",
                            });
                          }}
                        >
                          ✏️
                        </span>

                        {/* LOCK / UNLOCK WITH MODAL */}
                        <span
                          className={`cursor-pointer hover:text-gray-700 ${
                            u.isActive ? "text-gray-500" : "opacity-60"
                          }`}
                          title={
                            u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setConfirmModal({
                              visible: true,
                              userId: u.id,
                              isActive: u.isActive,
                              type: "lock",
                            });
                          }}
                        >
                          🔒
                        </span>
                      </div>
                    </td>
                  </Link>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListTable;
