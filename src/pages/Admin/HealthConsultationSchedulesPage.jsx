"use client";

import { useEffect, useMemo, useState } from "react";
import adminService from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import ROUTE_PATH from "../../constants/routePath";

const HealthConsultationSchedulesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // UI states
  const [statusTab, setStatusTab] = useState("all"); // all | confirmed | in_progress | completed | cancelled
  const [search, setSearch] = useState("");
  const [dateSort, setDateSort] = useState("desc"); // desc (gần nhất) | asc (xa nhất)

  const navigate = useNavigate();

  const roleLabel = (role) => {
    const map = {
      doctor: "Bác sĩ",
      elderly: "Người già",
      family: "Người thân gia đình",
    };
    return map[role] || role || "";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadgeStyle = (status) => {
    const map = {
      confirmed:
        "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
      in_progress:
        "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      completed:
        "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    };
    return (
      map[status] ||
      "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200"
    );
  };

  const getStatusText = (status) => {
    const map = {
      confirmed: "Đã xác nhận",
      // in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  const getPaymentBadgeStyle = (paymentStatus) => {
    const map = {
      paid: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      refund: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
      pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      failed: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      unpaid: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    };
    return map[paymentStatus] || "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
  };

  const getPaymentText = (paymentStatus) => {
    const map = {
      paid: "Đã thanh toán",
      refunded: "Đã hoàn tiền",
      pending: "Chờ thanh toán",
      failed: "Thanh toán thất bại",
      unpaid: "Chưa thanh toán",
    };
    return map[paymentStatus] || paymentStatus || "N/A";
  };

  const getSlotBadgeStyle = (slot) => {
    if (slot === "morning")
      return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
    return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200";
  };

  const STATUS_TABS = [
    { key: "all", label: "Tất cả" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "completed", label: "Hoàn thành" },
  ];

  const MORE_STATUS = [{ key: "cancelled", label: "Đã hủy" }];

  const statusTabButtonClass = (active) =>
    [
      "px-4 py-2 rounded-xl text-sm font-semibold transition ring-1 ring-inset",
      active
        ? "bg-indigo-600 text-white ring-indigo-600 shadow-sm"
        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
    ].join(" ");

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getRegisteredPackages({ page, limit });
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
      } else {
        setError(res.message || "Lỗi khi tải dữ liệu");
      }
    } catch (err) {
      setError(err?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSchedules = async () => {
    // fetch a large limit to get all records for client-side filtering
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getRegisteredPackages({ page: 1, limit: 100000 });
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
      } else {
        setError(res.message || "Lỗi khi tải dữ liệu");
      }
    } catch (err) {
      setError(err?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If any filter/search/sort is active, fetch full dataset so filter applies across all pages.
    const hasFilter = statusTab !== "all" || search.trim() !== "" || dateSort !== "desc";
    if (hasFilter) {
      fetchAllSchedules();
    } else {
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusTab, search, dateSort]);

  // Khi đổi filter/search/sort → quay về trang 1 cho hợp lý (FE filter)
  useEffect(() => {
    // when user changes filters, ensure we show first page of filtered results
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab, search, dateSort]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = [...items];

    // filter by status tab
    if (statusTab !== "all") {
      if (statusTab === "need_refund") {
        // items that were cancelled but already paid -> need refund
        list = list.filter((x) => x.status === "cancelled" && x.paymentStatus === "paid");
      } else {
        list = list.filter((x) => x.status === statusTab);
      }
    }

    // search by names (doctor/beneficiary/registrant)
    if (q) {
      list = list.filter((x) => {
        const doctorName = (x.doctor?.fullName || "").toLowerCase();
        const beneName = (x.beneficiary?.fullName || "").toLowerCase();
        const regName = (x.registrant?.fullName || "").toLowerCase();
        return (
          doctorName.includes(q) || beneName.includes(q) || regName.includes(q)
        );
      });
    }

    // sort by scheduledDate
    list.sort((a, b) => {
      const ta = a?.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
      const tb = b?.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
      return dateSort === "desc" ? tb - ta : ta - tb;
    });

    return list;
  }, [items, statusTab, search, dateSort]);

  const isClientFiltering = statusTab !== "all" || search.trim() !== "" || dateSort !== "desc";

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Danh sách đặt lịch tư vấn sức khỏe
        </h1>
        <p className="text-slate-600">
          Quản lý và theo dõi các lịch tư vấn sức khỏe đã đặt
        </p>
      </div>

      {/* Tổng số kết quả */}
      <div className="mb-4">
        {isClientFiltering ? (
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold">{filteredItems.length}</span> kết quả
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            Tổng: <span className="font-semibold">{total}</span> lịch
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 mb-6">
        <div className="flex gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs status */}
          <div className="flex gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
            {/* Search + sort */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400">🔍</span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên bác sĩ / người cao tuổi / người đăng ký..."
                className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Select */}
            <select
              value={statusTab}
              onChange={(e) => setStatusTab(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white min-w-[220px]"
              title="Lọc theo trạng thái"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="need_refund">Cần Hoàn tiền</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white min-w-[220px]"
              title="Sắp xếp theo ngày khám"
            >
              <option value="desc">Ngày khám: Gần nhất → Xa nhất</option>
              <option value="asc">Ngày khám: Xa nhất → Gần nhất</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
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
                  <tr className="bg-blue-600 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Bác sĩ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Người cao tuổi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Ngày khám
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Buổi
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
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={item._id}
                      className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(
                          `${ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES}/${item._id}`
                        )
                      }
                      title="Xem chi tiết"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                        {isClientFiltering ? idx + 1 : (page - 1) * limit + idx + 1}
                      </td>

                      {/* Bác sĩ */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.doctor?.fullName || "N/A"}
                        </div>
                        {/* <div className="mt-1">
                          {item.doctor?.role ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                              {roleLabel(item.doctor.role)}
                            </span>
                          ) : null}
                        </div> */}
                      </td>

                      {/* Người hưởng */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.beneficiary?.fullName || "N/A"}
                        </div>
                        {/* <div className="mt-1">
                          {item.beneficiary?.role ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                              {roleLabel(item.beneficiary.role)}
                            </span>
                          ) : null}
                        </div> */}
                      </td>

                      {/* Người đăng ký */}
                      {/* <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.registrant?.fullName || "N/A"}
                        </div>
                        <div className="mt-1">
                          {item.registrant?.role ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 whitespace-nowrap">
                              {roleLabel(item.registrant.role)}
                            </span>
                          ) : null}
                        </div>
                      </td> */}

                      {/* Ngày lịch */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(item.scheduledDate)}
                      </td>

                      {/* Buổi */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span
                          className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${getSlotBadgeStyle(
                            item.slot
                          )}`}
                        >
                          {item.slot === "morning" ? "Sáng" : "Chiều"}
                        </span>
                      </td>

                      
                      {/* Trạng thái */}
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
                            item.status
                          )}`}
                        >
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      {/* Thanh toán */}
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getPaymentBadgeStyle(
                            item.paymentStatus
                          )}`}
                        >
                          {getPaymentText(item.paymentStatus)}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredItems.length === 0 && (
                <div className="p-10 text-center text-slate-600">
                  Không có lịch phù hợp với bộ lọc/tìm kiếm hiện tại.
                </div>
              )}
            </div>
          </div>

          {!isClientFiltering && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
              >
                ← Trước
              </button>

              <span className="text-slate-700 font-semibold">
                Trang {page} / {Math.max(1, Math.ceil(total / limit))}
              </span>

              <button
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
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

export default HealthConsultationSchedulesPage;
