"use client"

import { useState, useEffect } from "react"
import supporterSchedulingService from "../../services/supporterSchedulingService"
import { useParams } from "react-router-dom"
import { Clock, DollarSign, AlertCircle } from "lucide-react"

const SupporterSchedulingDetailPage = () => {
  const [schedulingDetail, setSchedulingDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refunding, setRefunding] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { id } = useParams()

  const defaultAvatar = "https://cdn.sforum.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"

  const formatStatus = (status) => {
    switch (status) {
      case "pending":
        return { text: "Đang chờ", color: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-200" }
      case "confirmed":
        return { text: "Đã xác nhận", color: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-200" }
      case "in_progress":
        return {
          text: "Đang thực hiện",
          color: "bg-teal-50",
          textColor: "text-teal-700",
          borderColor: "border-teal-200",
        }
      case "completed":
        return {
          text: "Hoàn thành",
          color: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        }
      case "canceled":
        return { text: "Đã hủy", color: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200" }
      default:
        return {
          text: "Không xác định",
          color: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        }
    }
  }

  const formatGender = (gender) => {
    switch (gender) {
      case "Nam":
        return "Nam"
      case "Nữ":
        return "Nữ"
      case "Khác":
        return "Khác"
      default:
        return "Không xác định"
    }
  }

  const formatPaymentMethod = (paymentMethod) => {
    switch (paymentMethod) {
      case "cash":
        return "Tiền mặt"
      case "bank_transfer":
        return "Chuyển khoản"
      default:
        return "Không xác định"
    }
  }

  const formatPaymentStatus = (paymentStatus) => {
    switch (paymentStatus) {
      case "unpaid":
        return { text: "Chưa trả", color: "text-amber-600", bgColor: "bg-amber-50" }
      case "paid":
        return { text: "Đã trả", color: "text-green-600", bgColor: "bg-green-50" }
      case "refunded":
        return { text: "Đã hoàn tiền", color: "text-blue-600", bgColor: "bg-blue-50" }
      default:
        return { text: "Không xác định", color: "text-gray-600", bgColor: "bg-gray-50" }
    }
  }

  useEffect(() => {
    const fetchSchedulingDetail = async () => {
      setLoading(true)
      const res = await supporterSchedulingService.getSchedulingDetailById(id)
      if (res.success) {
        setSchedulingDetail(res.data)
        console.log(res.data);
        
        setError(null)
      } else {
        setError(res.message)
      }
      setLoading(false)
    }
    fetchSchedulingDetail()
  }, [id])

  const handleRefundClick = () => {
    setShowConfirmModal(true)
  }

  const handleRefund = async () => {
    setShowConfirmModal(false)
    setRefunding(true)
    const res = await supporterSchedulingService.updatePaymentStatus(id, "refunded")
    if (res.success) {
      setSchedulingDetail(prev => ({
        ...prev,
        paymentStatus: "refunded"
      }))
      setShowSuccessModal(true)
    } else {
      setErrorMessage(res.message || "Cập nhật trạng thái thất bại")
      setShowErrorModal(true)
    }
    setRefunding(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-center text-red-600 font-semibold">Lỗi: {error}</p>
        </div>
      </div>
    )
  }

  if (!schedulingDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Không có dữ liệu</p>
        </div>
      </div>
    )
  }

  const statusInfo = formatStatus(schedulingDetail.status)
  const paymentInfo = formatPaymentStatus(schedulingDetail.paymentStatus)

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Chi tiết lịch hỗ trợ</h1>
            <div className={`px-4 py-2 rounded-full border ${statusInfo.borderColor} ${statusInfo.color}`}>
              <span className={`font-semibold text-sm ${statusInfo.textColor}`}>{statusInfo.text}</span>
            </div>
          </div>
          <p className="text-gray-500">Quản lý thông tin lịch hẹn và dịch vụ hỗ trợ</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supporter Info */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={schedulingDetail.supporter?.avatar || defaultAvatar}
                    alt="Avatar người hỗ trợ"
                    className="w-24 h-24 rounded-full object-cover border-4 border-teal-100"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">Người hỗ trợ</h3>
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Cung cấp dịch vụ chăm sóc</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tên:</span>
                      <span className="font-semibold text-gray-900">{schedulingDetail.supporter?.fullName || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Giới tính:</span>
                      <span className="font-semibold text-gray-900">
                        {formatGender(schedulingDetail.supporter?.gender)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-semibold text-gray-900">
                        +{schedulingDetail.phoneNumberSupporter || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-900">
                        {schedulingDetail.emailSupporter || "Không có"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Elderly Info */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={schedulingDetail.elderly?.avatar || defaultAvatar}
                    alt="Avatar người cao tuổi"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">Người nhận dịch vụ</h3>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Người cao tuổi nhận dịch vụ</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tên:</span>
                      <span className="font-semibold text-gray-900">{schedulingDetail.elderly?.fullName || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Giới tính:</span>
                      <span className="font-semibold text-gray-900">
                        {formatGender(schedulingDetail.elderly?.gender)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Ngày sinh:</span>
                      <span className="font-semibold text-gray-900">
                        {schedulingDetail.elderly?.dateOfBirth ? new Date(schedulingDetail.elderly.dateOfBirth).toLocaleDateString("vi-VN") : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-semibold text-gray-900">
                        +{schedulingDetail.phoneNumberElderly || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-900">
                        {schedulingDetail.emailElderly || "Không có"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="font-semibold text-gray-900 text-right max-w-xs">
                        {schedulingDetail.elderly?.currentAddress || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Creator Info */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={schedulingDetail.registrant?.avatar || defaultAvatar}
                    alt="Avatar người đặt lịch"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">Người đặt lịch</h3>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Quản lý đặt lịch</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tên:</span>
                      <span className="font-semibold text-gray-900">{schedulingDetail.registrant?.fullName || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Giới tính:</span>
                      <span className="font-semibold text-gray-900">
                        {formatGender(schedulingDetail.registrant?.gender)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-semibold text-gray-900">
                        +{schedulingDetail.phoneNumberRegistrant || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-900">
                        {schedulingDetail.emailRegistrant || "Không có"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking & Payment Details */}
          <div className="space-y-6">
            {/* Booking Schedule */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-gray-900">Lịch hẹn</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Dịch vụ</p>
                  <p className="font-semibold text-gray-900">{schedulingDetail.service?.name || "Không xác định"}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Ngày bắt đầu</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(schedulingDetail.startDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Ngày kết thúc</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(schedulingDetail.endDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Ghi chú</p>
                  <p className="font-semibold text-gray-900">
                    {schedulingDetail.note || "Không có"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Thanh toán</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Phương thức</p>
                  <p className="font-semibold text-gray-900">{formatPaymentMethod(schedulingDetail.paymentMethod)}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Trạng thái thanh toán</p>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${paymentInfo.bgColor} ${paymentInfo.color}`}
                  >
                    {paymentInfo.text}
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Giá</p>
                  <p className="font-bold text-lg text-teal-600">
                    {schedulingDetail.price ? schedulingDetail.price.toLocaleString("vi-VN") : "0"} VND
                  </p>
                </div>
              </div>
            </div>

            {/* Notes & Cancel Reason */}
            {(schedulingDetail.notes || schedulingDetail.cancelReason) && (
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ghi chú & Lý do</h3>
                <div className="space-y-4">
                  {schedulingDetail.notes && (
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Ghi chú</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{schedulingDetail.notes}</p>
                    </div>
                  )}
                  {schedulingDetail.cancelReason && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Lý do hủy</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{schedulingDetail.cancelReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bank Account Info - Show when canceled and paid */}
            {schedulingDetail.status === "canceled" && schedulingDetail.paymentStatus === "paid" && schedulingDetail.registrant && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 border border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-gray-900">Thông tin hoàn tiền</h3>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-100">
                  <p className="text-xs text-amber-700 font-semibold mb-3 uppercase tracking-wide">
                    Tài khoản nhận hoàn tiền
                  </p>
                  <div className="space-y-3 text-sm">
                    {schedulingDetail.registrant.bankName && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Ngân hàng</p>
                        <p className="font-semibold text-gray-900">{schedulingDetail.registrant.bankName}</p>
                      </div>
                    )}
                    {schedulingDetail.registrant.bankAccountHolderName && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Tên chủ tài khoản</p>
                        <p className="font-semibold text-gray-900">{schedulingDetail.registrant.bankAccountHolderName}</p>
                      </div>
                    )}
                    {schedulingDetail.registrant.bankAccountNumber && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Số tài khoản</p>
                        <p className="font-mono font-bold text-gray-900 text-base tracking-wider">
                          {schedulingDetail.registrant.bankAccountNumber}
                        </p>
                      </div>
                    )}
                    {(!schedulingDetail.registrant.bankName && !schedulingDetail.registrant.bankAccountNumber) && (
                      <div className="text-center py-2">
                        <p className="text-gray-500 text-sm italic">Chưa có thông tin tài khoản ngân hàng</p>
                      </div>
                    )}
                  </div>
                  {schedulingDetail.registrant.bankAccountNumber && (
                    <div className="mt-4 pt-3 border-t border-amber-100">
                      <p className="text-xs text-amber-600 italic">
                        💡 Vui lòng hoàn tiền về tài khoản trên
                      </p>
                    </div>
                  )}
                </div>
                {schedulingDetail.paymentStatus === "paid" && (
                  <div className="mt-4">
                    <button
                      onClick={handleRefundClick}
                      disabled={refunding}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {refunding ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5" />
                          Xác nhận đã hoàn tiền
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Xác nhận hoàn tiền</h3>
              <p className="text-gray-700 mb-2">Bạn có chắc chắn đã hoàn tiền cho người đặt lịch?</p>
              <p className="text-sm text-gray-500">Hành động này sẽ cập nhật trạng thái thanh toán thành "Đã hoàn tiền".</p>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRefund}
                className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-green-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Thành công!</h3>
              <p className="text-gray-700 text-center">Đã cập nhật trạng thái hoàn tiền thành công</p>
            </div>
            <div className="px-6 pb-6 flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Lỗi!</h3>
              <p className="text-gray-700 text-center">{errorMessage}</p>
            </div>
            <div className="px-6 pb-6 flex justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupporterSchedulingDetailPage
