import { useState } from "react";
import { createHealthPackage } from "@/services/healthPackageService";
import { Trash2, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminCreateHealthPackagePage() {
  const [form, setForm] = useState({
    title: "",
    durations: [
      { checked: false, value: 30, label: "1 Tháng (30 ngày)", price: "" },
      { checked: false, value: 90, label: "3 Tháng (90 ngày)", price: "" },
      { checked: false, value: 180, label: "6 Tháng (180 ngày)", price: "" },
      { checked: false, value: 270, label: "9 Tháng (270 ngày)", price: "" },
      { checked: false, value: 365, label: "1 Năm (365 ngày)", price: "" },
    ],
    customDurations: [], 
    service: [{ serviceName: "", serviceDescription: "" }],
    description: "",
    isActive: true,
    price: "", 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServiceChange = (idx, field, value) => {
    setForm((prev) => {
      const newServices = [...prev.service];
      newServices[idx][field] = value;
      return { ...prev, service: newServices };
    });
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      service: [...prev.service, { serviceName: "", serviceDescription: "" }],
    }));
  };

  const removeService = (idx) => {
    setForm((prev) => ({
      ...prev,
      service: prev.service.filter((_, i) => i !== idx),
    }));
  };

  const handleDurationChange = (idx, field, value) => {
    setForm((prev) => {
      const durations = [...prev.durations];
      if (field === "checked") durations[idx][field] = value;
      else durations[idx][field] = value.replace(/[^0-9]/g, "");
      return { ...prev, durations };
    });
  };

  const handleCustomDurationChange = (idx, field, value) => {
    setForm((prev) => {
      const customDurations = [...prev.customDurations];
      if (field === "value")
        customDurations[idx][field] = value.replace(/[^0-9]/g, "");
      else customDurations[idx][field] = value.replace(/[^0-9]/g, "");
      return { ...prev, customDurations };
    });
  };

  const addCustomDuration = () => {
    setForm((prev) => ({
      ...prev,
      customDurations: [...prev.customDurations, { value: "", price: "" }],
    }));
  };

  const removeCustomDuration = (idx) => {
    setForm((prev) => ({
      ...prev,
      customDurations: prev.customDurations.filter((_, i) => i !== idx),
    }));
  };
  const handlePriceKeyDown = (e) => {
  const invalidKeys = ["e", "E", "+", "-", ".", ","];

  if (invalidKeys.includes(e.key)) {
    e.preventDefault();
  }
  const controlKeys = [
    "Backspace", "Delete", "Tab", "Escape", "Enter",
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
  ];
  if (controlKeys.includes(e.key)) return;

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Xử lý dữ liệu gửi lên backend
    const durationOptions = form.durations.filter(d => d.checked).map(d => Number(d.value));
    // fees: mảng các mốc cố định và giá
    const fees = form.durations
      .filter(d => d.checked && d.price !== "")
      .map(d => ({ days: Number(d.value), fee: Number(d.price) }));
    let customDuration, customDurationPrice;
    if (form.customDurations.length > 0) {
      const firstCustom = form.customDurations[0];
      customDuration = Number(firstCustom.value) || undefined;
      customDurationPrice = Number(firstCustom.price) || undefined;
    }
    const payload = {
      title: form.title,
      durationOptions,
      fees,
      service: form.service,
      description: form.description,
      isActive: form.isActive,
      customDuration,
      customDurationPrice
    };
    try {
      await createHealthPackage(payload);
      navigate("/admin/health-packages");
    } catch (err) {
      setError(err?.message || "Lỗi khi tạo gói khám");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Tạo Gói Khám Mới
          </h1>
          <p className="text-slate-600">
            Thêm một gói dịch vụ khám sức khỏe mới vào hệ thống
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="text-red-600 font-semibold text-sm">⚠️ Lỗi</div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                  1
                </span>
                Thông Tin Cơ Bản
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tên Gói Khám
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ví dụ: Gói Khám Toàn Thân Cơ Bản"
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mô Tả Chi Tiết
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả chi tiết về gói khám..."
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900 placeholder-slate-500 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
                  2
                </span>
                Thời Hạn Gói Khám & Giá
              </h2>
              <div className="space-y-4">
                {form.durations.map((d, idx) => (
                  <div key={d.value} className="flex items-center gap-4 mb-2">
                    <input
                      type="checkbox"
                      checked={d.checked}
                      onChange={(e) =>
                        handleDurationChange(idx, "checked", e.target.checked)
                      }
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="text-sm text-slate-700 w-40">
                      {d.label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={d.price}
                      onChange={(e) =>
                        handleDurationChange(idx, "price", e.target.value)
                      }
                      placeholder="Giá cho thời hạn này (VND)"
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                    />
                  </div>
                ))}
                {form.customDurations.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-4 mb-2">
                    <input
                      type="checkbox"
                      checked={!!c.value}
                      disabled
                      className="accent-blue-600 w-4 h-4"
                    />
                    <input
                      type="number"
                      min="1"
                      value={c.value}
                      onChange={(e) =>
                        handleCustomDurationChange(idx, "value", e.target.value)
                      }
                      placeholder="Thời hạn tuỳ ý (ngày)"
                      className="w-40 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-900"
                    />
                    <input
                      type="text"
                      value={c.price}
                      onChange={(e) =>
                        handleCustomDurationChange(idx, "price", e.target.value)
                      }
                      onKeyDown={handlePriceKeyDown}
                      placeholder="Giá cho thời hạn này (VND)"
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2
             focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                    />

                    <button
                      type="button"
                      onClick={() => removeCustomDuration(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Xóa thời hạn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCustomDuration}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 text-slate-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition font-medium text-sm"
                >
                  <Plus size={18} />
                  Thêm Thời Hạn Tuỳ Ý
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                  3
                </span>
                Dịch Vụ Bao Gồm
              </h2>
              <div className="space-y-4 mb-4">
                {form.service.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 items-end p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Tên Dịch Vụ
                      </label>
                      <input
                        value={s.serviceName}
                        onChange={(e) =>
                          handleServiceChange(
                            idx,
                            "serviceName",
                            e.target.value
                          )
                        }
                        placeholder="Ví dụ: Khám Tim Mạch"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-900 placeholder-slate-400"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Mô Tả Dịch Vụ
                      </label>
                      <input
                        value={s.serviceDescription}
                        onChange={(e) =>
                          handleServiceChange(
                            idx,
                            "serviceDescription",
                            e.target.value
                          )
                        }
                        placeholder="Mô tả ngắn gọn..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-900 placeholder-slate-400"
                      />
                    </div>
                    {form.service.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Xóa dịch vụ"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 text-slate-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition font-medium text-sm"
              >
                <Plus size={18} />
                Thêm Dịch Vụ
              </button>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                {loading ? "Đang tạo..." : "Tạo Gói Khám"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
