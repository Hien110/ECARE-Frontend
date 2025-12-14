"use client"

import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import adminService, { getAcceptRelationshipByFamilyIdAdmin } from "../../services/adminService"
import ROUTE_PATH from "../../constants/routePath"

const AdminFamilyDetailPage = () => {
  const [params] = useSearchParams()
  const userId = params.get("id")

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [relationships, setRelationships] = useState([])
  const [relLoading, setRelLoading] = useState(true)
  const [relError, setRelError] = useState("")

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getUserById(userId)
        setData(res?.data || null)
      } catch (e) {
        console.error("❌ AdminFamilyDetailPage - Error:", e)
        setError(e?.response?.data?.message || "Tải thông tin người thân thất bại")
      } finally {
        setLoading(false)
      }
    }
    if (userId) fetch()
  }, [userId])

  useEffect(() => {
    if (!userId) return
    setRelLoading(true)
    setRelError("")
    getAcceptRelationshipByFamilyIdAdmin(userId)
      .then((res) => setRelationships(res?.data || []))
      .catch(() => setRelError("Không thể tải danh sách mối quan hệ"))
      .finally(() => setRelLoading(false))
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
    const p = String(phone).trim()
    // Nếu đã có + thì giữ nguyên
    if (p.startsWith("+")) return p
    // Nếu bắt đầu bằng 0 -> +84
    if (p.startsWith("0")) return "+84" + p.slice(1)
    // Nếu bắt đầu bằng 84 -> +84
    if (p.startsWith("84")) return "+" + p
    return p
  }

  const initialsOf = (fullName) => {
    const parts = (fullName || "").trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return "U"
    return parts.map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  }

  /** ===== Early returns ===== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700 max-w-xl w-full">
          <p className="font-semibold mb-1">⚠ Có lỗi xảy ra</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <p className="text-slate-700 text-lg font-medium">Không có dữ liệu</p>
        </div>
      </div>
    )
  }

  /** ===== Derived values ===== */
  const name = data.fullName || "Người dùng"
  const phone = formatPhone(data.phoneNumber || data.phone || "N/A")
  const email = data.email || "N/A"
  const address = data.address || data.homeAddress || "N/A"
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : "N/A"
  const age = data.dateOfBirth
    ? Math.max(0, new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear())
    : null
  const joinedAt = data.createdAt ? formatDate(data.createdAt) : "N/A"
  const isActive = typeof data.isActive === "boolean" ? data.isActive : true
  const linkedCount = Array.isArray(relationships) ? relationships.length : 0

  const activeBadge = isActive
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
    : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Chi tiết người thân</h1>
          <p className="text-slate-600 mt-2">Quản lý thông tin và liên kết của người thân</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="h-24 " />
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-16 mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-4xl font-bold text-white shadow-sm ring-4 ring-white overflow-hidden">
                    {data.avatar ? (
                      <img src={data.avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{initialsOf(name)}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900">{name}</h2>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 whitespace-nowrap">
                        Người thân gia đình
                      </span>

                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${activeBadge}`}>
                        {isActive ? "Đang hoạt động" : "Đang bị khóa"}
                      </span>

                      {age !== null && (
                        <span className="text-sm text-slate-600 font-semibold">• {age} tuổi</span>
                      )}

                      <span className="text-sm text-slate-600 font-semibold">• Tham gia {joinedAt}</span>
                    </div>
                  </div>
                </div>

                {data.description && (
                  <div className="mb-6 p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <p className="text-slate-700 leading-relaxed italic">“{data.description}”</p>
                  </div>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Điện thoại</div>
                    <div className="font-semibold text-slate-900 mt-2 break-words">{phone}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</div>
                    <div className="font-semibold text-slate-900 mt-2 truncate">
                      {email === "N/A" ? "Chưa có" : email}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Địa chỉ</div>
                    <div className="font-semibold text-slate-900 mt-2 line-clamp-2">{address}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày sinh</div>
                    <div className="font-semibold text-slate-900 mt-2">{dob}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Elderly */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Người cao tuổi đã liên kết</h3>
                <p className="text-sm text-slate-600 mt-1">{linkedCount} người cao tuổi</p>
              </div>

              <div className="p-6">
                {relLoading ? (
                  <div className="py-10 text-center">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto"></div>
                    <div className="text-slate-600 mt-3 font-semibold">Đang tải dữ liệu...</div>
                  </div>
                ) : relError ? (
                  <div className="text-center py-10 text-rose-600 font-semibold">{relError}</div>
                ) : linkedCount === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="font-semibold">Chưa có người cao tuổi nào được liên kết</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relationships.map((rel, idx) => {
                      const elder = rel.elderly || {}
                      const elderName = elder.fullName || `Người cao tuổi ${idx + 1}`
                      const elderPhone = elder.phoneNumber ? formatPhone(elder.phoneNumber) : "Chưa cập nhật"

                      return (
                        <div
                          key={elder._id || idx}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-blue-50/40 hover:ring-blue-200 transition"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex items-center justify-center font-bold">
                              {initialsOf(elderName)}
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{elderName}</div>
                              <div className="text-sm text-slate-600 mt-1">
                                <span className="font-semibold text-slate-700">SĐT:</span> {elderPhone}
                              </div>
                            </div>
                          </div>

                          {/* Nếu bạn có route chi tiết elderly theo query id */}
                          {elder._id ? (
                            <Link
                              to={`${ROUTE_PATH.ADMIN_ELDERLY_VIEW || "/admin/elderly/view"}?id=${elder._id}`}
                              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-semibold whitespace-nowrap"
                            >
                              Xem chi tiết
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-500">Không có ID</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900">Tóm tắt</h3>
              <p className="text-sm text-slate-600 mt-1">Số liệu nhanh theo liên kết</p>

              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50 ring-1 ring-inset ring-blue-200">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Người già liên kết</div>
                  <div className="text-3xl font-bold text-blue-800 mt-1">{linkedCount}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 ring-1 ring-inset ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Trạng thái tài khoản</div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${activeBadge}`}>
                      {isActive ? "Đang hoạt động" : "Đang bị khóa"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminFamilyDetailPage
