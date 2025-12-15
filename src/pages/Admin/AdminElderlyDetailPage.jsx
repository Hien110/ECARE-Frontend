import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import adminService from "../../services/adminService"
import ROUTE_PATH from "../../constants/routePath"

const AdminElderlyDetailPage = () => {
  const [params] = useSearchParams()
  const userId = params.get("id")

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [consultationSchedules, setConsultationSchedules] = useState([])
  const [loadingSchedules, setLoadingSchedules] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setLoadingSchedules(true)
    setError("")

    adminService
      .getUserById(userId)
      .then((res) => setData(res?.data || null))
      .catch((e) => {
        console.error("AdminElderlyDetailPage - Error:", e)
        setError(e?.response?.data?.message || "Tải thông tin thất bại")
      })
      .finally(() => setLoading(false))

    adminService
      .getConsultationSchedulesByBeneficiary(userId)
      .then((res) => {
        if (res.success) setConsultationSchedules(res.data || [])
      })
      .catch((e) => console.error("Error fetching schedules:", e))
      .finally(() => setLoadingSchedules(false))
  }, [userId])

  const formatDate = (iso) => {
    if (!iso) return "N/A"
    try {
      return new Date(iso).toLocaleDateString("vi-VN")
    } catch {
      return iso
    }
  }

  const formatPhone = (phone) => {
    if (!phone || phone === "N/A") return "N/A"
    if (phone.startsWith("+84")) return phone
    if (phone.startsWith("84")) return "+" + phone
    if (phone.startsWith("0")) return "+84" + phone.slice(1)
    return phone
  }

  const getStatusDisplay = (status) => {
    const statusMap = {
      confirmed: { text: "Đã xác nhận", color: "indigo" },
      in_progress: { text: "Đang thực hiện", color: "amber" },
      completed: { text: "Hoàn thành", color: "emerald" },
      cancelled: { text: "Đã hủy", color: "rose" },
      canceled: { text: "Đã hủy", color: "rose" },
    }
    return statusMap[status] || { text: status, color: "slate" }
  }

  const statusBadge = {
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

  const paymentText = (paymentStatus) => {
    if (paymentStatus === "paid") return "Đã thanh toán"
    if (paymentStatus === "refunded") return "Đã hoàn tiền"
    return "Chưa thanh toán"
  }

  const getInitials = (fullName) => {
    const parts = (fullName || "").trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return "U"
    return parts.map((p) => p[0]).slice(0, 2).join("").toUpperCase()
  }

  /** ===== EARLY RETURNS (no hooks below this line) ===== */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Đang tải...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700 max-w-xl w-full">
          <p className="font-semibold mb-1">⚠ Có lỗi xảy ra</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <p className="text-slate-700 text-lg font-medium">Không có dữ liệu</p>
        </div>
      </div>
    )

  /** ===== Derived values (safe, no hooks) ===== */
  const name = data.fullName || "Người dùng"
  const phone = formatPhone(data.phoneNumber || "N/A")
  const address = data.address || "N/A"
  const currentAddress = data.currentAddress || "N/A"
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : "N/A"
  const age = data.dateOfBirth
    ? Math.max(0, new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear())
    : null

  const roleLabel =
    data.role === "supporter" ? "Người hỗ trợ" : data.role === "doctor" ? "Bác sĩ" : "Người cao tuổi"

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Chi tiết người cao tuổi</h1>
          <p className="text-slate-600 mt-2">Quản lý thông tin cá nhân và lịch sử dịch vụ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="h-24" />
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-16 mb-6 relative z-10">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-4xl font-bold text-white shadow-sm ring-4 ring-white overflow-hidden">
                    {data.avatar ? (
                      <img src={data.avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(name)}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900">{name}</h2>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 whitespace-nowrap">
                        {roleLabel}
                      </span>

                      {age !== null && (
                        <span className="text-sm text-slate-600 font-semibold">{age} tuổi</span>
                      )}
                    </div>
                  </div>
                </div>

                {data.description && (
                  <div className="mb-6 p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <p className="text-slate-700 leading-relaxed">{data.description}</p>
                  </div>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Phone */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Điện thoại</div>
                      <div className="font-semibold text-slate-900 mt-1 break-words">{phone}</div>
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày sinh</div>
                      <div className="font-semibold text-slate-900 mt-1">{dob}</div>
                    </div>
                  </div>

                  {/* Permanent address */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Địa chỉ thường trú</div>
                      <div className="font-semibold text-slate-900 mt-1 line-clamp-2">{address}</div>
                    </div>
                  </div>

                  {/* Current address */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l9-7 9 7V20a2 2 0 01-2 2H5a2 2 0 01-2-2v-9.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Địa chỉ tạm trú</div>
                      <div className="font-semibold text-slate-900 mt-1 line-clamp-2">{currentAddress}</div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>

          {/* Right: stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900">Tổng quan lịch tư vấn</h3>
              <p className="text-sm text-slate-600 mt-1">Thống kê nhanh theo trạng thái</p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 ring-1 ring-inset ring-emerald-200">
                  <div className="text-xs font-semibold text-emerald-700 uppercase">Hoàn thành</div>
                  <div className="text-2xl font-bold text-emerald-800 mt-1">
                    {consultationSchedules.filter((s) => s.status === "completed").length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 ring-1 ring-inset ring-rose-200">
                  <div className="text-xs font-semibold text-rose-700 uppercase">Đã hủy</div>
                  <div className="text-2xl font-bold text-rose-800 mt-1">
                    {consultationSchedules.filter((s) => s.status === "cancelled" || s.status === "canceled").length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 ring-1 ring-inset ring-blue-200 col-span-2">
                  <div className="text-xs font-semibold text-blue-700 uppercase">Tổng số lịch</div>
                  <div className="text-2xl font-bold text-blue-800 mt-1">{consultationSchedules.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedules */}
        <div className="mt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Lịch tư vấn sức khỏe</h2>
            <p className="text-slate-600 mt-1">Danh sách các lịch tư vấn liên quan đến người dùng này</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            {loadingSchedules ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto"></div>
                <div className="text-slate-600 mt-4 font-semibold">Đang tải dữ liệu...</div>
              </div>
            ) : consultationSchedules.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {consultationSchedules.map((schedule, idx) => {
                  const statusInfo = getStatusDisplay(schedule.status)

                  return (
                    <Link
                      key={schedule._id || idx}
                      to={`${ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES}/${schedule._id}`}
                      className="block p-6 hover:bg-blue-50/40 transition-colors group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 group-hover:text-blue-700">
                                {formatDate(schedule.scheduledDate)} •{" "}
                                {schedule.slot === "morning" ? "Buổi sáng" : "Buổi chiều"}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">
                                Đăng ký bởi:{" "}
                                <span className="font-semibold text-slate-800">
                                  {schedule.registrant?.fullName || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="ml-12 text-sm text-slate-600 space-y-1">
                            <div>
                              <span className="font-semibold text-slate-700">Bác sĩ:</span>{" "}
                              {schedule.doctor?.fullName || "Chưa gán"}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700">Giá:</span>{" "}
                              {schedule.price?.toLocaleString("vi-VN") || "N/A"} VND
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 lg:text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge[statusInfo.color]}`}
                          >
                            {statusInfo.text}
                          </span>

                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${paymentBadge(
                              schedule.paymentStatus
                            )}`}
                          >
                            {paymentText(schedule.paymentStatus)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-10 text-center">
                <svg className="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="font-semibold text-slate-600">Chưa có lịch tư vấn nào.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminElderlyDetailPage
