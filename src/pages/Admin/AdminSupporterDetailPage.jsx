import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import adminService from "../../services/adminService";
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
        const res = await adminService.getSupporterSchedulesById(userId);
        console.log("Kết quả", res);
        
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
  <div className="min-h-screen bg-white py-8">
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Chi tiết người hỗ trợ
        </h1>
        <p className="text-slate-600">
          Thông tin chi tiết về người hỗ trợ trong hệ thống
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={[
            "mb-6 p-4 rounded-xl border",
            message.includes("thành công") || message.includes("Đã")
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200",
          ].join(" ")}
        >
          {message}
        </div>
      )}

      {/* ===== TOP SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card header strip */}
            <div className="h-14" />

            <div className="p-6 -mt-10">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center">
                  {data.avatar ? (
                    <img
                      src={data.avatar}
                      alt={data.fullName || "Supporter"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xl">
                      {(data.fullName || "N A")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-slate-900 truncate">
                        {data.fullName || "N/A"}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200">
                          Người hỗ trợ
                        </span>

                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                          {data.experience?.totalYears ?? 0} năm kinh nghiệm
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <svg
                          className="w-4 h-4 text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="whitespace-nowrap">
                          {data.ratingStats?.averageRating || 0} (
                          {data.ratingStats?.totalRatings || 0} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-5 text-slate-700 leading-relaxed">
                    {data.experience?.description ||
                      `Có ${
                        data.experience?.totalYears || 0
                      } năm kinh nghiệm chăm sóc người cao tuổi, chuyên về hỗ trợ sinh hoạt hàng ngày, chăm sóc sức khỏe và đồng hành tâm lý.`}
                  </div>
                </div>
              </div>

              {/* Contact cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Số điện thoại</div>
                    <div className="font-semibold text-slate-900 mt-1 whitespace-nowrap">
                      +{data.phoneNumber || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Email</div>
                    <div className="font-semibold text-slate-900 mt-1 truncate">
                      {data.email || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="p-3 rounded-xl bg-violet-100 text-violet-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">Ngày sinh</div>
                    <div className="font-semibold text-slate-900 mt-1">
                      {data.dateOfBirth
                        ? new Date(data.dateOfBirth).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                  <div className="p-3 rounded-xl bg-sky-100 text-sky-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Địa chỉ</div>
                    <div className="font-semibold text-slate-900 mt-1 break-words">
                      {data.address || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats (right) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="text-sm font-semibold text-slate-600 mb-3">
              Thống kê
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-3xl font-bold text-emerald-700">
                  {supporterCompletedCount}
                </div>
                <div className="text-xs font-semibold text-emerald-800 mt-1">
                  Hoàn thành
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-3xl font-bold text-rose-700">
                  {supporterCanceledCount}
                </div>
                <div className="text-xs font-semibold text-rose-800 mt-1">
                  Lịch hủy
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-600">Tổng lịch hẹn</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {supporterSchedules.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SCHEDULES ===== */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Lịch hẹn của {data.fullName}
            </h2>
            <p className="text-slate-600 text-sm">
              Tổng cộng {supporterSchedules.length} lịch hẹn ({supporterCompletedCount} hoàn thành,{" "}
              {supporterCanceledCount} hủy)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {scheduleLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mx-auto" />
              <p className="text-slate-600 mt-4">Đang tải lịch hẹn...</p>
            </div>
          ) : supporterSchedules.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Không có lịch hẹn nào cho supporter này.
            </div>
          ) : (
            <div className="space-y-3">
              {supporterSchedules.map((sch) => {
                const formatDate = (date) =>
                  date ? new Date(date).toLocaleDateString("vi-VN") : "N/A";
                const timeText = `${formatDate(sch.startDate)} → ${formatDate(
                  sch.endDate
                )}`;

                const statusMeta =
                  sch.status === "completed"
                    ? { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", text: "Hoàn thành" }
                    : sch.status === "canceled" || sch.status === "cancelled"
                    ? { cls: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200", text: "Đã hủy" }
                    : sch.status === "confirmed"
                    ? { cls: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200", text: "Đã xác nhận" }
                    : sch.status === "pending"
                    ? { cls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", text: "Chờ xác nhận" }
                    : sch.status === "in_progress"
                    ? { cls: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200", text: "Đang thực hiện" }
                    : { cls: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200", text: sch.status || "N/A" };

                return (
                  <Link
                    key={sch._id}
                    to={ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL.replace(":id", sch._id)}
                    className="block rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-slate-900 truncate">
                          {sch.elderly?.fullName || "Người cao tuổi"}
                        </div>
                        <div className="text-sm text-slate-600 mt-1 truncate">
                          {sch.service?.name || "Dịch vụ hỗ trợ"}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold whitespace-nowrap">
                            Lịch hẹn
                          </span>
                          <span className="whitespace-nowrap">{timeText}</span>
                        </div>
                      </div>

                      <span
                        className={[
                          "inline-flex items-center justify-center",
                          "px-4 py-1.5 rounded-full text-xs font-semibold",
                          "whitespace-nowrap leading-none min-w-[110px]",
                          statusMeta.cls,
                        ].join(" ")}
                      >
                        {statusMeta.text}
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



