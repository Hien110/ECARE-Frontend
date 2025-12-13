import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import adminService from "../../services/adminService";
import ROUTE_PATH from "../../constants/routePath";

const AdminElderlyDetailPage = () => {
  const [params] = useSearchParams();
  const userId = params.get("id");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consultationSchedules, setConsultationSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setLoadingSchedules(true);

    adminService
      .getUserById(userId)
      .then((res) => setData(res?.data || null))
      .catch((e) => {
        console.error("AdminElderlyDetailPage - Error:", e);
        setError(e?.response?.data?.message || "Tải thông tin thất bại");
      })
      .finally(() => setLoading(false));

    // Lấy danh sách lịch tư vấn
    adminService
      .getConsultationSchedulesByBeneficiary(userId)
      .then((res) => {
        if (res.success) {
          setConsultationSchedules(res.data || []);
        }
      })
      .catch((e) => {
        console.error("Error fetching schedules:", e);
      })
      .finally(() => setLoadingSchedules(false));
  }, [userId]);

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleDateString("vi-VN");
    } catch {
      return iso;
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      confirmed: { text: "Đã xác nhận", color: "blue" },
      in_progress: { text: "Đang thực hiện", color: "purple" },
      completed: { text: "Hoàn thành", color: "green" },
      cancelled: { text: "Đã hủy", color: "red" },
      canceled: { text: "Đã hủy", color: "red" },
    };
    return statusMap[status] || { text: status, color: "gray" };
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
        <div className="text-lg font-medium text-gray-700">Không có dữ liệu</div>
      </div>
    );

  const name = data.fullName || "Người dùng";
  
  const formatPhone = (phone) => {
    if (!phone || phone === "N/A") return "N/A";
    if (phone.startsWith("+84")) return phone;
    if (phone.startsWith("84")) return "+" + phone;
    if (phone.startsWith("0")) return "+84" + phone.slice(1);
    return phone;
  };
  const phone = formatPhone(data.phoneNumber || "N/A");
  const address = data.address || "N/A";
  const currentAddress = data.currentAddress || "N/A";
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : "N/A";
  const age = data.dateOfBirth
    ? Math.max(0, new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear())
    : null;
  const roleLabel =
    data.role === "supporter"
      ? "Người hỗ trợ"
      : data.role === "doctor"
      ? "Bác sĩ"
      : "Người cao tuổi";

  const doctorCompleted = 0;
  const doctorCancelled = 0;
  const supporterCompleted = 0;
  const supporterCancelled = 0;
  const completedCount = consultationSchedules.filter((sch) => sch.status === "completed").length;
  const cancelledCount = consultationSchedules.filter(
    (sch) => sch.status === "cancelled" || sch.status === "canceled"
  ).length;

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
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và lịch sử dịch vụ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main profile card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6 relative z-10">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white overflow-hidden">
                    {data.avatar ? (
                      <img
                        src={data.avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mt-15">{name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                        {roleLabel}
                      </span>
                      {age !== null && (
                        <span className="text-sm text-gray-600 font-medium">{age} tuổi</span>
                      )}

                    </div>
                  </div>

                </div>

                {data.description && (
                  <p className="text-gray-700 leading-relaxed mb-6">{data.description}</p>
                )}

                {/* Grid thông tin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* 1. Điện thoại */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14. 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Điện thoại
                      </div>
                      <div className="font-semibold text-gray-900 mt-1">{phone}</div>
                    </div>
                  </div>



                  {/* 3. Địa chỉ thường trú */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-pink-100 text-pink-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Địa chỉ thường trú
                      </div>
                      <div className="font-semibold text-gray-900 mt-1 line-clamp-2">{address}</div>
                    </div>
                  </div>

                  {/* 4. Địa chỉ tạm trú */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 012-2h14a2 2 0 012 2v9.382a2 2 0 01-1.553 1.894L15 20a2 2 0 01-2 0z" />
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


        </div>
        {/* === TABS SECTION === */}
        <div className="mt-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lịch tư vấn sức khỏe</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {loadingSchedules ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin mx-auto"></div>
                <div className="text-gray-600 mt-4 font-medium">Đang tải dữ liệu...</div>
              </div>
            ) : consultationSchedules.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {consultationSchedules.map((schedule, idx) => {
                  const statusInfo = getStatusDisplay(schedule.status);
                  const statusColorClasses = {
                    yellow: "bg-yellow-100 text-yellow-800",
                    blue: "bg-blue-100 text-blue-800",
                    purple: "bg-purple-100 text-purple-800",
                    green: "bg-green-100 text-green-800",
                    red: "bg-red-100 text-red-800",
                    gray: "bg-gray-100 text-gray-800",
                  };

                  return (
                    <Link
                      key={schedule._id || idx}
                      to={ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES + "/" + schedule._id}
                      className="block p-6 hover:bg-blue-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 border border-blue-200">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                {formatDate(schedule.scheduledDate)} - {schedule.slot === "morning" ? "Buổi sáng" : "Buổi chiều"}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Đăng ký bởi: <span className="font-medium">{schedule.registrant?.fullName || "N/A"}</span>
                              </p>
                            </div>
                          </div>
                          <div className="ml-11 text-sm text-gray-600 space-y-1">
                            <div>
                              <span className="font-medium">Bác sĩ:</span> {schedule.doctor?.fullName || "Chưa gán"}
                            </div>
                            <div>
                              <span className="font-medium">Giá:</span> {schedule.price?.toLocaleString("vi-VN")} VND
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusColorClasses[statusInfo.color]}`}>
                            {statusInfo.text}
                          </span>
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            schedule.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                            schedule.paymentStatus === "refunded" ? "bg-gray-100 text-gray-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {schedule.paymentStatus === "paid" ? "Đã thanh toán" :
                             schedule.paymentStatus === "refunded" ? "Đã hoàn tiền" :
                             "Chưa thanh toán"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="font-medium text-gray-500">
                  Chưa có lịch tư vấn nào.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminElderlyDetailPage;
