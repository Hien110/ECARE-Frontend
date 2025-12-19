import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // UI states
  const [statusTab, setStatusTab] = useState("all"); // all | pending | confirmed | in_progress | completed | canceled
  const [search, setSearch] = useState("");
  const [dateSort, setDateSort] = useState("desc"); // desc (gần nhất) | asc (xa nhất)

  const navigate = useNavigate();

  const STATUS_TABS = [
    { key: "all", label: "Tất cả" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "in_progress", label: "Đang thực hiện" },
    { key: "completed", label: "Hoàn thành" },
  ];

  const MORE_STATUS = [{ key: "canceled", label: "Đã hủy" }];

  const statusTabButtonClass = (active) =>
    [
      "px-4 py-2 rounded-xl text-sm font-semibold transition ring-1 ring-inset",
      active
        ? "bg-blue-600 text-white ring-blue-600 shadow-sm"
        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
    ].join(" ");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await supporterSchedulingService.getAllSchedulingsForAdmin({
          page: pagination.page,
          limit: pagination.limit,
        });

        if (res.success) {
          setSchedules(res.data || []);
          setPagination(res.pagination);
        } else {
          setError(res.message || "Lỗi khi tải dữ liệu");
        }
      } catch (e) {
        setError(e?.message || "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    const fetchAllSchedules = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await supporterSchedulingService.getAllSchedulingsForAdmin({ page: 1, limit: 100000 });
        if (res.success) {
          setSchedules(res.data || []);
          setPagination((prev) => ({ ...prev, total: res.pagination?.total || (res.data || []).length }));
        } else {
          setError(res.message || "Lỗi khi tải dữ liệu");
        }
      } catch (e) {
        setError(e?.message || "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    const hasFilter = statusTab !== "all" || search.trim() !== "" || dateSort !== "desc";
    if (hasFilter) {
      fetchAllSchedules();
    } else {
      fetchSchedules();
    }
  }, [pagination.page, pagination.limit]);

  // đổi filter/search/sort -> quay về trang 1 cho hợp lý (FE filter)
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab, search, dateSort]);

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
    return start === end ? start : `${start} - ${end}`;
  };

  const handleRowClick = (id) => {
    navigate(
      `${ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL.replace(":id", id)}`
    );
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      confirmed: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
      in_progress:
        "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
      completed:
        "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      canceled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    };
    return (
      colors[status] ||
      "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200"
    );
  };

  const paymentBadge = (paymentStatus) => {
    if (paymentStatus === "paid")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
  };

  // filter/search/sort FE on current page data
  const filteredSchedules = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...schedules];

    // status
    if (statusTab !== "all") {
      if (statusTab === "need_refund") {
        // need refund = canceled appointments that were already paid
        list = list.filter((x) => x.status === "canceled" && x.paymentStatus === "paid");
      } else {
        list = list.filter((x) => x.status === statusTab);
      }
    }

    // search: supporter name / elderly name / service name
    if (q) {
      list = list.filter((x) => {
        const supporterName = (x.supporter?.fullName || "").toLowerCase();
        const elderlyName = (x.elderly?.fullName || "").toLowerCase();
        const serviceName = (x.service?.name || "").toLowerCase();
        return (
          supporterName.includes(q) ||
          elderlyName.includes(q) ||
          serviceName.includes(q)
        );
      });
    }

    // sort by startDate
    list.sort((a, b) => {
      const ta = a?.startDate ? new Date(a.startDate).getTime() : 0;
      const tb = b?.startDate ? new Date(b.startDate).getTime() : 0;
      return dateSort === "desc" ? tb - ta : ta - tb;
    });

    return list;
  }, [schedules, statusTab, search, dateSort]);

  const isClientFiltering = statusTab !== "all" || search.trim() !== "" || dateSort !== "desc";

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.total || 0) / (pagination.limit || 20))
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Lịch Hỗ Trợ Chăm sóc sức khỏe
        </h1>
        <p className="text-slate-600">
          Quản lý và theo dõi các lịch hỗ trợ của người hỗ trợ viên
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 mb-6">
        <div className="flex  gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search + Sort */}
          <div className="relative w-full ">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400">🔍</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hỗ trợ / tên người cao tuổi / tên dịch vụ..."
              className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Select */}
          <select
            value={statusTab}
            onChange={(e) => setStatusTab(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white min-w-[220px]"
            title="Lọc theo trạng thái"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="need_refund">Cần Hoàn tiền</option>
            <option value="canceled">Đã hủy</option>
          </select>

          <select
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white min-w-[220px]"
            title="Sắp xếp theo ngày bắt đầu"
          >
            <option value="desc">Ngày bắt đầu: Gần nhất → Xa nhất</option>
            <option value="asc">Ngày bắt đầu: Xa nhất → Gần nhất</option>
          </select>
        </div>
      </div>

      {/* Tổng số kết quả */}
      <div className="mb-4">
        {isClientFiltering ? (
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold">{filteredSchedules.length}</span> kết quả
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            Tổng: <span className="font-semibold">{pagination.total || schedules.length}</span> lịch
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 text-lg">Đang tải...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
          <p className="text-rose-800 font-semibold">⚠ Lỗi</p>
          <p className="text-rose-700 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Người hỗ trợ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Người cao tuổi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Dịch vụ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Thanh toán
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((schedule, idx) => (
                      <tr
                        key={schedule._id}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(schedule._id)}
                        title="Xem chi tiết"
                      >
                        <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                          {isClientFiltering ? idx + 1 : (pagination.page - 1) * pagination.limit + idx + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {schedule.supporter?.fullName || "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {schedule.elderly?.fullName || "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {schedule.service?.name || "Không xác định"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {formatDateRange(
                            schedule.startDate,
                            schedule.endDate
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              schedule.status
                            )}`}
                          >
                            {formatStatus(schedule.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${paymentBadge(
                              schedule.paymentStatus
                            )}`}
                          >
                            {schedule.paymentStatus === "paid"
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        Không có lịch phù hợp với bộ lọc/tìm kiếm hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!isClientFiltering && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
              >
                ← Trước
              </button>

              <span className="text-slate-700 font-semibold">
                Trang {pagination.page} / {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupporterSchedulingList;
