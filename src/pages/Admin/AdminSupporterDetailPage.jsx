import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import adminService, { getSupporterSchedulesByStatus } from "../../services/adminService";
import ROUTE_PATH from "../../constants/routePath";

const AdminViewSupporterPage = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [supporterSchedules, setSupporterSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  console.log('AdminViewSupporterPage rendered with userId:', userId);


  useEffect(() => {
    const run = async () => {
      try {
        const res = await adminService.getSupporterProfile(userId);
        const formattedData = adminService.formatSupporterData(res?.data || res);
        setData(formattedData);
      } catch (e) {
        setError(e?.response?.data?.message || "Tải hồ sơ thất bại");
      }
    };
    if (userId) run();
  }, [userId]);

  useEffect(() => {
    const fetchSchedules = async () => {
      setScheduleLoading(true);
      try {
        const res = await getSupporterSchedulesByStatus();
        if (res && res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter((item) => {
            const supporterId = item.supporter?._id || item.supporter;
            return supporterId && String(supporterId) === String(userId);
          });
          setSupporterSchedules(filtered);
        } else {
          setSupporterSchedules([]);
        }
      } catch (err) {
        console.error("Failed to fetch supporter schedules", err);
        setSupporterSchedules([]);
      } finally {
        setScheduleLoading(false);
      }
    };
    if (userId) fetchSchedules();
  }, [userId]);



  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin supporter...</p>
        </div>
      </div>
    );
  }

  // Derived values from supporterSchedules
  const supporterCompletedCount = supporterSchedules.filter((sch) => sch.status === "completed").length;
  const supporterCanceledCount = supporterSchedules.filter((sch) => sch.status === "canceled" || sch.status === "cancelled").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết người hỗ trợ</h1>
          <p className="text-gray-600">Thông tin chi tiết về supporter trong hệ thống</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('thành công') || message.includes('Đã')
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Profile Header */}
              <div className="flex items-start space-x-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.fullName || 'N/A'}</h2>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Người Hỗ Trợ
                    </span>
                    <span className="text-gray-600">
                      {data.experience?.totalYears ?? 0} năm kinh nghiệm
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{data.ratingStats?.averageRating || 0} ({data.ratingStats?.totalRatings || 0} đánh giá)</span>
                    </div>
                    <div className="flex items-center space-x-1">

                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">
                  {data.experience?.description || `Có ${data.experience?.totalYears || 0} năm kinh nghiệm chăm sóc người cao tuổi, chuyên về hỗ trợ sinh hoạt hàng ngày, chăm sóc sức khỏe và đồng hành tâm lý.`}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">+{data.phoneNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{data.email || 'N/A'}</p>
                  </div>
                </div>



                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-medium text-gray-900">
                      {data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{data.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{supporterCompletedCount}</div>
                  <div className="text-sm text-gray-600">Dịch vụ hoàn thành</div>
                <div className="flex justify-end mt-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{supporterCanceledCount}</div>
                  <div className="text-sm text-gray-600">Lịch hủy</div>
                <div className="flex justify-end mt-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporter schedules list */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Lịch hẹn của {data.fullName}</h2>
              <p className="text-gray-600 text-sm">
                Tổng cộng {supporterSchedules.length} lịch hẹn ({supporterCompletedCount} hoàn thành, {supporterCanceledCount} hủy)
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {scheduleLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải lịch hẹn...</p>
              </div>
            ) : supporterSchedules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Không có lịch hẹn nào cho supporter này.
              </div>
            ) : (
              <div className="space-y-4">
                {supporterSchedules.map((sch) => {
                  const formatDate = (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "N/A");
                  const startDate = formatDate(sch.startDate);
                  const endDate = formatDate(sch.endDate);
                  const timeText = `${startDate} → ${endDate}`;
                  const statusClass =
                    sch.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : sch.status === "canceled"
                      ? "bg-red-100 text-red-700"
                      : sch.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : sch.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : sch.status === "in_progress"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600";

                  return (
                    <Link
                      key={sch._id}
                      to={ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL.replace(":id", sch._id)}
                      className="block p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {sch.elderly?.fullName || "Người cao tuổi"}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{sch.service?.name || "Dịch vụ hỗ trợ"}</div>
                          <div className="text-xs text-gray-500 mt-2 flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                              Lịch hẹn
                            </span>
                            <span>{timeText}</span>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${statusClass}`}>
                          {sch.status === "pending" && "Chờ xác nhận"}
                          {sch.status === "confirmed" && "Đã xác nhận"}
                          {sch.status === "in_progress" && "Đang thực hiện"}
                          {sch.status === "completed" && "Hoàn thành"}
                          {sch.status === "canceled" && "Đã hủy"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewSupporterPage;



