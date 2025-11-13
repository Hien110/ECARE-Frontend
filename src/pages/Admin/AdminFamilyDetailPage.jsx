import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import adminService from "../../services/adminService";

const AdminFamilyDetailPage = () => {
  const [params] = useSearchParams();
  const userId = params.get("id");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getUserById(userId);
        const userData = res?.data || null;
        setData(userData);
      } catch (e) {
        console.error("❌ AdminFamilyDetailPage - Error:", e);
        setError(e?.response?.data?.message || "Tải thông tin family thất bại");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("vi-VN");
    } catch {
      return iso;
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return <div className="p-4">Không có dữ liệu</div>;

  // Derived fields
  const name = data.fullName || "Người dùng";
  const phone = data.phoneNumber || data.phone || 'N/A';
  const email = data.email || 'N/A';
  const address = data.address || data.homeAddress || 'N/A';
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : 'N/A';
  const age = data.dateOfBirth ? Math.max(0, new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()) : null;
  const joinedAt = data.createdAt ? formatDate(data.createdAt) : 'N/A';
  const isActive = typeof data.isActive === 'boolean' ? data.isActive : true;
  const linkedElders = data.linkedElders || data.linked || data.elderly || data.relatedElders || [];
  const linkedCount = Array.isArray(linkedElders) ? linkedElders.length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Chi tiết người thân</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-700">{name.split(' ').map(n => (n && n[0]) || '').slice(0,2).join('')}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
                    <div className="mt-2 text-sm text-gray-500">
                      {age !== null && <span className="mr-3">{age} tuổi</span>}
                      <span>· Tham gia {joinedAt}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Người già liên kết</div>
                    <div className="text-xl font-bold">{linkedCount}</div>
                  </div>
                </div>

                <p className="mt-4 text-gray-700">{data.description || 'Không có mô tả thêm.'}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Số điện thoại</div>
                    <div className="font-medium">{phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Địa chỉ</div>
                    <div className="font-medium">{address}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ngày sinh</div>
                    <div className="font-medium">{dob}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Trạng thái tài khoản</div>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className={`text-sm font-medium ${isActive ? 'text-green-700' : 'text-gray-600'}`}>{isActive ? 'Đang hoạt động' : 'Đã bị khóa'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">Tóm tắt</div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Người già liên kết</div>
                <div className="font-medium">{linkedCount}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Cập nhật lần cuối</div>
                <div className="font-medium">{data.updatedAt ? formatDate(data.updatedAt) : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Người cao tuổi đã liên kết</h3>
          {linkedCount === 0 ? (
            <div className="text-sm text-gray-500">Chưa có người cao tuổi nào được liên kết với người này.</div>
          ) : (
            <ul className="space-y-3">
              {Array.isArray(linkedElders) && linkedElders.map((item, idx) => {
                const elder = (typeof item === 'string' || typeof item === 'number') ? { _id: item, fullName: item } : item || {};
                const elderName = elder.fullName || elder.name || `Người cao tuổi ${idx+1}`;
                const elderId = elder._id || elder.id || elderId;
                return (
                  <li key={elderId || idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{elderName}</div>
                      <div className="text-sm text-gray-500">{elder.phoneNumber || elder.phone || 'N/A'}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {elderId ? (
                        <Link to={`/admin/elderly-detail?id=${elderId}`} className="text-sm text-blue-600 hover:underline">Xem chi tiết</Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFamilyDetailPage;




