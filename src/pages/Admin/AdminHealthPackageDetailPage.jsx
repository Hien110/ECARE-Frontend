"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getHealthPackageDetail } from "../../services/healthPackageService"

export default function AdminHealthPackageDetailPage() {
  const { id } = useParams()
  const [pkg, setPkg] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getHealthPackageDetail(id)
      .then((res) => setPkg(res.data))
      .catch((err) => setError(err?.response?.data?.message || "Lỗi khi lấy chi tiết gói khám"))
  }, [id])

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Có lỗi xảy ra</h3>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  if (!pkg)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{pkg.title}</h1>
            <p className="text-gray-600">Quản lý chi tiết gói khám sức khỏe</p>
          </div>
          <Link
            to="/admin/health-packages"
            className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium shadow-sm hover:shadow-md transition-all hover:bg-gray-50 border border-gray-200 flex items-center gap-2"
          >
            ← Quay lại
          </Link>
        </div>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-semibold">Trạng thái:</span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                pkg.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {pkg.isActive ? "✓ Đang hoạt động" : "✗ Không hoạt động"}
            </span>
          </div>

          {/* Description Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              Mô tả gói
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">{pkg.description}</p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-600 rounded"></span>
              Bảng giá
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Thời hạn</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 text-sm">Giá tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pkg.fees?.map((f, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-900">{f.days} ngày</td>
                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-bold px-3 py-1 rounded-lg">
                          {f.fee?.toLocaleString()} đ
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pkg.customDuration && (
                    <tr className="hover:bg-blue-50 transition-colors bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {pkg.customDuration} ngày <span className="text-xs font-normal text-gray-500">(tuỳ chọn)</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-lg">
                          {pkg.customDurationPrice?.toLocaleString()} đ
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-600 rounded"></span>
              Dịch vụ bao gồm
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Tên dịch vụ</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Mô tả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pkg.service?.map((s, idx) => (
                    <tr key={idx} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                          {s.serviceName}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{s.serviceDescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!pkg.service || pkg.service.length === 0) && (
              <p className="text-center text-gray-500 py-8">Không có dịch vụ nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
