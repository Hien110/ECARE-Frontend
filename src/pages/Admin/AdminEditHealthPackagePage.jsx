
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHealthPackageDetail, updateHealthPackage } from "../../services/healthPackageService";

const DURATION_OPTIONS = [
  { checked: false, days: 30, label: "1 Tháng (30 ngày)", fee: "", isOption: true },
  { checked: false, days: 90, label: "3 Tháng (90 ngày)", fee: "", isOption: true },
  { checked: false, days: 180, label: "6 Tháng (180 ngày)", fee: "", isOption: true },
  { checked: false, days: 270, label: "9 Tháng (270 ngày)", fee: "", isOption: true },
  { checked: false, days: 365, label: "1 Năm (365 ngày)", fee: "", isOption: true },
];

export default function AdminEditHealthPackagePage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
    setLoading(true);
    getHealthPackageDetail(id)
      .then((res) => {
        const pkg = res.data;
        // Map durations (option + custom)
        let durations = [];
        // Option durations (fixed)
        DURATION_OPTIONS.forEach(opt => {
          const found = (pkg.durations || []).find(d => d.days === opt.days && d.isOption);
          durations.push({
            ...opt,
            checked: !!found,
            fee: found ? String(found.fee) : ""
          });
        });
        // Custom durations
        (pkg.durations || []).forEach(d => {
          if (!d.isOption) {
            durations.push({
              checked: true,
              days: String(d.days),
              label: undefined,
              fee: String(d.fee),
              isOption: false
            });
          }
        });
        setForm({
          title: pkg.title || "",
          durations,
          service: pkg.service && pkg.service.length > 0 ? pkg.service : [{ serviceName: "", serviceDescription: "" }],
          description: pkg.description || "",
          isActive: !!pkg.isActive,
        });
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Lỗi khi lấy chi tiết gói khám");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handler for option durations (fixed)
  const handleOptionDurationChange = (idx, field, value) => {
    setForm((prev) => {
      const durations = [...prev.durations];
      if (field === "checked") durations[idx][field] = value;
      else durations[idx][field] = value.replace(/[^0-9]/g, "");
      return { ...prev, durations };
    });
  };

  // Handler for custom durations
  const handleCustomDurationChange = (idx, field, value) => {
    setForm((prev) => {
      const durations = [...prev.durations];
      durations[idx][field] = value.replace(/[^0-9]/g, "");
      return { ...prev, durations };
    });
  };

  // Add a new custom duration
  const addCustomDuration = () => {
    setForm((prev) => ({
      ...prev,
      durations: [
        ...prev.durations,
        { checked: true, days: "", fee: "", isOption: false },
      ],
    }));
  };

  // Remove a custom duration (only for custom, not option)
  const removeCustomDuration = (idx) => {
    setForm((prev) => ({
      ...prev,
      durations: prev.durations.filter((d, i) => i !== idx),
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
    // Build payload for new model
    const durations = form.durations
      .filter((d) => d.checked && d.fee !== "")
      .map((d) => ({
        days: Number(d.days),
        fee: Number(d.fee),
        isOption: !!d.isOption
      }));
    const payload = {
      title: form.title,
      durations,
      service: form.service,
      description: form.description,
      isActive: form.isActive,
    };
    try {
      await updateHealthPackage(id, payload);
      navigate("/admin/health-packages");
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi cập nhật gói khám");
    } finally {
      setLoading(false);
    }
  };

  if (!form)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Chỉnh sửa Gói Khám
          </h1>
          <p className="text-slate-600">
            Cập nhật thông tin chi tiết của gói dịch vụ khám sức khỏe
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
                {/* Option durations (fixed) */}
                {form.durations.map((d, idx) =>
                  d.isOption ? (
                    <div key={d.days} className="flex items-center gap-4 mb-2">
                      <input
                        type="checkbox"
                        checked={d.checked}
                        onChange={(e) =>
                          handleOptionDurationChange(idx, "checked", e.target.checked)
                        }
                        className="accent-blue-600 w-4 h-4"
                      />
                      <span className="text-sm text-slate-700 w-40">
                        {d.label}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={d.fee}
                        onChange={(e) =>
                          handleOptionDurationChange(idx, "fee", e.target.value)
                        }
                        placeholder="Giá cho thời hạn này (VND)"
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                      />
                    </div>
                  ) : null
                )}
                {/* Custom durations */}
                {form.durations.map((c, idx) =>
                  !c.isOption ? (
                    <div key={idx} className="flex items-center gap-4 mb-2">
                      <input
                        type="checkbox"
                        checked={!!c.days}
                        disabled
                        className="accent-blue-600 w-4 h-4"
                      />
                      <input
                        type="number"
                        min="1"
                        value={c.days}
                        onChange={(e) =>
                          handleCustomDurationChange(idx, "days", e.target.value)
                        }
                        placeholder="Thời hạn tuỳ ý (ngày)"
                        className="w-40 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-900"
                      />
                      <input
                        type="text"
                        value={c.fee}
                        onChange={(e) =>
                          handleCustomDurationChange(idx, "fee", e.target.value)
                        }
                        onKeyDown={handlePriceKeyDown}
                        placeholder="Giá cho thời hạn này (VND)"
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomDuration(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Xóa thời hạn"
                      >
                        X
                      </button>
                    </div>
                  ) : null
                )}
                <button
                  type="button"
                  onClick={addCustomDuration}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 text-slate-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition font-medium text-sm"
                >
                  + Thêm Thời Hạn Tuỳ Ý
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
                        X
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
                + Thêm Dịch Vụ
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
                {loading ? "Đang cập nhật..." : "Cập nhật Gói Khám"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
