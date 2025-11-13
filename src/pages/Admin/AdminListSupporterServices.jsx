// src/pages/admin/AdminSupporterServicesPage.jsx
import React, { useEffect, useState } from "react";
import supporterServicesService from "../../services/supporterServicesService";
import ROUTE_PATH from "../../constants/routePath";

const SESSION_SLOTS = ["morning", "afternoon", "evening"];

const AdminSupporterServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Create
  const linkToCreateService = () => {
    window.location.href = ROUTE_PATH.SUPPORTER_SERVICE_CREATE;
  };

  // Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const emptyForm = {
    name: "",
    description: "",
    isActive: true,
    bySession: { enabled: true, morning: 0, afternoon: 0, evening: 0 },
    byDay: { enabled: false, dailyFee: 0 },
    byMonth: { enabled: false, monthlyFee: 0, sessionsPerDay: [] },
  };
  const [editForm, setEditForm] = useState(emptyForm);

  // Delete
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setFetchError(null);
    const result = await supporterServicesService.getAllServices();
    if (result?.success) {
      setServices(result.data || []);
    } else {
      setFetchError(result?.message || "Không thể tải danh sách dịch vụ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // --- Edit handlers ---
  const openEdit = (service) => {
    const id = service._id || service.id;
    setEditingId(id);
    setEditError(null);

    setEditForm({
      name: service.name || "",
      description: service.description || "",
      isActive: !!service.isActive,
      bySession: {
        enabled: service.bySession?.enabled ?? false,
        morning: service.bySession?.morning ?? 0,
        afternoon: service.bySession?.afternoon ?? 0,
        evening: service.bySession?.evening ?? 0,
      },
      byDay: {
        enabled: service.byDay?.enabled ?? false,
        dailyFee: service.byDay?.dailyFee ?? 0,
      },
      byMonth: {
        enabled: service.byMonth?.enabled ?? false,
        monthlyFee: service.byMonth?.monthlyFee ?? 0,
        sessionsPerDay: service.byMonth?.sessionsPerDay ?? [],
      },
    });

    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingId(null);
    setEditForm(emptyForm);
    setEditError(null);
  };

  const toggleMonthSession = (slot) => {
    setEditForm((prev) => {
      const setNow = new Set(prev.byMonth.sessionsPerDay || []);
      if (setNow.has(slot)) setNow.delete(slot);
      else setNow.add(slot);
      return { ...prev, byMonth: { ...prev.byMonth, sessionsPerDay: Array.from(setNow) } };
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditError(null);

    if (!editForm.name.trim()) {
      setEditError("Tên dịch vụ là bắt buộc.");
      return;
    }
    if (editForm.byMonth.enabled && (!editForm.byMonth.sessionsPerDay || editForm.byMonth.sessionsPerDay.length < 1)) {
      setEditError("Vui lòng chọn ít nhất 1 buổi cho gói thuê theo tháng.");
      return;
    }

    setEditSubmitting(true);

    // Chuẩn payload — chỉ gửi các block đang bật
    const payload = {
      name: editForm.name.trim(),
      description: editForm.description?.trim() || "",
      isActive: !!editForm.isActive,
    };
    if (editForm.bySession.enabled) {
      payload.bySession = {
        enabled: true,
        morning: Number(editForm.bySession.morning || 0),
        afternoon: Number(editForm.bySession.afternoon || 0),
        evening: Number(editForm.bySession.evening || 0),
      };
    } else {
      payload.bySession = { enabled: false, morning: 0, afternoon: 0, evening: 0 };
    }
    if (editForm.byDay.enabled) {
      payload.byDay = { enabled: true, dailyFee: Number(editForm.byDay.dailyFee || 0) };
    } else {
      payload.byDay = { enabled: false, dailyFee: 0 };
    }
    if (editForm.byMonth.enabled) {
      payload.byMonth = {
        enabled: true,
        monthlyFee: Number(editForm.byMonth.monthlyFee || 0),
        sessionsPerDay: editForm.byMonth.sessionsPerDay,
      };
    } else {
      payload.byMonth = { enabled: false, monthlyFee: 0, sessionsPerDay: [] };
    }

    const result = await supporterServicesService.updateServiceById(editingId, payload);
    setEditSubmitting(false);

    if (result?.success) {
      await fetchServices();
      closeEdit();
    } else {
      setEditError(result?.message || "Cập nhật dịch vụ hỗ trợ thất bại.");
    }
  };

  // --- Delete handlers ---
  const openDeleteConfirm = (serviceId) => {
    setDeletingId(serviceId);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeletingId(null);
    setDeleteError(null);
    setDeleteConfirmOpen(false);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const result = await supporterServicesService.deleteServiceById(deletingId);
    if (result?.success) {
      await fetchServices();
      closeDeleteConfirm();
    } else {
      setDeleteError(result?.message || "Xoá dịch vụ hỗ trợ thất bại.");
    }
  };

  // --- UI ---
  if (loading) {
    return <div className="p-4 text-gray-700">Đang tải dịch vụ hỗ trợ...</div>;
  }
  if (fetchError) {
    return <div className="p-4 text-red-600">Lỗi: {fetchError}</div>;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Danh sách dịch vụ hỗ trợ</h1>
        <button
          onClick={linkToCreateService}
          className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          + Tạo dịch vụ
        </button>
      </div>

      {/* Empty state */}
      {services.length === 0 ? (
        <div className="border rounded-md p-6 text-center text-gray-600">
          Chưa có dịch vụ nào. Hãy bấm <b>Tạo dịch vụ</b> để thêm mới.
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((s) => {
            const id = s._id || s.id;
            return (
              <div
                key={id}
                className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span
                      className={
                        "text-xs px-2 py-0.5 rounded " +
                        (s.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600")
                      }
                    >
                      {s.isActive ? "Đang hoạt động" : "Tạm tắt"}
                    </span>
                  </div>
                  {s.description ? (
                    <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                  ) : null}

                  {/* tóm tắt giá gọn */}
                  <div className="text-sm text-gray-700 mt-2 space-y-1">
                    {s.bySession?.enabled && (
                      <div>
                        <b>Theo buổi:</b>{" "}
                        sáng {s.bySession.morning?.toLocaleString?.("vi-VN")}₫ • chiều{" "}
                        {s.bySession.afternoon?.toLocaleString?.("vi-VN")}₫ • tối{" "}
                        {s.bySession.evening?.toLocaleString?.("vi-VN")}₫
                      </div>
                    )}
                    {s.byDay?.enabled && (
                      <div>
                        <b>Theo ngày:</b> {s.byDay.dailyFee?.toLocaleString?.("vi-VN")}₫
                      </div>
                    )}
                    {s.byMonth?.enabled && (
                      <div>
                        <b>Theo tháng:</b> {s.byMonth.monthlyFee?.toLocaleString?.("vi-VN")}₫ —{" "}
                        {Array.isArray(s.byMonth.sessionsPerDay) &&
                          s.byMonth.sessionsPerDay.length > 0 &&
                          `Buổi: ${s.byMonth.sessionsPerDay
                            .map((x) =>
                              x === "morning" ? "Sáng" : x === "afternoon" ? "Chiều" : "Tối"
                            )
                            .join(", ")}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-3 sm:mt-0 flex gap-2">
                  <button
                    className="px-3 py-2 rounded-md border hover:bg-gray-50"
                    onClick={() => openEdit(s)}
                  >
                    Sửa
                  </button>
                  <button
                    className="px-3 py-2 rounded-md border text-red-600 hover:bg-red-50"
                    onClick={() => openDeleteConfirm(id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Sửa dịch vụ</h2>
              <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={closeEdit}>
                ✕
              </button>
            </div>

            <form onSubmit={submitEdit} className="space-y-4">
              <div className="grid gap-3">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Tên dịch vụ *</span>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="border rounded-md px-3 py-2"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Mô tả</span>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="border rounded-md px-3 py-2"
                  />
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  <span>Kích hoạt dịch vụ</span>
                </label>
              </div>

              {/* Theo buổi */}
              <fieldset className="border rounded-md p-3">
                <legend className="px-1 text-sm font-medium">Thuê theo buổi</legend>
                <label className="inline-flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={editForm.bySession.enabled}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        bySession: { ...editForm.bySession, enabled: e.target.checked },
                      })
                    }
                  />
                  <span>Bật thuê theo buổi</span>
                </label>

                {editForm.bySession.enabled && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm">Sáng (₫)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.bySession.morning}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bySession: { ...editForm.bySession, morning: e.target.value },
                          })
                        }
                        className="border rounded-md px-3 py-2"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm">Chiều (₫)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.bySession.afternoon}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bySession: { ...editForm.bySession, afternoon: e.target.value },
                          })
                        }
                        className="border rounded-md px-3 py-2"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm">Tối (₫)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.bySession.evening}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bySession: { ...editForm.bySession, evening: e.target.value },
                          })
                        }
                        className="border rounded-md px-3 py-2"
                      />
                    </label>
                  </div>
                )}
              </fieldset>

              {/* Theo ngày */}
              <fieldset className="border rounded-md p-3">
                <legend className="px-1 text-sm font-medium">Thuê theo ngày</legend>
                <label className="inline-flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={editForm.byDay.enabled}
                    onChange={(e) =>
                      setEditForm({ ...editForm, byDay: { ...editForm.byDay, enabled: e.target.checked } })
                    }
                  />
                  <span>Bật thuê theo ngày</span>
                </label>

                {editForm.byDay.enabled && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm">Giá theo ngày (₫)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.byDay.dailyFee}
                        onChange={(e) =>
                          setEditForm({ ...editForm, byDay: { ...editForm.byDay, dailyFee: e.target.value } })
                        }
                        className="border rounded-md px-3 py-2"
                      />
                    </label>
                  </div>
                )}
              </fieldset>

              {/* Theo tháng */}
              <fieldset className="border rounded-md p-3">
                <legend className="px-1 text-sm font-medium">Thuê theo tháng</legend>
                <label className="inline-flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={editForm.byMonth.enabled}
                    onChange={(e) =>
                      setEditForm({ ...editForm, byMonth: { ...editForm.byMonth, enabled: e.target.checked } })
                    }
                  />
                  <span>Bật thuê theo tháng</span>
                </label>

                {editForm.byMonth.enabled && (
                  <div className="grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm">Giá theo tháng (₫)</span>
                      <input
                        type="number"
                        min="0"
                        value={editForm.byMonth.monthlyFee}
                        onChange={(e) =>
                          setEditForm({ ...editForm, byMonth: { ...editForm.byMonth, monthlyFee: e.target.value } })
                        }
                        className="border rounded-md px-3 py-2"
                      />
                    </label>

                    <div className="grid gap-2">
                      <span className="text-sm">Buổi làm trong ngày</span>
                      <div className="flex flex-wrap gap-3">
                        {SESSION_SLOTS.map((slot) => (
                          <label key={slot} className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.byMonth.sessionsPerDay.includes(slot)}
                              onChange={() => toggleMonthSession(slot)}
                            />
                            <span>
                              {slot === "morning" ? "Sáng" : slot === "afternoon" ? "Chiều" : "Tối"}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Chọn 1–3 buổi (chọn cả 3 = cả ngày).</p>
                    </div>
                  </div>
                )}
              </fieldset>

              {editError && <div className="text-sm text-red-600">{editError}</div>}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-3 py-2 rounded-md border"
                  disabled={editSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Xóa dịch vụ?</h3>
            <p className="text-sm text-gray-600">
              Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa dịch vụ này?
            </p>

            {deleteError && <div className="text-sm text-red-600 mt-2">{deleteError}</div>}

            <div className="flex items-center justify-end gap-2 mt-4">
              <button className="px-3 py-2 rounded-md border" onClick={closeDeleteConfirm}>
                Hủy
              </button>
              <button
                className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupporterServicesPage;
