// src/pages/admin/CreateSupporterServicePage.jsx
import React, { useState } from "react";
import supporterServicesService from "../../services/supporterServicesService";
import { useNavigate } from "react-router-dom";

import ROUTE_PATH from "../../constants/routePath";

const SESSION_SLOTS = ["morning", "afternoon", "evening"];
const LABELS = { morning: "Sáng", afternoon: "Chiều", evening: "Tối" };

const CreateSupporterServicePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    bySession: { enabled: true, morning: 0, afternoon: 0, evening: 0 },
    byDay: { enabled: false, dailyFee: 0 },
    byMonth: { enabled: false, monthlyFee: 0, sessionsPerDay: [] },
  });

  const toggleMonthSession = (slot) => {
    setForm((prev) => {
      const setNow = new Set(prev.byMonth.sessionsPerDay || []);
      if (setNow.has(slot)) setNow.delete(slot);
      else setNow.add(slot);
      return { ...prev, byMonth: { ...prev.byMonth, sessionsPerDay: Array.from(setNow) } };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOkMsg("");

    // Validate cơ bản
    if (!form.name.trim()) {
      setError("Tên dịch vụ là bắt buộc.");
      setSubmitting(false);
      return;
    }
    if (form.byMonth.enabled && (!form.byMonth.sessionsPerDay || form.byMonth.sessionsPerDay.length < 1)) {
      setError("Vui lòng chọn ít nhất 1 buổi cho gói thuê theo tháng.");
      setSubmitting(false);
      return;
    }

    // Chuẩn hoá payload
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || "",
      isActive: !!form.isActive,
    };

    if (form.bySession.enabled) {
      payload.bySession = {
        enabled: true,
        morning: Number(form.bySession.morning || 0),
        afternoon: Number(form.bySession.afternoon || 0),
        evening: Number(form.bySession.evening || 0),
      };
    }
    if (form.byDay.enabled) {
      payload.byDay = {
        enabled: true,
        dailyFee: Number(form.byDay.dailyFee || 0),
      };
    }
    if (form.byMonth.enabled) {
      payload.byMonth = {
        enabled: true,
        monthlyFee: Number(form.byMonth.monthlyFee || 0),
        sessionsPerDay: form.byMonth.sessionsPerDay,
      };
    }

    const result = await supporterServicesService.createService(payload);
    setSubmitting(false);

    if (result.success) {
      setOkMsg(result.message || "Tạo dịch vụ hỗ trợ thành công.");
      // Điều hướng về trang danh sách sau 800ms (hoặc click nút)
      setTimeout(() => navigate(ROUTE_PATH.SUPPORTER_SERVICES), 800);
    } else {
      setError(result.message || "Tạo dịch vụ hỗ trợ thất bại.");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Tạo dịch vụ hỗ trợ</h1>
        <button
          onClick={() => navigate(ROUTE_PATH.SUPPORTER_SERVICES)}
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
        >
          ← Danh sách dịch vụ
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Tên dịch vụ *</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded-md px-3 py-2"
              placeholder="VD: Hỗ trợ người già tại nhà"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Mô tả</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border rounded-md px-3 py-2"
              placeholder="Mô tả ngắn gọn về dịch vụ..."
            />
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
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
              checked={form.bySession.enabled}
              onChange={(e) =>
                setForm({ ...form, bySession: { ...form.bySession, enabled: e.target.checked } })
              }
            />
            <span>Bật thuê theo buổi</span>
          </label>

          {form.bySession.enabled && (
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Sáng (₫)</span>
                <input
                  type="number"
                  min="0"
                  value={form.bySession.morning}
                  onChange={(e) =>
                    setForm({ ...form, bySession: { ...form.bySession, morning: e.target.value } })
                  }
                  className="border rounded-md px-3 py-2"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Chiều (₫)</span>
                <input
                  type="number"
                  min="0"
                  value={form.bySession.afternoon}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bySession: { ...form.bySession, afternoon: e.target.value },
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
                  value={form.bySession.evening}
                  onChange={(e) =>
                    setForm({ ...form, bySession: { ...form.bySession, evening: e.target.value } })
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
              checked={form.byDay.enabled}
              onChange={(e) =>
                setForm({ ...form, byDay: { ...form.byDay, enabled: e.target.checked } })
              }
            />
            <span>Bật thuê theo ngày</span>
          </label>

        {form.byDay.enabled && (
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Giá theo ngày (₫)</span>
              <input
                type="number"
                min="0"
                value={form.byDay.dailyFee}
                onChange={(e) =>
                  setForm({ ...form, byDay: { ...form.byDay, dailyFee: e.target.value } })
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
              checked={form.byMonth.enabled}
              onChange={(e) =>
                setForm({ ...form, byMonth: { ...form.byMonth, enabled: e.target.checked } })
              }
            />
            <span>Bật thuê theo tháng</span>
          </label>

          {form.byMonth.enabled && (
            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Giá theo tháng (₫)</span>
                <input
                  type="number"
                  min="0"
                  value={form.byMonth.monthlyFee}
                  onChange={(e) =>
                    setForm({ ...form, byMonth: { ...form.byMonth, monthlyFee: e.target.value } })
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
                        checked={form.byMonth.sessionsPerDay.includes(slot)}
                        onChange={() => toggleMonthSession(slot)}
                      />
                      <span>{LABELS[slot]}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Chọn 1–3 buổi (chọn cả 3 = cả ngày).</p>
              </div>
            </div>
          )}
        </fieldset>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {okMsg && <div className="text-green-700 text-sm">{okMsg}</div>}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/services")}
            className="px-3 py-2 rounded-md border hover:bg-gray-50"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Đang tạo..." : "Tạo dịch vụ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupporterServicePage;
