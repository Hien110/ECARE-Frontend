// src/pages/admin/AdminSupporterServicesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import supporterServicesService from "../../services/supporterServicesService";
import ROUTE_PATH from "../../constants/routePath";

const AdminSupporterServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Create
  const linkToCreateService = useCallback(() => {
    window.location.href = ROUTE_PATH.SUPPORTER_SERVICE_CREATE;
  }, []);

  // Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const emptyForm = {
    name: "",
    description: "",
    price: 0,
    numberOfDays: 7,
  };
  const [editForm, setEditForm] = useState(emptyForm);

  // Delete
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await supporterServicesService.getAllServices();
      if (result?.success) {
        setServices(result.data || []);
      } else {
        setFetchError(result?.message || "Không thể tải danh sách dịch vụ.");
      }
    } catch (err) {
      console.error("Error in fetchServices:", err);
      setFetchError("Có lỗi xảy ra khi lấy danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // --- Edit handlers ---
  const openEdit = useCallback((service) => {
    const id = service._id || service.id;
    setEditingId(id);
    setEditError(null);

    setEditForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price || 0,
      numberOfDays: service.numberOfDays || 7,
    });

    setIsEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setIsEditOpen(false);
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError(null);
  }, []);

  const submitEdit = useCallback(async (e) => {
    e.preventDefault();
    setEditError(null);

    if (!editForm.name.trim()) {
      setEditError("Tên dịch vụ là bắt buộc.");
      return;
    }
    if (editForm.price < 0) {
      setEditError("Giá không thể âm.");
      return;
    }
    if (editForm.numberOfDays < 7) {
      setEditError("Số ngày phải >= 7.");
      return;
    }

    setEditSubmitting(true);

    const payload = {
      name: editForm.name.trim(),
      description: editForm.description?.trim() || "",
      price: Number(editForm.price || 0),
      numberOfDays: Number(editForm.numberOfDays || 7),
    };

    try {
      const result = await supporterServicesService.updateServiceById(editingId, payload);
      if (result?.success) {
        await fetchServices();
        closeEdit();
      } else {
        setEditError(result?.message || "Cập nhật dịch vụ hỗ trợ thất bại.");
      }
    } catch (err) {
      console.error("Error in submitEdit:", err);
      setEditError("Có lỗi xảy ra khi cập nhật dịch vụ.");
    } finally {
      setEditSubmitting(false);
    }
  }, [editForm, editingId, closeEdit, fetchServices]);

  // --- Delete handlers ---
  const openDeleteConfirm = useCallback((serviceId) => {
    setDeletingId(serviceId);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeletingId(null);
    setDeleteError(null);
    setDeleteConfirmOpen(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      const result = await supporterServicesService.deleteServiceById(deletingId);
      if (result?.success) {
        await fetchServices();
        closeDeleteConfirm();
      } else {
        setDeleteError(result?.message || "Xoá dịch vụ hỗ trợ thất bại.");
      }
    } catch (err) {
      console.error("Error in confirmDelete:", err);
      setDeleteError("Có lỗi xảy ra khi xóa dịch vụ.");
    }
  }, [deletingId, fetchServices, closeDeleteConfirm]);

  // --- UI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600 font-medium">Đang tải dịch vụ hỗ trợ...</p>
        </div>
      </div>
    );
  }
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Lỗi tải dữ liệu</h2>
          </div>
          <p className="text-gray-600 mb-6">{fetchError}</p>
          <button
            onClick={fetchServices}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dịch vụ Hỗ Trợ</h1>
          <p className="text-gray-600">Quản lý các dịch vụ chăm sóc người cao tuổi</p>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={linkToCreateService}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo dịch vụ mới
          </button>
        </div>

        {/* Empty state */}
        {services.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-gray-500 mb-6">Hãy tạo dịch vụ đầu tiên để bắt đầu</p>
            <button
              onClick={linkToCreateService}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Tạo dịch vụ
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((s) => {
              const id = s._id || s.id;
              return (
                <div
                  key={id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    {/* Service Info */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.name}</h3>
                      {s.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">Mô tả: {s.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">💰 Giá:</span>
                          <span className="font-semibold text-gray-900">{s.price?.toLocaleString?.("vi-VN") || "0"}₫</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">📅 Thời hạn:</span>
                          <span className="font-semibold text-gray-900">{s.numberOfDays} ngày</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1 flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                        onClick={() => openEdit(s)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Sửa
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                        onClick={() => openDeleteConfirm(id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EDIT MODAL */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 flex items-center justify-between border-b border-blue-800">
                <h2 className="text-2xl font-bold text-white">Sửa dịch vụ</h2>
                <button
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  onClick={closeEdit}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={submitEdit} className="p-6 space-y-6">
              <div className="grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-gray-700">Tên dịch vụ *</span>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Nhập tên dịch vụ"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-gray-700">Mô tả</span>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Mô tả chi tiết về dịch vụ"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-gray-700">Giá (₫) *</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="0"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-gray-700">Số ngày *</span>
                    <input
                      type="number"
                      min="7"
                      required
                      value={editForm.numberOfDays}
                      onChange={(e) => setEditForm({ ...editForm, numberOfDays: e.target.value })}
                      className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="7"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Tối thiểu 7 ngày
                </p>
              </div>

              {editError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-red-700 font-medium">{editError}</div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
                  disabled={editSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xóa dịch vụ?</h3>
            </div>

            <p className="text-gray-600 mb-2">
              Bạn chắc chắn muốn xóa dịch vụ này?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
            </p>

            {deleteError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 mb-6">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-700 font-medium">{deleteError}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                onClick={closeDeleteConfirm}
              >
                Hủy
              </button>
              <button
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                onClick={confirmDelete}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa dịch vụ
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupporterServicesPage;
