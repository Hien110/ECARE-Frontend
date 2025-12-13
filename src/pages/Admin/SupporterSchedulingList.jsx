import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thay useHistory thành useNavigate
import supporterSchedulingService from "../../services/supporterSchedulingService";
import ROUTE_PATH from "../../constants/routePath";

const SupporterSchedulingList = () => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);

      const res = await supporterSchedulingService.getAllSchedulingsForAdmin({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res.success) {
        setSchedules(res.data);
        setPagination(res.pagination);
      } else {
        setError(res.message);
      }

      setLoading(false);
    };

    fetchSchedules();
  }, [pagination.page, pagination.limit]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const formatStatus = (status) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "confirmed":
        return "Đã xác nhận";
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "canceled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "Không xác định";
    const start = new Date(startDate).toLocaleDateString("vi-VN");
    const end = new Date(endDate).toLocaleDateString("vi-VN");
    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  const handleRowClick = (id) => {
    navigate(`${ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL.replace(":id", id)}`);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Lịch Hỗ Trợ Chăm sóc sức khỏe</h1>
        <p className="text-slate-600">Quản lý và theo dõi các lịch hỗ trợ của người hỗ trợ viên</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 text-lg">Đang tải...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800 font-medium">⚠ Lỗi</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người hỗ trợ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người cao tuổi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Dịch vụ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Thời gian</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Thanh toán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schedules.length > 0 ? (
                    schedules.map((schedule, idx) => (
                      <tr
                        key={schedule._id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                        onClick={() => handleRowClick(schedule._id)}
                        title="Xem chi tiết"
                      >
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {(pagination.page - 1) * pagination.limit + idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{schedule.supporter.fullName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{schedule.elderly.fullName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {schedule.service?.name || "Không xác định"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {formatDateRange(schedule.startDate, schedule.endDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(schedule.status)}`}>
                            {formatStatus(schedule.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            schedule.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {schedule.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow p-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ← Trước
            </button>
            <span className="text-slate-700 font-medium">
              Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Sau →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SupporterSchedulingList;
