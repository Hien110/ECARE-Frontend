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
  }, [page, limit])

  const navigate = useNavigate()

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("vi-VN")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Danh sách đặt lịch tư vấn sức khỏe</h1>
        <p className="text-slate-600">Quản lý và theo dõi các lịch tư vấn sức khỏe đã đặt</p>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold">Bác sĩ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người hưởng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người đăng ký</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Thời hạn</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày đăng ký</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr
                      key={item._id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`${ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES}/${item._id}`)}
                      title="Xem chi tiết"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{(page - 1) * limit + idx + 1}</td>
                      
                      {/* Bác sĩ */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.doctor?.fullName || "N/A"}</div>
                        <div className="text-xs text-slate-500">{item.doctor?.role || ""}</div>
                      </td>

                      {/* Người hưởng */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.beneficiary?.fullName || "N/A"}</div>
                        <div className="text-xs text-slate-500">{item.beneficiary?.role || ""}</div>
                      </td>

                      {/* Người đăng ký */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{item.registrant?.fullName || "N/A"}</div>
                        <div className="text-xs text-slate-500">{item.registrant?.role || ""}</div>
                      </td>

                      {/* Thời hạn (ngày) */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.durationDays || "N/A"} ngày
                      </td>

                      {/* Giá */}
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {item.price?.toLocaleString("vi-VN") || "N/A"} VND
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status === "pending" && "Chờ xử lý"}
                          {item.status === "confirmed" && "Đã xác nhận"}
                          {item.status === "in_progress" && "Đang thực hiện"}
                          {item.status === "completed" && "Hoàn thành"}
                          {item.status === "cancelled" && "Đã hủy"}
                        </span>
                      </td>

                      {/* Ngày đăng ký */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {formatDate(item.registeredAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow p-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ← Trước
            </button>
            <span className="text-slate-700 font-medium">
              Trang {page} / {Math.ceil(total / limit)}
            </span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
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
