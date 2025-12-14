"use client"

import { useEffect, useState } from "react"
import adminService from "../../services/adminService"
import { useNavigate } from "react-router-dom"
import ROUTE_PATH from "../../constants/routePath"

const HealthConsultationSchedulesPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const navigate = useNavigate()

  const roleLabel = (role) => {
    const map = {
      doctor: "Bác sĩ",
      elderly: "Người già",
      family: "Người thân gia đình",
    }
    return map[role] || role || ""
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("vi-VN")
  }

  const getStatusBadgeStyle = (status) => {
    const map = {
      confirmed: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
      in_progress: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      completed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      cancelled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    }
    return map[status] || "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200"
  }

  const getStatusText = (status) => {
    const map = {
      confirmed: "Đã xác nhận",
      in_progress: "Đang thực hiện",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    }
    return map[status] || status
  }

  const getSlotBadgeStyle = (slot) => {
    if (slot === "morning") return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200"
    return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200"
  }

  const fetchSchedules = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminService.getRegisteredPackages({ page, limit })
      if (res.success && res.data) {
        setItems(res.data.items || [])
        setTotal(res.data.total || 0)
      } else {
        setError(res.message || "Lỗi khi tải dữ liệu")
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit])

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Danh sách đặt lịch tư vấn sức khỏe</h1>
        <p className="text-slate-600">Quản lý và theo dõi các lịch tư vấn sức khỏe đã đặt</p>
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
                  <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Bác sĩ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người cao tuổi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người đăng ký</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày khám</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Buổi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr
                      key={item._id}
                      className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`${ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES}/${item._id}`)}
                      title="Xem chi tiết"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700 font-semibold">
                        {(page - 1) * limit + idx + 1}
                      </td>

                      {/* Bác sĩ */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.doctor?.fullName || "N/A"}</div>
                        <div className="mt-1">
                          {item.doctor?.role ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                              {roleLabel(item.doctor.role)}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Người hưởng */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.beneficiary?.fullName || "N/A"}</div>
                        <div className="mt-1">
                          {item.beneficiary?.role ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                              {roleLabel(item.beneficiary.role)}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Người đăng ký */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.registrant?.fullName || "N/A"}</div>
                        <div className="mt-1">
                          {item.registrant?.role ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                              {roleLabel(item.registrant.role)}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Ngày lịch */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(item.scheduledDate)}
                      </td>

                      {/* Buổi */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${getSlotBadgeStyle(item.slot)}`}>
                          {item.slot === "morning" ? "Sáng" : "Chiều"}
                        </span>
                      </td>

                      {/* Giá */}
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {item.price?.toLocaleString("vi-VN") || "N/A"} VND
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadgeStyle(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {items.length === 0 && (
                <div className="p-10 text-center text-slate-600">Chưa có lịch tư vấn nào.</div>
              )}
            </div>
          </div>

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
        </>
      )}
    </div>
  )
}

export default HealthConsultationSchedulesPage
