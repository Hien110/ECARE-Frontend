import { useEffect, useState } from 'react';
import { getHealthPackages, deleteHealthPackage } from '@/services/healthPackageService';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';

export default function AdminListHealthPackagePage() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await getHealthPackages();
        if (Array.isArray(res)) setPackages(res);
        else if (Array.isArray(res?.data)) setPackages(res.data);
        else setPackages([]);
      } catch (err) {
        setError(err?.message || 'Lỗi khi lấy danh sách gói khám');
        console.error('[v0] Error fetching health packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Khi bấm nút XÓA → chỉ mở modal
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  // Xác nhận xoá từ modal
  const confirmDelete = () => {
    if (!deleteId) return;

    setLoading(true);
    setError('');
    setShowConfirm(false);

    deleteHealthPackage(deleteId)
      .then(() => {
        setPackages(prev => prev.filter(pkg => pkg._id !== deleteId));
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || 'Lỗi khi xóa gói khám');
      })
      .finally(() => {
        setLoading(false);
        setDeleteId(null);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Danh Sách Gói Khám</h1>
            <p className="text-slate-600">Quản lý các gói dịch vụ khám sức khỏe của bạn</p>
          </div>
          <a
            href="/admin/health-packages/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition font-medium whitespace-nowrap"
          >
            <Plus size={20} />
            Thêm Gói Mới
          </a>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="text-red-600 font-semibold text-sm">⚠️ Lỗi</div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600">Đang tải danh sách gói khám...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && packages.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              📦
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Chưa có gói khám nào</h3>
            <p className="text-slate-600 mb-6">Hãy tạo gói khám đầu tiên để bắt đầu</p>
            <a
              href="/admin/health-packages/create"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={18} />
              Tạo Gói Khám
            </a>
          </div>
        )}

        {/* Table */}
        {!loading && packages.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Tên Gói
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Giá
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Thời Hạn
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Dịch Vụ
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Hành Động
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {packages.map((pkg, idx) => (
                    <tr
                      key={pkg._id || idx}
                      className="border-b border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">{pkg.title}</h4>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {pkg.price?.toLocaleString()} VND
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {pkg.durationOptions?.map((duration) => (
                            <span
                              key={duration}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {duration} ngày
                            </span>
                          ))}

                          {pkg.customDuration && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Tuỳ ý: {pkg.customDuration}d
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {pkg.service?.length || 0} dịch vụ
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {pkg.isActive ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              ✓ Kích Hoạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                              ✕ Vô Hiệu
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/admin/health-packages/${pkg._id}`}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </a>

                          <a
                            href={`/admin/health-packages/edit/${pkg._id}`}
                            className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </a>

                          <button
                            onClick={() => handleDelete(pkg._id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Xác nhận xoá
            </h2>

            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn xoá gói khám này không?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
              >
                Hủy
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
