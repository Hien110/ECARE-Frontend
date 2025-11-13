import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";

// Helper function to get details based on role
const getDetailsByRole = (user) => {
  if (user.address && user.address !== "N/A") {
    return user.address;
  }
  return "Address N/A";
};

// Local helper to map role codes to display labels (Vietnamese)
const roleLabel = (role) => {
  if (!role) return "N/A";
  switch (role) {
    case "elderly":
      return "Người Cao Tuổi";
    case "supporter":
      return "Cộng Tác Viên";
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

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getAllUsers();
        console.log("🔍 AdminUserListPage - Raw API response:", res);
        const data = res?.data || [];
        console.log("🔍 AdminUserListPage - Users data:", data);
        
        const mapped = data
          .map((u) => {
          console.log("🔍 AdminUserListPage - Processing user:", {
            id: u._id || u.id,
            fullName: u.fullName,
            email: u.email,
            phoneNumber: u.phoneNumber,
            address: u.address,
            emailEnc: u.emailEnc,
            phoneNumberEnc: u.phoneNumberEnc,
            addressEnc: u.addressEnc
          });
          
          return {
            id: u._id || u.id,
            fullName: u.fullName,
            role: u.role,
            isActive: u.isActive,
            phoneNumber: u.phoneNumber || "N/A",
            email: u.email || "N/A",
            address: u.address || "N/A",
            createdAt: u.createdAt,
            gender: u.gender,
            // Add details based on role
            details: getDetailsByRole(u),
          };
          })
          // Exclude admin accounts from the list shown in UI
          .filter((u) => u && u.role !== "admin");
        
        console.log("🔍 AdminUserListPage - Mapped users:", mapped);
        setUsers(mapped);
      } catch (e) {
        console.error("❌ AdminUserListPage - Error:", e);
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
      const okRole = roleFilter === "all" || u.role === roleFilter;
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
  }, [users, roleFilter, statusFilter, search]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    return {
      totalResidents: users.filter((u) => u.role === "elderly").length,
      activeStaff: users.filter((u) => u.role === "supporter" && u.isActive)
        .length,
      familyMembers: users.filter((u) => u.role === "family").length,
      doctors: users.filter((u) => u.role === "doctor").length,
    };
  }, [users]);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Danh Sách Người Dùng</h2>
            <p className="text-gray-600 mt-1">
              Quản Lý Người Dùng Trong Hệ Thống
            </p>
          </div>
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Người Cao Tuổi
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalResidents}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Thành Viên Gia Đình
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.familyMembers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Cộng Tác Viên
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeStaff}
                </p>
              </div>
            </div>
          </div>       
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Bác Sĩ
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.doctors}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
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
                  placeholder="Tímd kiếm theo tên, email, số điện thoại, địa chỉ..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Filter by role</option>
                <option value="elderly">Người Cao Tuổi</option>
                <option value="supporter">Cộng Tác Viên</option>
                <option value="family">Thành Viên Gia Đình</option>
                <option value="doctor">Bác Sĩ</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Filter by status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Directory */}
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
              No users found matching your criteria
            </div>
          ) : (
            <div>
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người Dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai Trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông Tin Chi Tiết
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày Tham Gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {u.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            u.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {u.role === "doctor" ? (
                            <Link
                              to={`/admin/doctors/view?id=${u.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              👁️
                            </Link>
                          ) : u.role === "elderly" ? (
                            <Link
                              to={`/admin/elderly/view?id=${u.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              👁️
                            </Link>
                          ) : u.role === "supporter" ? (
                            <Link
                              to={`/admin/supporters/view?id=${u.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              👁️
                            </Link>
                          ) : u.role === "family" ? (
                            <Link
                              to={`/admin/family/view?id=${u.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              👁️
                            </Link>
                          ) : (
                            <Link
                              to={`/admin/users/view?id=${u.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              👁️
                            </Link>
                          )}
                          <span className="text-gray-400 cursor-pointer hover:text-gray-600">
                            ✏️
                          </span>
                          <span className="text-gray-400 cursor-pointer hover:text-gray-600">
                            🔒
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserListPage;
