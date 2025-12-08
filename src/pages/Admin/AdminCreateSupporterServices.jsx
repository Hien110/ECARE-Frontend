// src/pages/admin/CreateSupporterServicePage.jsx
import React, { useState } from "react";
import supporterServicesService from "../../services/supporterServicesService";
import { useNavigate } from "react-router-dom";

import ROUTE_PATH from "../../constants/routePath";

const CreateSupporterServicePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    numberOfDays: 7,
  });

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
    if (form.price < 0) {
      setError("Giá không thể âm.");
      setSubmitting(false);
      return;
    }
    if (form.numberOfDays < 7) {
      setError("Số ngày phải >= 7.");
      setSubmitting(false);
      return;
    }

    // Chuẩn hoá payload
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || "",
      price: Number(form.price || 0),
      numberOfDays: Number(form.numberOfDays || 7),
    };

    const result = await supporterServicesService.createService(payload);
    setSubmitting(false);

    if (result.success) {
      setOkMsg(result.message || "Tạo dịch vụ hỗ trợ thành công.");
      // Điều hướng về trang danh sách sau 800ms
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

          <label className="grid gap-1">
            <span className="text-sm font-medium">Giá (₫) *</span>
            <input
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border rounded-md px-3 py-2"
              placeholder="0"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Số ngày *</span>
            <input
              type="number"
              min="7"
              required
              value={form.numberOfDays}
              onChange={(e) => setForm({ ...form, numberOfDays: e.target.value })}
              className="border rounded-md px-3 py-2"
              placeholder="7"
            />
            <p className="text-xs text-gray-500">Tối thiểu 7 ngày</p>
          </label>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {okMsg && <div className="text-green-700 text-sm">{okMsg}</div>}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATH.SUPPORTER_SERVICES)}
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
