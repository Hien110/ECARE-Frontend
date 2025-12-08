import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import adminService from "../../services/adminService"
import ROUTE_PATH from "../../constants/routePath"

const HealthConsultationScheduleDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await adminService.getRegisteredPackageById(id)
        if (res.success) {
          setData(res.data)
        } else {
          setError(res.message || "Không lấy được thông tin chi tiết")
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi lấy chi tiết lịch tư vấn")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id])

  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("vi-VN")
  }

  const getStatusDisplay = (status) => {
    const statusMap = {
      confirmed: { text: "Đã xác nhận", color: "blue" },
      in_progress: { text: "Đang thực hiện", color: "purple" },
      completed: { text: "Hoàn thành", color: "green" },
      cancelled: { text: "Đã hủy", color: "red" },
    }
    return statusMap[status] || { text: status, color: "gray" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 text-lg">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              ⚠ {error}
            </div>
            <button
              onClick={() => navigate(ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { doctor, beneficiary, registrant, price, status, registeredAt, scheduledDate, slot, doctorNote, paymentMethod, paymentStatus } = data

  const statusInfo = getStatusDisplay(status)
  const statusColorClasses = {
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES)}
          className="mb-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Quay lại danh sách
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết lịch tư vấn sức khỏe</h1>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusColorClasses[statusInfo.color]}`}>
              {statusInfo.text}
            </span>
          </div>

          {/* Thông tin chung */}
          <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin lịch tư vấn</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 font-medium">Ngày lịch</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(scheduledDate)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Buổi</p>
                <p className="text-lg font-semibold text-gray-900">{slot === "morning" ? "Sáng" : "Chiều"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Giá</p>
                <p className="text-lg font-semibold text-blue-600">{price?.toLocaleString("vi-VN") || "N/A"} VND</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Trạng thái</p>
                <p className="text-lg font-semibold text-gray-900">{statusInfo.text}</p>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin thanh toán</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 font-medium">Phương thức</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Trạng thái thanh toán</p>
                <p className="text-lg font-semibold">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                    paymentStatus === "refunded" ? "bg-gray-100 text-gray-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {paymentStatus === "paid" ? "Đã thanh toán" :
                     paymentStatus === "refunded" ? "Đã hoàn tiền" :
                     "Chưa thanh toán"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Ngày đăng ký</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(registeredAt)}</p>
              </div>
            </div>
          </div>

          {/* Bác sĩ */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin bác sĩ</h2>
            <div className="border border-slate-200 rounded-lg p-6">
              {doctor ? (
                <div className="flex items-center gap-6">
                  {doctor.avatar && (
                    <img
                      src={doctor.avatar}
                      alt={doctor.fullName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{doctor.fullName}</h3>
                    <p className="text-sm text-slate-600">{doctor.role}</p>
                    {doctor.phoneNumber && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">SĐT:</span> {doctor.phoneNumber}
                      </p>
                    )}
                    {doctor.email && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Email:</span> {doctor.email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-600">Chưa có bác sĩ được gán</p>
              )}
            </div>
          </div>

          {/* Người cao tuổi */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin người cao tuổi</h2>
            <div className="border border-slate-200 rounded-lg p-6">
              {beneficiary ? (
                <div className="flex items-center gap-6">
                  {beneficiary.avatar && (
                    <img
                      src={beneficiary.avatar}
                      alt={beneficiary.fullName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{beneficiary.fullName}</h3>
                    <p className="text-sm text-slate-600">{beneficiary.role}</p>
                    {beneficiary.dateOfBirth && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Ngày sinh:</span> {formatDate(beneficiary.dateOfBirth)}
                      </p>
                    )}
                    {beneficiary.phoneNumber && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">SĐT:</span> {beneficiary.phoneNumber}
                      </p>
                    )}
                    {beneficiary.email && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Email:</span> {beneficiary.email}
                      </p>
                    )}
                    {beneficiary.address && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Địa chỉ:</span> {beneficiary.address}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-600">Thông tin người hưởng không available</p>
              )}
            </div>
          </div>

          {/* Người đăng ký */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin người đăng ký</h2>
            <div className="border border-slate-200 rounded-lg p-6">
              {registrant ? (
                <div className="flex items-center gap-6">
                  {registrant.avatar && (
                    <img
                      src={registrant.avatar}
                      alt={registrant.fullName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{registrant.fullName}</h3>
                    <p className="text-sm text-slate-600">{registrant.role}</p>
                    {registrant.phoneNumber && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">SĐT:</span> {registrant.phoneNumber}
                      </p>
                    )}
                    {registrant.email && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Email:</span> {registrant.email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-600">Thông tin người đăng ký không available</p>
              )}
            </div>
          </div>

          {/* Ghi chú từ bác sĩ */}
          {doctorNote && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ghi chú từ bác sĩ</h2>
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{doctorNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HealthConsultationScheduleDetailPage
