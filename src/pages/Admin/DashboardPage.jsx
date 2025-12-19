import React, { useCallback, useEffect, useState } from "react"
import adminService from "../../services/adminService"

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1) // 1-12
  const [doctorBookings, setDoctorBookings] = useState([])
  const [supporterBookings, setSupporterBookings] = useState([])
  const [stats, setStats] = useState({
    counts: { totalResidents: 0, familyMembers: 0, activeSupporters: 0, doctors: 0, admins: 0 },
    paymentsByStatus: {},
    totalRevenue: 0,
    monthlyRevenue: 0,
  })

  const [doctorTotalBookedCount, setDoctorTotalBookedCount] = useState(0)
  const [supporterTotalBookedCount, setSupporterTotalBookedCount] = useState(0)

  const [doctorCompletedCount, setDoctorCompletedCount] = useState(0)
  const [doctorScheduledCount, setDoctorScheduledCount] = useState(0)

  const [supporterCompletedCount, setSupporterCompletedCount] = useState(0)
  const [supporterInProgressCount, setSupporterInProgressCount] = useState(0)
  const [supporterConfirmedCount, setSupporterConfirmedCount] = useState(0)

  // Filter data by selected month
  const filterByMonth = useCallback(
    (items, dateField) => {
      if (!items || !Array.isArray(items)) return []
      if (!selectedMonth || selectedMonth === 0) return items

      const currentYear = new Date().getFullYear()
      return items.filter((item) => {
        if (!item) return false
        const dateValue = item[dateField]
        if (!dateValue) return false
        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return false
        return date.getMonth() + 1 === selectedMonth && date.getFullYear() === currentYear
      })
    },
    [selectedMonth]
  )

  // Fetch all data on mount
  useEffect(() => {
    let mounted = true

    const fetchAllData = async () => {
      try {
        const dashRes = await adminService.getDashboard()
        if (mounted && dashRes?.success) setStats(dashRes.data)

        const supporterSchedulesRes = await adminService.getAllSupporterSchedules()
        if (mounted && supporterSchedulesRes?.success) setSupporterBookings(supporterSchedulesRes.data || [])

        const doctorSchedulesRes = await adminService.getAllDoctorSchedules()
        if (mounted && doctorSchedulesRes?.success) setDoctorBookings(doctorSchedulesRes.data || [])
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAllData()
    return () => {
      mounted = false
    }
  }, [])

  // Update counters when schedules/month changes
  useEffect(() => {
    const filteredDoctorBookings = filterByMonth(doctorBookings, "scheduledDate")
    const filteredSupporterBookings = filterByMonth(supporterBookings, "startDate")

    // Doctor
    const doctorCompleted = filteredDoctorBookings.filter((b) => b?.status === "completed").length
    const doctorScheduled = filteredDoctorBookings.filter((b) => b?.status === "confirmed").length
    const doctorBookedTotal = filteredDoctorBookings.filter((b) => ["confirmed", "completed"].includes(b?.status)).length

    // Supporter
    const supporterCompleted = filteredSupporterBookings.filter((b) => b?.status === "completed").length
    const supporterInProgress = filteredSupporterBookings.filter((b) => b?.status === "in_progress").length
    const supporterConfirmed = filteredSupporterBookings.filter((b) => b?.status === "confirmed").length

    const supporterBookedTotal = filteredSupporterBookings.filter((b) => !["canceled", "cancelled"].includes(b?.status)).length

    setDoctorCompletedCount(doctorCompleted)
    setDoctorScheduledCount(doctorScheduled)
    setDoctorTotalBookedCount(doctorBookedTotal)

    setSupporterCompletedCount(supporterCompleted)
    setSupporterInProgressCount(supporterInProgress)
    setSupporterConfirmedCount(supporterConfirmed)
    setSupporterTotalBookedCount(supporterBookedTotal)
  }, [doctorBookings, supporterBookings, filterByMonth])

  if (loading) return <div className="p-6">Đang tải dashboard...</div>

  const { counts } = stats

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bảng Thống Kê</h1>
            <p className="text-slate-600 mt-1">Chào mừng quay trở lại, Quản trị viên. Đây là trang thống kê khám bệnh.</p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="month-filter" className="text-sm font-semibold text-slate-600 whitespace-nowrap">
              Lọc theo tháng
            </label>
            <select
              id="month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900
                         focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value={0}>Tất cả</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart / Booking stats */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Hồ sơ đặt lịch</h3>
              <p className="text-sm text-slate-600 mt-1">Thống kê lịch hẹn tư vấn và hỗ trợ chăm sóc sức khỏe theo tháng</p>
            </div>

            {/* Simple Bar Chart */}
            <div className="p-6">
              {(() => {
                const bars = [
                  { id: "doctorCompleted", label: "Đã tư vấn", value: doctorCompletedCount, cls: "bg-indigo-600" },
                  { id: "doctorScheduled", label: "Đã hẹn tư vấn", value: doctorScheduledCount, cls: "bg-amber-500" },

                  { id: "supporterCompleted", label: "Đã chăm sóc", value: supporterCompletedCount, cls: "bg-emerald-600" },
                  { id: "supporterInProgress", label: "Đang chăm sóc", value: supporterInProgressCount, cls: "bg-sky-600" },
                  { id: "supporterConfirmed", label: "Đã hẹn chăm sóc", value: supporterConfirmedCount, cls: "bg-orange-500" },
                ]

                const maxValue = Math.max(...bars.map((b) => b.value), 1)

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-5 items-end h-72">
                      {bars.map((b) => (
                        <div key={b.id} className="flex flex-col items-center gap-3">
                          <div className="w-full flex items-end justify-center h-52">
                            <div
                              className={`w-14 rounded-2xl ${b.cls} transition-all duration-300 shadow-sm`}
                              style={{
                                height: `${(b.value / maxValue) * 100}%`,
                                minHeight: b.value > 0 ? "14px" : "6px",
                              }}
                              title={`${b.label}: ${b.value}`}
                            />
                          </div>

                          <div className="text-center">
                            <div className="text-xs font-semibold text-slate-600">{b.label}</div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{b.value.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-center text-sm text-slate-500">
                      Số liệu {selectedMonth ? `tháng ${selectedMonth}` : "tất cả tháng"} - {new Date().getFullYear()}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Total users */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold">
                      {(counts.totalResidents + counts.familyMembers + counts.activeSupporters + counts.doctors).toLocaleString()}
                    </div>
                    <div className="text-indigo-100 text-sm mt-1">Tổng số người dùng</div>
                  </div>

                  <div className="px-3 py-1 rounded-lg bg-white/15 text-sm font-semibold">Tổng</div>
                </div>

                <div className="mt-5 h-16 rounded-xl bg-white/10" />
              </div>
            </div>

            {/* Totals booking */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="text-sm font-bold text-slate-900 mb-4">Tổng số lịch hẹn</div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      T
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Lịch tư vấn sức khỏe</div>
                      <div className="text-xs text-slate-500">Hoàn thành + Đã hẹn</div>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{doctorTotalBookedCount}</div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      C
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Lịch chăm sóc sức khỏe</div>
                      <div className="text-xs text-slate-500">Trừ lịch bị hủy</div>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">{supporterTotalBookedCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Family */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-600">Thành viên gia đình</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{counts.familyMembers?.toLocaleString() ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Elderly */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-600">Người già</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{counts.totalResidents?.toLocaleString() ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Staff */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 14.1 17 15.28 17 16.5V19h7v-2.5c0-2.33-4.67-3.5-7-3.5z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-600">Nhân viên</div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {(counts.doctors + counts.activeSupporters)?.toLocaleString() ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
