// src/pages/admin/CreateSupporterServicePage.jsx
import React, { useMemo, useState } from "react";
import supporterServicesService from "../../services/supporterServicesService";
import { useNavigate } from "react-router-dom";
import ROUTE_PATH from "../../constants/routePath";
import {
  ArrowLeft,
  Plus,
  Info,
  FileText,
  Tag,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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

  const canSubmit = useMemo(() => {
    if (!form.name?.trim()) return false;
    if (Number(form.price) < 0) return false;
    if (Number(form.numberOfDays) < 7) return false;
    return true;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOkMsg("");

    if (!form.name.trim()) {
      setError("Tên dịch vụ là bắt buộc.");
      setSubmitting(false);
      return;
    }
    if (Number(form.price) < 0) {
      setError("Giá không thể âm.");
      setSubmitting(false);
      return;
    }
    if (Number(form.numberOfDays) < 7) {
      setError("Số ngày phải >= 7.");
      setSubmitting(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || "",
      price: Number(form.price || 0),
      numberOfDays: Number(form.numberOfDays || 7),
    };

    try {
      const result = await supporterServicesService.createService(payload);
      setSubmitting(false);

      if (result?.success) {
        setOkMsg(result.message || "Tạo dịch vụ hỗ trợ thành công.");
        setTimeout(() => navigate(ROUTE_PATH.SUPPORTER_SERVICES), 800);
      } else {
        setError(result?.message || "Tạo dịch vụ hỗ trợ thất bại.");
      }
    } catch (err) {
      console.error("Create service error:", err);
      setSubmitting(false);
      setError("Có lỗi xảy ra khi tạo dịch vụ.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top accent bar */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(ROUTE_PATH.SUPPORTER_SERVICES)}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} className="text-gray-900" />
            Danh sách dịch vụ
          </button>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
                <Info size={16} className="text-blue-700" />
                Tạo mới
              </div>

              <h1 className="mt-3 text-3xl font-bold text-gray-900">
                Tạo dịch vụ hỗ trợ
              </h1>
              <p className="mt-2 text-gray-600">
                Nhập thông tin cơ bản để tạo dịch vụ chăm sóc người cao tuổi.
              </p>
            </div>

            <div className="hidden md:block">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 min-w-[260px]">
                <p className="text-sm font-semibold text-gray-900">
                  Gợi ý nhập liệu
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Tên ngắn gọn, mô tả rõ ràng, giá không âm, thời hạn tối thiểu
                  7 ngày.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form card */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-blue-600">
              <div className="flex items-center gap-2 text-white">
                <Plus size={18} className="text-white" />
                <h2 className="text-lg font-bold">Thông tin dịch vụ</h2>
              </div>
              <p className="text-white/90 text-sm mt-1">
                Vui lòng điền đầy đủ các trường bắt buộc (*).
              </p>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5">
              {/* Name */}
              <Field
                label="Tên dịch vụ *"
                icon={<Tag size={16} className="text-gray-900" />}
              >
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition"
                  placeholder="VD: Hỗ trợ người già tại nhà"
                />
              </Field>

              {/* Description */}
              <Field
                label="Mô tả"
                icon={<FileText size={16} className="text-gray-900" />}
              >
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition resize-none"
                  placeholder="Mô tả ngắn gọn về dịch vụ..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Mẹo: Nêu rõ phạm vi hỗ trợ, thời gian, điều kiện (nếu có).
                </p>
              </Field>

              {/* Price & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Giá (₫) *"
                  icon={<Tag size={16} className="text-gray-900" />}
                >
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition"
                    placeholder="0"
                  />
                </Field>

                <Field
                  label="Số ngày *"
                  icon={<CalendarDays size={16} className="text-gray-900" />}
                >
                  <input
                    type="number"
                    min="7"
                    required
                    value={form.numberOfDays}
                    onChange={(e) =>
                      setForm({ ...form, numberOfDays: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15 focus:border-blue-600 transition"
                    placeholder="7"
                  />
                </Field>
                <p></p>
                <p className="text-xs text-gray-500 mt-2 flex flex-row justify-end">
                  Tối thiểu 7 ngày
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-700 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {okMsg && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 font-semibold flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-700 mt-0.5" />
                  <span>{okMsg}</span>
                </div>
              )}

              {/* Footer buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATH.SUPPORTER_SERVICES)}
                  className="cursor-pointer px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
                  disabled={submitting}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="cursor-pointer px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 inline-flex items-center gap-2"
                  disabled={submitting || !canSubmit}
                  title={
                    !canSubmit
                      ? "Vui lòng nhập đủ và đúng dữ liệu"
                      : "Tạo dịch vụ"
                  }
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="text-white" />
                      Tạo dịch vụ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Side summary */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 h-fit">
            <h3 className="text-lg font-bold text-gray-900">Tóm tắt</h3>
            <p className="text-sm text-gray-600 mt-2">
              Xem nhanh dữ liệu trước khi tạo.
            </p>

            <div className="mt-5 space-y-3">
              <SummaryRow
                label="Tên dịch vụ"
                value={form.name?.trim() ? form.name : "—"}
              />
              <SummaryRow
                label="Mô tả"
                value={form.description?.trim() ? form.description : "—"}
              />
              <SummaryRow
                label="Giá"
                value={`${Number(form.price || 0).toLocaleString("vi-VN")}₫`}
              />
              <SummaryRow
                label="Số ngày"
                value={`${Number(form.numberOfDays || 7)} ngày`}
              />
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">Lưu ý</p>
              <p className="text-sm text-blue-800 mt-1">
                Sau khi tạo thành công, hệ thống sẽ tự chuyển về trang danh
                sách.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-10" />
      </div>
    </div>
  );
};

/* ---------------- Small UI components ---------------- */

const Field = ({ label, icon, children }) => (
  <div className="grid gap-2">
    <div className="flex items-center gap-2">
      <span className="shrink-0">{icon}</span>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
    </div>
    {children}
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
      {value}
    </p>
  </div>
);

export default CreateSupporterServicePage;
