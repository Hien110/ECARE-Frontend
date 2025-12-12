"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Edit2, Save, X, AlertCircle, Stethoscope, Activity, DollarSign, CheckCircle2, XCircle } from "lucide-react"
import API_BASE_URL from "../../config/api"
import userService from "../../services/userService"

const AdminConsultationPricePage = () => {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchPrices = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/consultation-prices`, {
        headers: {
          Authorization: `Bearer ${userService.getAuthToken()}`,
        },
      })
      if (response.data.success) {
        setPrices(Array.isArray(response.data.data) ? response.data.data : [response.data.data])
      } else {
        setError(response.data.message || "Lỗi khi tải dữ liệu")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const handleEdit = (item) => {
    setEditingId(item._id)
    setEditData({
      serviceName: item.serviceName,
      price: item.price,
      description: item.decripton || "",
      isActive: item.isActive,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (id) => {
    if (!editData.price || editData.price < 0) {
      setError("Giá phải là số dương")
      return
    }

    setSaving(true)
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/consultation-prices/${id}`,
        {
          serviceName: editData.serviceName,
          price: Number(editData.price),
          decripton: editData.description,
          isActive: editData.isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${userService.getAuthToken()}`,
          },
        }
      )

      if (response.data.success) {
        setPrices(prices.map((p) => (p._id === id ? response.data.data : p)))
        setEditingId(null)
        setEditData({})
        setError(null)
      } else {
        setError(response.data.message || "Lỗi khi cập nhật")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi cập nhật giá")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      {/* Header với decorative background */}
      <div className="mb-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <Stethoscope size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Quản lý giá khám bệnh</h1>
          </div>
          <p className="text-slate-600 text-lg ml-14">Chỉnh sửa giá dịch vụ tư vấn sức khỏe với bác sĩ</p>
        </div>
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
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Lỗi</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && prices.length > 0 && (
        <div className="grid gap-6">
          {prices.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden relative">
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
              
              {editingId === item._id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tên dịch vụ
                      </label>
                      <input
                        type="text"
                        value={editData.serviceName}
                        onChange={(e) => handleChange("serviceName", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Giá (VND)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.isActive}
                        onChange={(e) => handleChange("isActive", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700">Kích hoạt</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSave(item._id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg disabled:bg-slate-300 transition-all font-medium"
                    >
                      <Save size={16} /> {saving ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 disabled:bg-slate-200 transition-colors font-medium"
                    >
                      <X size={16} /> Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-6">
                  {/* Left section with icon */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                      <Activity size={32} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.serviceName}</h3>
                      <p className="text-slate-600 text-sm mb-4">{item.decripton}</p>
                      <div className="flex items-center gap-8 flex-wrap">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <DollarSign size={14} /> Giá hiện tại
                          </p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                            {Number(item.price).toLocaleString("vi-VN")} VND
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Trạng thái</p>
                          <div className="flex items-center gap-2">
                            {item.isActive ? (
                              <>
                                <CheckCircle2 size={18} className="text-green-600" />
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  Hoạt động
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle size={18} className="text-slate-400" />
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                                  Vô hiệu hóa
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium whitespace-nowrap"
                  >
                    <Edit2 size={18} /> Chỉnh sửa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && prices.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-200">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-slate-100 rounded-full">
              <Stethoscope size={48} className="text-slate-400" />
            </div>
          </div>
          <p className="text-slate-500 text-lg">Không có dữ liệu giá khám</p>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}

export default AdminConsultationPricePage
