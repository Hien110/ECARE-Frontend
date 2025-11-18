
import { useState } from 'react';
import { createHealthPackage } from '@/services/healthPackageService';
import { Trash2, Plus, Check } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function AdminCreateHealthPackagePage() {
  const [form, setForm] = useState({
    title: '',
    durationOptions: [],
    customDuration: '',
    price: '',
    service: [{ serviceName: '', serviceDescription: '' }],
    description: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
      service: [...prev.service, { serviceName: '', serviceDescription: '' }],
    }));
  };

  const removeService = (idx) => {
    setForm((prev) => ({
      ...prev,
      service: prev.service.filter((_, i) => i !== idx),
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
  setError('');
  setLoading(true);

  try {
    await createHealthPackage(form);

    // ⭐ Điều hướng sau khi tạo thành công
    navigate("/admin/health-packages");

  } catch (err) {
    setError(err?.message || 'Lỗi khi tạo gói khám');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Tạo Gói Khám Mới</h1>
          <p className="text-slate-600">Thêm một gói dịch vụ khám sức khỏe mới vào hệ thống</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="text-red-600 font-semibold text-sm">⚠️ Lỗi</div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Section 1: Basic Info */}
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

            {/* Section 2: Pricing & Duration */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
                  2
                </span>
                Giá Cả & Thời Hạn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Giá (VND)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thời Hạn Tuỳ Ý (ngày)
                  </label>
                  <input
                    name="customDuration"
                    type="number"
                    min="1"
                    value={form.customDuration}
                    onChange={handleChange}
                    placeholder="Để trống nếu không cần"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Thời Hạn Gói (chọn nhiều)
                </label>
                <select
                  multiple
                  value={form.durationOptions.map(String)}
                  onChange={handleDurationOptionsChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900 bg-white"
                >
                  <option value="30">1 Tháng</option>
                  <option value="90">3 Tháng</option>
                  <option value="180">6 Tháng</option>
                  <option value="270">9 Tháng</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Giữ Ctrl (Cmd trên Mac) + Click để chọn nhiều
                </p>
              </div>
            </div>

            {/* Section 3: Services */}
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
                        onChange={(e) => handleServiceChange(idx, 'serviceName', e.target.value)}
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
                          handleServiceChange(idx, 'serviceDescription', e.target.value)
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

            {/* Section 4: Status */}
            <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm font-bold">
                  4
                </span>
                Trạng Thái
              </h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 border-slate-300 rounded cursor-pointer accent-blue-600"
                />
                <span className="text-slate-700 font-medium">
                  {form.isActive ? '✓ Kích Hoạt Gói Khám' : 'Vô Hiệu Hóa Gói Khám'}
                </span>
              </label>
            </div>

            {/* Buttons */}
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
                {loading ? 'Đang tạo...' : 'Tạo Gói Khám'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
