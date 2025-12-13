// src/pages/admin/AdminSupporterServicesPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react"
import supporterServicesService from "../../services/supporterServicesService"
import ROUTE_PATH from "../../constants/routePath"
import { Plus, Pencil, Trash2, RefreshCw, Tag, FileText, CalendarDays } from "lucide-react"

const AdminSupporterServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Create
  const linkToCreateService = useCallback(() => {
    window.location.href = ROUTE_PATH.SUPPORTER_SERVICE_CREATE
  }, [])

  // Edit
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState(null)

  const emptyForm = useMemo(
    () => ({
      name: "",
      description: "",
      price: 0,
      numberOfDays: 7,
    }),
    []
  )

  const [editForm, setEditForm] = useState(emptyForm)

  // Delete
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const result = await supporterServicesService.getAllServices()
      if (result?.success) {
        setServices(result.data || [])
      } else {
        setFetchError(result?.message || "Không thể tải danh sách dịch vụ.")
      }
    } catch (err) {
      console.error("Error in fetchServices:", err)
      setFetchError("Có lỗi xảy ra khi lấy danh sách dịch vụ.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // --- Edit handlers ---
  const openEdit = useCallback((service) => {
    const id = service._id || service.id
    setEditingId(id)
    setEditError(null)

    setEditForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price || 0,
      numberOfDays: service.numberOfDays || 7,
    })

    setIsEditOpen(true)
  }, [])

  const closeEdit = useCallback(() => {
    setIsEditOpen(false)
    setEditingId(null)
    setEditForm(emptyForm)
    setEditError(null)
  }, [emptyForm])

  const submitEdit = useCallback(
    async (e) => {
      e.preventDefault()
      setEditError(null)

      if (!editForm.name.trim()) {
        setEditError("Tên dịch vụ là bắt buộc.")
        return
      }
      if (Number(editForm.price) < 0) {
        setEditError("Giá không thể âm.")
        return
      }
      if (Number(editForm.numberOfDays) < 7) {
        setEditError("Số ngày phải >= 7.")
        return
      }

      setEditSubmitting(true)

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description?.trim() || "",
        price: Number(editForm.price || 0),
        numberOfDays: Number(editForm.numberOfDays || 7),
      }

      try {
        const result = await supporterServicesService.updateServiceById(editingId, payload)
        if (result?.success) {
          await fetchServices()
          closeEdit()
        } else {
          setEditError(result?.message || "Cập nhật dịch vụ hỗ trợ thất bại.")
        }
      } catch (err) {
        console.error("Error in submitEdit:", err)
        setEditError("Có lỗi xảy ra khi cập nhật dịch vụ.")
      } finally {
        setEditSubmitting(false)
      }
    },
    [editForm, editingId, closeEdit, fetchServices]
  )

  // --- Delete handlers ---
  const openDeleteConfirm = useCallback((serviceId) => {
    setDeletingId(serviceId)
    setDeleteError(null)
    setDeleteConfirmOpen(true)
  }, [])

  const closeDeleteConfirm = useCallback(() => {
    setDeletingId(null)
    setDeleteError(null)
    setDeleteConfirmOpen(false)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return
    try {
      const result = await supporterServicesService.deleteServiceById(deletingId)
      if (result?.success) {
        await fetchServices()
        closeDeleteConfirm()
      } else {
        setDeleteError(result?.message || "Xoá dịch vụ hỗ trợ thất bại.")
      }
    } catch (err) {
      console.error("Error in confirmDelete:", err)
      setDeleteError("Có lỗi xảy ra khi xóa dịch vụ.")
    }
  }, [deletingId, fetchServices, closeDeleteConfirm])

  // ---------- UI STATES ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
            <div>
              <p className="text-slate-900 font-semibold">Đang tải dịch vụ hỗ trợ…</p>
              <p className="text-slate-500 text-sm">Vui lòng chờ trong giây lát.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="rounded-2xl border border-red-200 bg-white shadow-sm p-8 max-w-xl">
            <p className="text-lg font-bold text-slate-900">Không tải được dữ liệu</p>
            <p className="text-slate-600 mt-2">{fetchError}</p>
            <button
              onClick={fetchServices}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              <RefreshCw size={18} className="text-white" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dịch vụ hỗ trợ</h1>
              <p className="text-slate-600 mt-2">Quản lý các dịch vụ chăm sóc người cao tuổi</p>
            </div>

            <div className="flex gap-2 sm:justify-end">
              <button
                onClick={fetchServices}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
                title="Làm mới"
              >
                <RefreshCw size={18} className="text-slate-900" />
                Làm mới
              </button>

              <button
                onClick={linkToCreateService}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 cursor-pointer transition shadow-sm"
              >
                <Plus size={18} className="text-white" />
                Tạo dịch vụ mới
              </button>
            </div>
          </div>
        </div>

        {/* Empty */}
        {services.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 text-center">
            <p className="text-xl font-semibold text-slate-900">Chưa có dịch vụ nào</p>
            <p className="text-slate-600 mt-2">Hãy tạo dịch vụ đầu tiên để bắt đầu.</p>
            <button
              onClick={linkToCreateService}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              <Plus size={18} className="text-white" />
              Tạo dịch vụ
            </button>
          </div>
        ) : (
          <>
            {/* Summary row */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-slate-600">
                Tổng: <span className="font-semibold text-slate-900">{services.length}</span> dịch vụ
              </p>
            </div>

            {/* List */}
            <div className="space-y-4">
              {services.map((s) => {
                const id = s._id || s.id
                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:shadow-md transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{s.name}</h3>

                        {/* Mô tả (rõ nhãn) */}
                        <div className="mt-3 flex items-start gap-2">
                          <FileText size={16} className="text-slate-900 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">Mô tả</p>
                            {s.description ? (
                              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                                {s.description}
                              </p>
                            ) : (
                              <p className="text-slate-400 text-sm italic">Chưa có mô tả</p>
                            )}
                          </div>
                        </div>

                        {/* Meta (Giá / Thời hạn) */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InfoRow
                            icon={<Tag size={16} className="text-slate-900" />}
                            label="Giá"
                            value={`${s.price?.toLocaleString?.("vi-VN") || "0"}₫`}
                          />
                          <InfoRow
                            icon={<CalendarDays size={16} className="text-slate-900" />}
                            label="Thời hạn"
                            value={`${s.numberOfDays} ngày`}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 lg:justify-end">
                        <button
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil size={16} className="text-slate-900" />
                          Sửa
                        </button>

                        <button
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-white text-red-700 font-semibold hover:bg-red-50 transition"
                          onClick={() => openDeleteConfirm(id)}
                        >
                          <Trash2 size={16} className="text-red-700" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* EDIT MODAL */}
        {isEditOpen && (
          <ModalShell title="Chỉnh sửa dịch vụ" onClose={closeEdit}>
            <form onSubmit={submitEdit} className="p-6 space-y-5">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700">Tên dịch vụ *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
                  placeholder="Nhập tên dịch vụ"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-700">Mô tả</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition resize-none"
                  placeholder="Mô tả chi tiết"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Giá (₫) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Số ngày *</label>
                  <input
                    type="number"
                    min="7"
                    required
                    value={editForm.numberOfDays}
                    onChange={(e) => setEditForm({ ...editForm, numberOfDays: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition"
                    placeholder="7"
                  />
                  <p className="text-xs text-slate-500">Tối thiểu 7 ngày</p>
                </div>
              </div>

              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                  {editError}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={editSubmitting}
                  className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition disabled:opacity-60"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer transition disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {editSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </form>
          </ModalShell>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirmOpen && (
          <ModalShell title="Xóa dịch vụ" onClose={closeDeleteConfirm}>
            <div className="p-6">
              <p className="text-slate-900 font-semibold">Bạn chắc chắn muốn xóa dịch vụ này?</p>
              <p className="text-slate-600 mt-2 text-sm">
                Hành động này không thể hoàn tác và sẽ xóa dữ liệu liên quan.
              </p>

              {deleteError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                  {deleteError}
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end gap-2">
                <button
                  className="cursor-pointer px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition"
                  onClick={closeDeleteConfirm}
                >
                  Hủy
                </button>
                <button
                  className="cursor-pointer px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition inline-flex items-center gap-2"
                  onClick={confirmDelete}
                >
                  <Trash2 size={16} className="text-white" />
                  Xóa
                </button>
              </div>
            </div>
          </ModalShell>
        )}
      </div>
    </div>
  )
}

/* ---------------- Small UI components ---------------- */

const InfoRow = ({ icon, label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="flex items-center gap-2">
      <span className="shrink-0">{icon}</span>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
    </div>
    <p className="mt-1 text-slate-700 font-semibold">{value}</p>
  </div>
)

const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button
          onClick={onClose}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition"
        >
          Đóng
        </button>
      </div>
      {children}
    </div>
  </div>
)

export default AdminSupporterServicesPage
