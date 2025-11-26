"use client"

import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import adminService, { getAcceptRelationshipByFamilyIdAdmin } from "../../services/adminService"

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
        const userData = res?.data || null
        setData(userData)
      } catch (e) {
        console.error("❌ AdminFamilyDetailPage - Error:", e)
        setError(e?.response?.data?.message || "Tải thông tin family thất bại")
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
      .then((res) => {
        setRelationships(res?.data || [])
      })
      .catch(() => {
        setRelError("Không thể tải danh sách mối quan hệ")
      })
      .finally(() => setRelLoading(false))
  }, [userId])

  const formatDate = (iso) => {
    if (!iso) return "N/A"
    try {
      const d = new Date(iso)
      return d.toLocaleDateString("vi-VN")
    } catch {
      return iso
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Đang tải...</div>
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>
  if (!data) return <div className="flex items-center justify-center min-h-screen text-gray-500">Không có dữ liệu</div>

  const name = data.fullName || "Người dùng"
  const phone = data.phoneNumber || data.phone || "N/A"
  const email = data.email || "N/A"
  const address = data.address || data.homeAddress || "N/A"
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : "N/A"
  const age = data.dateOfBirth ? Math.max(0, new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()) : null
  const joinedAt = data.createdAt ? formatDate(data.createdAt) : "N/A"
  const isActive = typeof data.isActive === "boolean" ? data.isActive : true
  const linkedCount = Array.isArray(relationships) ? relationships.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Chi tiết người thân</h1>
          <p className="text-gray-500 mt-2">Quản lý thông tin và liên kết của người thân</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-24"></div>
              <div className="px-6 pb-6">
                <div className="flex items-end gap-4 -mt-16 mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white">
                    {name
                      .split(" ")
                      .map((n) => (n && n[0]) || "")
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1 pb-2">
                    <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      {age !== null && <span className="flex items-center gap-1">📅 {age} tuổi</span>}
                      <span>Tham gia {joinedAt}</span>
                    </div>
                  </div>
                </div>

                {data.description && (
                  <p className="text-gray-700 mb-6 leading-relaxed italic text-sm bg-gray-50 rounded-lg p-3 border border-gray-200">
                    "{data.description}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Điện thoại</div>
                    <div className="font-semibold text-gray-900 mt-2">{phone}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</div>
                    <div className="font-semibold text-gray-900 mt-2 truncate">{email}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Địa chỉ</div>
                    <div className="font-semibold text-gray-900 mt-2">{address}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày sinh</div>
                    <div className="font-semibold text-gray-900 mt-2">{dob}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Elderly Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">👥 Người cao tuổi đã liên kết</h3>
                <p className="text-sm text-gray-500 mt-1">{linkedCount} người cao tuổi</p>
              </div>
              <div className="p-6">
                {relLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Đang tải...</div>
                  </div>
                ) : relError ? (
                  <div className="text-center py-12 text-red-500">{relError}</div>
                ) : linkedCount === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-2">📭</div>
                    <p>Chưa có người cao tuổi nào được liên kết</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relationships.map((rel, idx) => {
                      const elder = rel.elderly || {}
                      return (
                        <div
                          key={elder._id || idx}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {elder.fullName || `Người cao tuổi ${idx + 1}`}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">☎️ {elder.phoneNumber || "Chưa cập nhật"}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                    <span className={`text-sm font-semibold ${isActive ? "text-green-700" : "text-red-700"}`}>
                      {isActive ? "✓ Hoạt động" : "✕ Bị khóa"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-5">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-4">Tóm tắt</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Người già liên kết</span>
                  <span className="text-2xl font-bold text-blue-600">{linkedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Cập nhật lần cuối</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {data.updatedAt ? formatDate(data.updatedAt) : "N/A"}
                  </span>
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
