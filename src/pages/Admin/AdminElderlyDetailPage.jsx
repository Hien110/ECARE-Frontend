import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import adminService from "../../services/adminService";
import {
  getUsedPackagesByBeneficiary,
  getRegisteredPackagesByRegistrant,
  getSupporterSchedulesByElderly,
} from "../../services/healthPackageService";
import ROUTE_PATH from "../../constants/routePath";

const AdminElderlyDetailPage = () => {
  const [params] = useSearchParams();
  const userId = params.get("id");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usedPackages, setUsedPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [registeredPackages, setRegisteredPackages] = useState([]);
  const [supporterSchedules, setSupporterSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("used"); // "used" | "doctor" | "supporter"

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setLoadingPackages(true);
    setLoadingSchedules(true);

    // Fetch user info
    adminService
      .getUserById(userId)
      .then((res) => setData(res?.data || null))
      .catch((e) => {
        console.error("AdminElderlyDetailPage - Error:", e);
        setError(e?.response?.data?.message || "Tải thông tin thất bại");
      })
      .finally(() => setLoading(false));

    // Fetch used packages
    getUsedPackagesByBeneficiary(userId)
      .then((res) => {
        if (res.success) setUsedPackages(res.data || []);
        else setUsedPackages([]);
      })
      .catch(() => setUsedPackages([]))
      .finally(() => setLoadingPackages(false));

    // Fetch registered packages
    getRegisteredPackagesByRegistrant(userId)
      .then((res) => {
        if (res.success) setRegisteredPackages(res.data || []);
        else setRegisteredPackages([]);
      })
      .catch(() => setRegisteredPackages([]));

    // Fetch supporter schedules
    getSupporterSchedulesByElderly(userId)
      .then((res) => {
        if (res.success) setSupporterSchedules(res.data || []);
        else setSupporterSchedules([]);
      })
      .catch(() => setSupporterSchedules([]))
      .finally(() => setLoadingSchedules(false));
  }, [userId]);

  // Lấy người đăng ký đầu tiên (nếu có) từ registeredPackages
  const firstRegistrant =
    registeredPackages.length > 0 ? registeredPackages[0].registrant : null;

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("vi-VN");
    } catch {
      return iso;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg font-medium text-gray-700">Đang tải...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg font-medium text-red-600">{error}</div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-lg font-medium text-gray-700">
          Không có dữ liệu
        </div>
      </div>
    );

  const name = data.fullName || "Người dùng";
  const phone = data.phoneNumber || "N/A";
  const email = data.email || "N/A";
  const address = data.address || "N/A";
  const currentAddress = data.currentAddress || "N/A";
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : "N/A";
  const age = data.dateOfBirth
    ? Math.max(
        0,
        new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
      )
    : null;
  const roleLabel =
    data.role === "supporter"
      ? "Người hỗ trợ"
      : data.role === "doctor"
      ? "Bác sĩ"
      : "Người cao tuổi";
  // Tính số lượng hoàn thành và hủy dựa trên trạng thái các đơn bác sĩ và supporter
  const doctorCompleted = registeredPackages.filter(
    (pkg) => pkg.status === "completed"
  ).length;
  const doctorCancelled = registeredPackages.filter(
    (pkg) => pkg.status === "canceled" || pkg.status === "cancelled"
  ).length;
  const supporterCompleted = supporterSchedules.filter(
    (sch) => sch.status === "completed"
  ).length;
  const supporterCancelled = supporterSchedules.filter(
    (sch) => sch.status === "canceled" || sch.status === "cancelled"
  ).length;
  const completedCount = doctorCompleted + supporterCompleted;
  const cancelledCount = doctorCancelled + supporterCancelled;
  const emergencyContact = data.emergencyContact || {
    name: data.emergencyName || null,
    phone: data.emergencyPhone || data.emergencyContactPhone || null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chi tiết người cao tuổi
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin cá nhân và lịch sử dịch vụ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main profile card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6 relative z-10">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mt-15">
                      {name}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                        {roleLabel}
                      </span>
                      {age !== null && (
                        <span className="text-sm text-gray-600 font-medium">
                          {age} tuổi
                        </span>
                      )}
                      {firstRegistrant && (
                        <span className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                          Người đăng ký: {firstRegistrant.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 text-center">
                      <div className="text-sm text-gray-600 font-medium">
                        Hoàn thành
                      </div>
                      <div className="text-2xl font-bold text-green-600 mt-1">
                        {completedCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex-1 sm:flex-none bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-red-200 text-center">
                      <div className="text-sm text-gray-600 font-medium">
                        Lịch hủy
                      </div>
                      <div className="text-2xl font-bold text-red-600 mt-1">
                        {cancelledCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {data.description && (
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {data.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Điện thoại
                      </div>
                      <div className="font-semibold text-gray-900 mt-1">
                        {phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Email
                      </div>
                      <div className="font-semibold text-gray-900 mt-1">
                        {email}
                      </div>
                    </div>
                  </div>


                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-pink-100 text-pink-600 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Địa chỉ
                      </div>
                      <div className="font-semibold text-gray-900 mt-1 line-clamp-2">
                        {address}
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ tạm trú */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 012-2h14a2 2 0 012 2v9.382a2 2 0 01-1.553 1.894L15 20a2 2 0 01-2 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Địa chỉ tạm trú
                      </div>
                      <div className="font-semibold text-gray-900 mt-1 line-clamp-2">
                        {currentAddress}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-violet-100 text-violet-600 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Liên hệ khẩn cấp
                      </div>
                      <div className="font-semibold text-gray-900 mt-1">
                        {emergencyContact?.name
                          ? `${emergencyContact.name}`
                          : emergencyContact?.phone ?? "N/A"}
                      </div>
                      {emergencyContact?.phone && (
                        <div className="text-sm text-gray-600 mt-0.5">
                          {emergencyContact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày sinh:</span>
                    <span className="font-semibold text-gray-900">{dob}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Trạng thái tài khoản
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={`h-4 w-4 rounded-full ${
                      data.isActive
                        ? "bg-green-500 shadow-lg shadow-green-500/50"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  <span
                    className={`text-lg font-bold ${
                      data.isActive ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {data.isActive ? "Đang hoạt động" : "Đã bị khóa"}
                  </span>
                </div>
              </div>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  data.isActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {data.isActive ? "Khóa tài khoản" : "Mở khóa"}
              </button>
            </div>
          </div>
        </div>

        {/* === TABS SECTION === */}
        <div className="mt-10">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("used")}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-px ${
                activeTab === "used"
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Lịch sử gói khám với Bác Sĩ
            </button>
            <button
              onClick={() => setActiveTab("supporter")}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-px ${
                activeTab === "supporter"
                  ? "border-indigo-600 text-indigo-700 bg-indigo-50"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Lịch hẹn với người hỗ trợ
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Tab 1: Used Packages */}
            {activeTab === "used" && (
              <div className="p-6">
                {loadingPackages ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin mx-auto"></div>
                    <div className="text-gray-600 mt-4 font-medium">
                      Đang tải dữ liệu...
                    </div>
                  </div>
                ) : usedPackages.length > 0 ? (
                  <div className="space-y-4">
                    {usedPackages.map((pkg, idx) => (
                      <div
                        key={pkg._id || idx}
                        className="group relative rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 group-hover:w-2 transition-all"></div>
                        <div className="p-5 pl-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200 text-sm font-bold text-blue-600">
                                  {idx + 1}
                                </div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                  {pkg.packageRef?.title ||
                                    "Gói khám không xác định"}
                                </h4>
                              </div>
                              <div className="text-sm text-gray-600 ml-12">
                                Đăng ký bởi:{" "}
                                <span className="font-medium text-gray-900">
                                  {pkg.registrant?.fullName || "-"}
                                </span>
                                {pkg.durationDays && (
                                  <span className="ml-3 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                                    {pkg.durationDays} ngày
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 hidden sm:inline">
                                  BS:
                                </span>
                                {pkg.doctor?.fullName ? (
                                  <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200">
                                    {pkg.doctor.fullName}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs">
                                    Chưa gán
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-600">
                                Ngày:{" "}
                                {pkg.registeredAt
                                  ? formatDate(pkg.registeredAt)
                                  : "N/A"}
                              </div>
                              <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                {pkg.price
                                  ? pkg.price.toLocaleString("vi-VN") + " đ"
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <svg
                      className="w-20 h-20 mx-auto text-gray-200 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="font-medium">
                      Chưa có gói khám nào đã sử dụng.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Lịch hẹn bác sĩ */}
            {activeTab === "doctor" && (
              <div className="p-6">
                {registeredPackages.filter((p) => p.doctor).length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <svg
                      className="w-20 h-20 mx-auto text-gray-200 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="font-medium">
                      Chưa có lịch hẹn với bác sĩ nào.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registeredPackages
                      .filter((pkg) => pkg.doctor)
                      .map((pkg, idx) => (
                        <div
                          key={pkg._id || idx}
                          className="border border-emerald-100 rounded-xl p-5 bg-emerald-50/30 hover:bg-emerald-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg text-emerald-800">
                                {pkg.packageRef?.title || "Gói khám"}
                              </h4>
                              <div className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">
                                  Bác sĩ phụ trách:
                                </span>{" "}
                                {pkg.doctor?.fullName || "Chưa chỉ định"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Đăng ký ngày:{" "}
                                {pkg.registeredAt
                                  ? formatDate(pkg.registeredAt)
                                  : "N/A"}
                              </div>
                            </div>
                            <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                              {pkg.status === "active"
                                ? "Đang hoạt động"
                                : pkg.status || "Chưa rõ"}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Lịch hẹn supporter */}
            {activeTab === "supporter" && (
              <div className="p-6">
                {loadingSchedules ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-500 animate-spin mx-auto"></div>
                    <div className="text-gray-600 mt-4 font-medium">
                      Đang tải lịch hẹn...
                    </div>
                  </div>
                ) : supporterSchedules.length > 0 ? (
                  <div className="space-y-4">
                    {supporterSchedules.map((sch) => {
                      const formatSession = (s) => {
                        return s === "morning"
                          ? "Buổi sáng"
                          : s === "afternoon"
                          ? "Buổi chiều"
                          : s === "evening"
                          ? "Buổi tối"
                          : s;
                      };

                      const formatDate = (d) =>
                        d ? new Date(d).toLocaleDateString("vi-VN") : "";

                      let timeText = "";
                      if (sch.bookingType === "session") {
                        timeText = `${formatDate(
                          sch.scheduleDate
                        )} - ${formatSession(sch.scheduleTime)}`;
                      } else if (sch.bookingType === "day") {
                        timeText = `Toàn ngày ${formatDate(sch.scheduleDate)}`;
                      } else if (sch.bookingType === "month") {
                        timeText = `Theo tháng: ${formatDate(
                          sch.monthStart
                        )} → ${formatDate(sch.monthEnd)}`;
                      }

                      const typeText =
                        sch.bookingType === "session"
                          ? "Theo buổi"
                          : sch.bookingType === "day"
                          ? "Theo ngày"
                          : sch.bookingType === "month"
                          ? "Theo tháng"
                          : "";

                      return (
                        <Link
                          key={sch._id}
                          to={ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL.replace(
                            ":id",
                            sch._id
                          )}
                          className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                                {sch.supporter?.fullName || "Người hỗ trợ"}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {sch.service?.name ||
                                  "Chăm sóc người già cơ bản"}
                              </div>
                              <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {typeText}
                                </span>
                                <span>{timeText}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <span
                                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                  sch.status === "confirmed"
                                    ? "bg-blue-100 text-blue-700"
                                    : sch.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : sch.status === "canceled"
                                    ? "bg-red-100 text-red-700"
                                    : sch.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {sch.status === "pending" && "Chờ xác nhận"}
                                {sch.status === "confirmed" && "Đã xác nhận"}
                                {sch.status === "completed" && "Hoàn thành"}
                                {sch.status === "canceled" && "Đã hủy"}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <svg
                      className="w-20 h-20 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="font-medium">
                      Chưa có lịch hẹn với người hỗ trợ.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminElderlyDetailPage;
