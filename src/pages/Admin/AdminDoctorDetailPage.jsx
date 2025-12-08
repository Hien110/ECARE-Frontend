import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import adminService from "../../services/adminService"


const AdminDoctorDetailPage = () => {
  const [params] = useSearchParams()
  const userId = params.get("id")
  const [userData, setUserData] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // State for assigned packages
  const [assignedPackages, setAssignedPackages] = useState([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [errorPackages, setErrorPackages] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminService.getDoctorProfile(userId)
        setUserData(res?.data?.user || null)
        setProfileData(res?.data?.profile || null)
      } catch (e) {
        console.error("❌ AdminDoctorDetailPage - Error:", e)
        setError(e?.response?.data?.message || "Tải thông tin doctor thất bại")
      } finally {
        setLoading(false)
      }
    }
    if (userId) fetchData()
  }, [userId])

  // Fetch assigned packages
  useEffect(() => {
    if (!userId) return
    setLoadingPackages(true)
    setErrorPackages("")
    adminService.getCompletedConsultationsByDoctor(userId)
      .then(res => {
        setAssignedPackages(res?.data || [])
      })
      .catch(e => {
        setErrorPackages(e?.response?.data?.message || "Không thể tải danh sách tư vấn đã hoàn thành")
      })
      .finally(() => setLoadingPackages(false))
  }, [userId])

  if (loading) return <div className="p-4">Đang tải...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!userData) return <div className="p-4">Không có dữ liệu</div>

  // User fields
  const name = userData.fullName || "Bác sĩ"
  const phone = userData.phoneNumber || "N/A"
  const email = userData.email || "N/A"
  const address = userData.address || "N/A"
  
  // DoctorProfile fields
  const specialization = profileData?.specialization || "Chuyên khoa tổng quát"
  const experience = profileData?.experience || 0
  const description = profileData?.description || "Không có mô tả chuyên môn."
  const rating = profileData?.ratingStats?.averageRating ?? 0
  const ratingCount = profileData?.ratingStats?.totalRatings ?? 0

  // Render assigned packages
  const renderAssignedPackages = () => {
    if (loadingPackages) return <div>Đang tải danh sách lịch khám đã hoàn thành...</div>
    if (errorPackages) return <div className="text-red-600">{errorPackages}</div>
    if (!assignedPackages.length) return <div>Chưa có lịch khám nào hoàn thành.</div>
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border mt-2 bg-white rounded-xl">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-left">Người cao tuổi</th>
              <th className="px-3 py-2 text-left">Người đăng ký</th>
              <th className="px-3 py-2 text-left">Ghi chú</th>
              <th className="px-3 py-2 text-left">Giá</th>
              <th className="px-3 py-2 text-left">Ngày hoàn thành</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {assignedPackages.map((consultation, idx) => (
              <tr key={consultation._id || idx} className="border-b last:border-0">
                <td className="px-3 py-2">{consultation.beneficiary?.fullName || "-"}</td>
                <td className="px-3 py-2">{consultation.registrant?.fullName || "-"}</td>
                <td className="px-3 py-2">{consultation.doctorNote || "-"}</td>
                <td className="px-3 py-2">{consultation.price?.toLocaleString() || "-"} đ</td>
                <td className="px-3 py-2">{consultation.updatedAt ? new Date(consultation.updatedAt).toLocaleDateString() : "-"}</td>
                <td className="px-3 py-2">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    Hoàn thành
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Thông tin bác sĩ</h1>
          <p className="text-slate-500 mt-2">Xem chi tiết hồ sơ chuyên môn và thống kê công việc</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Avatar section */}
                <div className="flex-shrink-0">
                  <img
                    src={userData.avatar || "/placeholder-doctor.png"}
                    alt="avatar"
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                  />
                </div>

                {/* Main info section */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
                    <p className="text-slate-600 mt-1 font-medium">{specialization}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          {rating} ({ratingCount} đánh giá)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500 text-sm font-medium">Kinh nghiệm</div>
                      <div className="text-3xl font-bold text-slate-900 mt-1">{experience}</div>
                      <div className="text-slate-500 text-sm">năm</div>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{description}</p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <div className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded"></div>
                        Thông tin chuyên môn
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Chuyên khoa:</span>
                          <span className="font-medium text-slate-900">{specialization}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Kinh nghiệm:</span>
                          <span className="font-medium text-slate-900">{experience} năm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Đánh giá:</span>
                          <span className="font-medium text-slate-900">{rating.toFixed(1)}/5 ({ratingCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                      <div className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-5 bg-emerald-600 rounded"></div>
                        Mô tả chuyên môn
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-slate-700 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="p-2.5 rounded-lg bg-green-100 text-green-700 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase">Điện thoại</div>
                        <div className="font-semibold text-slate-900 mt-1">+{phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase">Email</div>
                        <div className="font-semibold text-slate-900 mt-1 truncate">{email}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="text-xs font-semibold text-slate-500 uppercase">Địa Chỉ</div>
                        <div className="font-semibold text-slate-900 mt-1 break-words whitespace-pre-line">{address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned packages section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
            <div className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-indigo-600 rounded"></div>
              Các lịch khám đã hoàn thành
            </div>
            {renderAssignedPackages()}
          </div>

          
        </div>
      </div>
    </div>
  )
}

export default AdminDoctorDetailPage
