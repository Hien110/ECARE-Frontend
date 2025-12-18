"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import {
  Edit2,
  Save,
  X,
  AlertCircle,
  Stethoscope,
  Activity,
  DollarSign,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react"
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
        headers: { Authorization: `Bearer ${userService.getAuthToken()}` },
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

  // Chỉ có 1 dịch vụ
  const item = useMemo(() => (prices.length ? prices[0] : null), [prices])

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
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (id) => {
    if (editData.price === "" || Number(editData.price) < 0) {
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
        { headers: { Authorization: `Bearer ${userService.getAuthToken()}` } }
      )

      if (response.data.success) {
        setPrices((prev) => prev.map((p) => (p._id === id ? response.data.data : p)))
        setEditingId(null)
        setEditData({})
        setError(null)
      } else {
        setError(response.data.message || "Lỗi khi cập nhật")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi cập nhật")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="border-b ">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Stethoscope size={18} />
            </div>
            Admin · Dịch vụ tư vấn sức khỏe
          </div>

          <div className="mt-8 grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                Trang giới thiệu dịch vụ khám
                <br />
                <span className="text-blue-600">& quản lý giá</span>
              </h1>

            <div className="mt-4 text-slate-600 text-lg leading-relaxed space-y-3">
  <p>
    Trang này cung cấp thông tin chi tiết về <strong>Dịch vụ Khám &amp; Quản lý giá</strong>,
    bao gồm mô tả dịch vụ, và mức giá đang áp dụng.
  </p>

  <p>
    Người dùng có thể theo dõi đầy đủ các thông tin liên quan đến dịch vụ như
    quy trình khám, ghi chú, điều kiện áp dụng và trạng thái hoạt động hiện tại.
    Nội dung được trình bày rõ ràng để dễ theo dõi và sử dụng.
  </p>

  <p>
    Thông qua hệ thống quản trị, admin có thể cập nhật giá, điều chỉnh trạng thái
    hoạt động và chỉnh sửa nội dung hiển thị của dịch vụ. Các thay đổi sẽ được
    áp dụng trực tiếp và đồng bộ trên hệ thống.
  </p>
</div>



              <div className="mt-6 flex flex-wrap gap-3">
                <Badge icon={<ShieldCheck size={16} />} text="Bảo mật dữ liệu" />
                <Badge icon={<Clock size={16} />} text="Cập nhật giá nhanh" />
                <Badge icon={<Sparkles size={16} />} text="Giao diện giới thiệu" />
              </div>

              <div className="mt-8 flex gap-3">
                <a
                  href="#manage"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
                >
                  <Edit2 size={18} /> Quản lý giá
                </a>
                <a
                  href="#detail"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  <Activity size={18} /> Chi tiết dịch vụ
                </a>
              </div>
            </div>

            {/* Right card */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-lg">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Giá hiện tại</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {item ? Number(item.price).toLocaleString("vi-VN") : "—"} VND
                  </p>
                </div>

                {item?.isActive ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle2 size={16} /> Đang hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                    <XCircle size={16} /> Vô hiệu
                  </span>
                )}
              </div>

              <div className="p-6">
                <p className="text-slate-500 text-sm">Dịch vụ</p>
                <p className="text-lg font-semibold text-slate-900">{item?.serviceName}</p>
                <p className="mt-3 text-slate-600">
                  {item?.decripton || "Mô tả dịch vụ tư vấn sức khỏe."}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <MiniStat label="Tư vấn" value="1-1" />
                  <MiniStat label="Hình thức" value="Chat / Call" />
                  <MiniStat label="Bác sĩ" value="Verified" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section id="detail" className="mx-auto max-w-6xl px-6 py-12">
        {loading && <p className="text-center text-slate-500">Đang tải...</p>}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex gap-2 text-red-600">
              <AlertCircle size={18} /> {error}
            </div>
          </div>
        )}

        {!loading && item && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Intro */}
            <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900">Giới thiệu dịch vụ</h2>
              <p className="mt-4 text-slate-600">{item.decripton}</p>

              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <Feature title="Rõ ràng" desc="Thông tin minh bạch." icon={<DollarSign size={18} />} />
                <Feature title="Tin cậy" desc="Trạng thái hiển thị rõ." icon={<CheckCircle2 size={18} />} />
                <Feature title="Nhanh gọn" desc="Chỉnh sửa trong 1 trang." icon={<Edit2 size={18} />} />
              </div>
            </div>

            {/* Manage */}
            <div id="manage" className="rounded-xl bg-white border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quản lý giá</h3>

              {editingId === item._id ? (
                <div className="space-y-4">
                  <input
                    value={editData.serviceName}
                    onChange={(e) => handleChange("serviceName", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Tên dịch vụ"
                  />

                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Giá"
                  />

                  <textarea
                    rows={4}
                    value={editData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Mô tả"
                  />

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.isActive}
                      onChange={(e) => handleChange("isActive", e.target.checked)}
                    />
                    Kích hoạt
                  </label>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(item._id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-slate-200 py-2 rounded-lg"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit(item)}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} /> Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

/* ---------- Small components ---------- */

const Badge = ({ icon, text }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
    {icon}
    {text}
  </span>
)

const MiniStat = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 p-3 text-center">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-semibold text-slate-800 mt-1">{value}</p>
  </div>
)

const Feature = ({ title, desc, icon }) => (
  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
    <div className="flex items-center gap-2 font-semibold text-slate-800">
      {icon}
      {title}
    </div>
    <p className="mt-2 text-sm text-slate-600">{desc}</p>
  </div>
)

export default AdminConsultationPricePage
