"use client"

import { useEffect, useState } from "react"
import adminService from "../../services/adminService"
import { useNavigate } from "react-router-dom"

const RegisteredPackagesPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const fetchPackages = async () => {
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
    fetchPackages()
  }, [page, limit])

  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Danh sách gói khám đã đăng ký</h1>
        <p className="text-slate-600">Quản lý và theo dõi các gói khám được đăng ký</p>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tên gói</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người đăng ký</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Người hưởng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Bác sĩ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày đăng ký</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {items.map((pkg, idx) => (
                    <tr
                      key={pkg._id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`/admin/registered-packages/${pkg._id}`)}
                      title="Xem chi tiết gói khám"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-6 py-4">{pkg.packageRef?.title || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="font-medium">{pkg.registrant?.fullName || "N/A"}</div>
                        <div className="text-xs text-slate-500">{pkg.registrant?.role}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="font-medium">{pkg.beneficiary?.fullName || "N/A"}</div>
                        <div className="text-xs text-slate-500">{pkg.beneficiary?.role}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {pkg.doctor?.fullName ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {pkg.doctor.fullName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Chưa gán
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {pkg.registeredAt ? new Date(pkg.registeredAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {pkg.price?.toLocaleString("vi-VN") || "N/A"} VND
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

export default RegisteredPackagesPage
