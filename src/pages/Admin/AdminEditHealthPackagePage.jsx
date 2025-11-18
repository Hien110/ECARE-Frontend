import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getHealthPackageDetail,
  updateHealthPackage,
} from "../../services/healthPackageService";

export default function AdminEditHealthPackagePage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getHealthPackageDetail(id)
      .then((res) => setForm(res.data))
      .catch((err) =>
        setError(
          err?.response?.data?.message || "Lỗi khi lấy chi tiết gói khám"
        )
      );
  }, [id]);

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

  const deleteService = (idx) => {
    setForm((prev) => ({
      ...prev,
      service: prev.service.filter((_, i) => i !== idx),
    }));
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      service: [...prev.service, { serviceName: "", serviceDescription: "" }],
    }));
  };

  const handleDurationOptionsChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(Number(options[i].value));
    }
    setForm((prev) => ({ ...prev, durationOptions: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await updateHealthPackage(id, form);
      setSuccess("Cập nhật gói khám thành công!");
      setTimeout(() => navigate(`/admin/health-packages/${id}`), 1500);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* Nút quay lại – Vuông + nền xanh biển */}
            <button
              onClick={() => navigate("/admin/health-packages")}
              className="px-4 py-2 bg-primary text-primary-foreground 
                   rounded-md shadow-sm font-medium text-base
                   hover:bg-primary/90 transition"
            >
              ← Quay lại
            </button>

            {/* Tiêu đề – sát trái, thẳng hàng với form */}
            <div className="Name-title flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Chỉnh sửa gói khám
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Cập nhật thông tin chi tiết của gói khám sức khỏe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded">
            ✓ {success}
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Thông tin cơ bản
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên gói khám *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="VD: Gói khám tổng quát năm 2024"
                  className="w-full px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mô tả *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về gói khám..."
                  rows={4}
                  className="w-full px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border border-border bg-input cursor-pointer"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Kích hoạt gói
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Thời hạn khám
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Chọn các khoảng thời hạn
                </label>
                <select
                  multiple
                  value={form.durationOptions}
                  onChange={handleDurationOptionsChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={30}>1 tháng</option>
                  <option value={90}>3 tháng</option>
                  <option value={180}>6 tháng</option>
                  <option value={270}>9 tháng</option>
                </select>
                <p className="text-xs text-muted-foreground mt-2">
                  Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Thời hạn tùy ý (ngày)
                </label>
                <input
                  type="number"
                  name="customDuration"
                  min="1"
                  value={form.customDuration || ""}
                  onChange={handleChange}
                  placeholder="VD: 365"
                  className="w-full px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Dịch vụ khám
            </h2>

            {/* --- HEADER TITLES --- */}
            <div className="grid grid-cols-12 font-medium text-sm text-foreground mb-2 px-1">
              <div className="col-span-5">Tên dịch vụ</div>
              <div className="col-span-6">Mô tả ngắn gọn</div>
              <div className="col-span-1 flex items-center justify-center">
                Xóa
              </div>
            </div>

            <div className="space-y-3">
              {form.service.map((s, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 pb-3 border-b border-border last:border-0"
                >
                  {/* Service Name */}
                  <input
                    type="text"
                    value={s.serviceName}
                    onChange={(e) =>
                      handleServiceChange(idx, "serviceName", e.target.value)
                    }
                    placeholder="Tên dịch vụ"
                    className="col-span-5 px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />

                  {/* Service Description */}
                  <input
                    type="text"
                    value={s.serviceDescription}
                    onChange={(e) =>
                      handleServiceChange(
                        idx,
                        "serviceDescription",
                        e.target.value
                      )
                    }
                    placeholder="Mô tả ngắn gọn"
                    className="col-span-6 px-3 py-2 bg-input border border-border rounded text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  <button
                    type="button"
                    onClick={() => deleteService(idx)}
                    className="col-span-1 
             flex items-center justify-center
             bg-muted border border-border 
             rounded-md w-full h-full
             hover:bg-muted/70
             text-destructive font-bold text-sm 
             transition"
                  >
                    X
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addService}
                className="w-full mt-4 px-4 py-2 text-primary border border-primary rounded hover:bg-primary/10 transition-colors font-medium text-sm"
              >
                + Thêm dịch vụ
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật gói khám"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
