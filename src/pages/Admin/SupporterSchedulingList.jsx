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

const navigate = useNavigate();  // Hook dùng để điều hướng

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

  const formatBookingType = (
    bookingType,
    scheduleDate,
    scheduleTime,
    monthStart,
    monthEnd
  ) => {
    if (bookingType === "session") {
      switch (scheduleTime) {
        case "morning":
          return "Buổi sáng";
        case "afternoon":
          return "Buổi chiều";
        case "evening":
          return "Buổi tối";
        default:
          return "Không xác định";
      }
    }

    if (bookingType === "day") {
      return formatDate(scheduleDate); // Chỉ hiển thị ngày
    }

    if (bookingType === "month") {
      return `${formatDate(monthStart)} - ${formatDate(monthEnd)}`; // Hiển thị thời gian tháng
    }

    return "Không xác định";
  };

const handleRowClick = (id) => {
  // Khi nhấn vào một hàng, sẽ chuyển đến trang chi tiết của lịch
  navigate(`${ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL.replace(":id", id)}`); // Thay history.push bằng navigate
};

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Lịch Hỗ Trợ Viên
      </h1>

      {error && (
        <div className="text-red-500 bg-red-100 border border-red-500 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <span className="text-xl">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border-b">Mã lịch</th>
                <th className="px-4 py-2 text-left border-b">Người hỗ trợ</th>
                <th className="px-4 py-2 text-left border-b">Người cao tuổi</th>
                <th className="px-4 py-2 text-left border-b">Ngày & Giờ</th>
                <th className="px-4 py-2 text-left border-b">Trạng thái</th>
                <th className="px-4 py-2 text-left border-b">Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr
                    key={schedule._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(schedule._id)} // Sự kiện nhấn vào hàng
                  >
                    <td className="px-4 py-2 border-b">{schedule._id}</td>
                    <td className="px-4 py-2 border-b">
                      {schedule.supporter.fullName}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {schedule.elderly.fullName}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {formatBookingType(
                        schedule.bookingType,
                        schedule.scheduleDate,
                        schedule.scheduleTime,
                        schedule.monthStart,
                        schedule.monthEnd
                      )}
                      {schedule.bookingType === "session" &&
                        ` - ${formatDate(schedule.scheduleDate)}`}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${
                          schedule.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : schedule.status === "canceled"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {formatStatus(schedule.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {schedule.paymentStatus === "paid" ? (
                        <span className="text-green-600 font-semibold">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Chưa thanh toán
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-600">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">{`Page ${
              pagination.page
            } of ${Math.ceil(pagination.total / pagination.limit)}`}</span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={
                pagination.page >=
                Math.ceil(pagination.total / pagination.limit)
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupporterSchedulingList;
