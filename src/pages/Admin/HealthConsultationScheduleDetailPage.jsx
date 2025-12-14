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
        if (res.success) setData(res.data)
        else setError(res.message || "Không lấy được thông tin chi tiết")
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

  const roleLabel = (role) => {
    const map = {
      doctor: "Bác sĩ",
      elderly: "Người già",
      family: "Người thân gia đình",
    }
    return map[role] || role || "N/A"
  }

  const getStatusDisplay = (status) => {
    const statusMap = {
      confirmed: { text: "Đã xác nhận", color: "indigo" },
      in_progress: { text: "Đang thực hiện", color: "amber" },
      completed: { text: "Hoàn thành", color: "emerald" },
      cancelled: { text: "Đã hủy", color: "rose" },
    }
    return statusMap[status] || { text: status, color: "slate" }
  }

  const statusColorClasses = {
    indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    rose: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    slate: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
  }

  const paymentBadge = (paymentStatus) => {
    if (paymentStatus === "paid") return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
    if (paymentStatus === "refunded") return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200"
    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 text-lg">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8">
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              ⚠ {error}
            </div>
            <button
              onClick={() => navigate(ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES)}
              className="cursor-pointer px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const {
    doctor,
    beneficiary,
    registrant,
    price,
    status,
    registeredAt,
    scheduledDate,
    slot,
    doctorNote,
    paymentMethod,
    paymentStatus,
    consultationSummary,
    createdAt,
  } = data

  const statusInfo = getStatusDisplay(status)

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES)}
          className=" cursor-pointer mb-6 px-4 py-2.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm ring-1 ring-slate-200"
        >
          ← Quay lại danh sách
        </button>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Chi tiết lịch tư vấn sức khỏe</h1>
              <p className="text-slate-500 mt-1">Thông tin lịch, thanh toán và hồ sơ liên quan</p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusColorClasses[statusInfo.color]}`}>
              {statusInfo.text}
            </span>
          </div>

          {/* Thông tin chung */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin lịch tư vấn</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 font-medium">Ngày khám</p>
                <p className="text-lg font-semibold text-slate-900">{formatDate(scheduledDate)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Buổi</p>
                <p className="text-lg font-semibold text-slate-900">{slot === "morning" ? "Sáng" : "Chiều"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Giá</p>
                <p className="text-lg font-semibold text-indigo-700">
                  {price?.toLocaleString("vi-VN") || "N/A"} VND
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Trạng thái</p>
                <p className="text-lg font-semibold text-slate-900">{statusInfo.text}</p>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin thanh toán</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 font-medium">Phương thức</p>
                <p className="text-lg font-semibold text-slate-900">
                  {paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Trạng thái thanh toán</p>
                <p className="text-lg font-semibold">
                  <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${paymentBadge(paymentStatus)}`}>
                    {paymentStatus === "paid"
                      ? "Đã thanh toán"
                      : paymentStatus === "refunded"
                      ? "Đã hoàn tiền"
                      : "Chưa thanh toán"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Ngày đăng ký</p>
                <p className="text-lg font-semibold text-slate-900">{formatDate(createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Card info block helper style */}
          {[
            { title: "Thông tin bác sĩ", person: doctor },
            { title: "Thông tin người cao tuổi", person: beneficiary },
            { title: "Thông tin người đăng ký", person: registrant },
          ].map((block) => (
            <div className="mb-8" key={block.title}>
              <h2 className="text-xl font-bold text-slate-900 mb-4">{block.title}</h2>
              <div className="border border-slate-200 rounded-2xl p-6 bg-white">
                {block.person ? (
                  <div className="flex items-center gap-6">
                    {block.person.avatar && (
                      <img
                        src={block.person.avatar}
                        alt={block.person.fullName}
                        className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-slate-900">{block.person.fullName}</h3>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200">
                          {roleLabel(block.person.role)}
                        </span>
                      </div>

                      {"dateOfBirth" in block.person && block.person.dateOfBirth && (
                        <p className="text-sm text-slate-600 mt-2">
                          <span className="font-medium">Ngày sinh:</span> {formatDate(block.person.dateOfBirth)}
                        </p>
                      )}

                      {block.person.phoneNumber && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">SĐT:</span> {block.person.phoneNumber}
                        </p>
                      )}
                      {block.person.email && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Email:</span> {block.person.email}
                        </p>
                      )}
                      {block.person.address && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Địa chỉ:</span> {block.person.address}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600">Không có dữ liệu</p>
                )}
              </div>
            </div>
          ))}

          {/* Thông tin tư vấn chi tiết */}
          {doctorNote && (
            <div className="mb-2 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin tư vấn chi tiết</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {consultationSummary?.mainDisease && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Nhận xét tổng quan</p>
                    <p className="text-lg font-semibold text-slate-900">{consultationSummary.mainDisease}</p>
                  </div>
                )}
                {consultationSummary?.medications && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Lời khuyên</p>
                    <p className="text-lg font-semibold text-slate-900 whitespace-pre-wrap">{consultationSummary.medications}</p>
                  </div>
                )}
                {consultationSummary?.systolic && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Huyết áp Tâm thu</p>
                    <p className="text-lg font-semibold text-slate-900">{consultationSummary.systolic} mmHg</p>
                  </div>
                )}
                {consultationSummary?.diastolic && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Huyết áp Tâm trương</p>
                    <p className="text-lg font-semibold text-slate-900">{consultationSummary.diastolic} mmHg</p>
                  </div>
                )}
                {consultationSummary?.pulse && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Nhịp tim</p>
                    <p className="text-lg font-semibold text-slate-900">{consultationSummary.pulse} bpm</p>
                  </div>
                )}
                {consultationSummary?.weight && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Cân nặng</p>
                    <p className="text-lg font-semibold text-slate-900">{consultationSummary.weight} kg</p>
                  </div>
                )}
                {consultationSummary?.bloodSugar && (
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Đường huyết</p>
                    <p className="text-lg font-semibold text-slate-900">{consultationSummary.bloodSugar} Mmol/l</p>
                  </div>
                )}
              </div>

              {(consultationSummary?.mobility || consultationSummary?.bathing || consultationSummary?.feeding) && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Khả năng sinh hoạt hàng ngày</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {consultationSummary?.mobility && (
                      <div className="p-4 rounded-xl bg-white ring-1 ring-slate-200">
                        <p className="text-sm text-slate-600 font-medium">Độc lập di chuyển</p>
                        <p className="text-slate-800 whitespace-pre-wrap">{consultationSummary.mobility}</p>
                      </div>
                    )}
                    {consultationSummary?.bathing && (
                      <div className="p-4 rounded-xl bg-white ring-1 ring-slate-200">
                        <p className="text-sm text-slate-600 font-medium">Tắm rửa</p>
                        <p className="text-slate-800 whitespace-pre-wrap">{consultationSummary.bathing}</p>
                      </div>
                    )}
                    {consultationSummary?.feeding && (
                      <div className="p-4 rounded-xl bg-white ring-1 ring-slate-200">
                        <p className="text-sm text-slate-600 font-medium">Ăn uống</p>
                        <p className="text-slate-800 whitespace-pre-wrap">{consultationSummary.feeding}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HealthConsultationScheduleDetailPage
