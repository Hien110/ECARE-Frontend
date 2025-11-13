import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import adminService from "../../services/adminService";

const AdminElderlyDetailPage = () => {
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
        console.error("❌ AdminElderlyDetailPage - Error:", e);
        setError(e?.response?.data?.message || "Tải thông tin thất bại");
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

  // Derived values
  const name = data.fullName || "Người dùng";
  const phone = data.phoneNumber || "N/A";
  const email = data.email || "N/A";
  const address = data.address || "N/A";
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : "N/A";
  const age = data.dateOfBirth ? Math.max(0, new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()) : null;
  const roleLabel = data.role === "supporter" ? "Người hỗ trợ" : (data.role === "doctor" ? "Bác sĩ" : "Người cao tuổi");

  // Additional fields expected from DB
  const joinedAt = data.createdAt ? formatDate(data.createdAt) : "N/A";
  const lastUpdated = data.updatedAt ? formatDate(data.updatedAt) : "N/A";
  const appointmentsCount = data.stats?.appointments || data.stats?.totalAppointments || 0;
  const completedCount = data.stats?.completed || 0;
  const cancelledCount = data.stats?.cancelled || 0;
  const medical = data.medical || {};
  const preferredServices = data.preferredServices || data.favoriteServices || data.services || [];
  const emergencyContact = data.emergencyContact || { name: data.emergencyName || null, phone: data.emergencyPhone || data.emergencyContactPhone || null };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Chi tiết người cao tuổi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main profile card (span 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start space-x-6">
              <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-semibold text-blue-700">
                {name.split(" ").map(n => n[0]).slice(0,2).join("")}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>
                    <div className="mt-2 flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">{roleLabel}</span>
                      {age !== null && <span className="text-sm text-gray-500">{age} tuổi</span>}
                      <span className="text-sm text-gray-500">· Tham gia {joinedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Lịch hẹn</div>
                      <div className="text-lg font-bold">{appointmentsCount.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Hoàn thành</div>
                      <div className="text-lg font-bold text-green-600">{completedCount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-gray-700">{data.description || "Không có mô tả thêm."}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-green-50 text-green-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h1l1 2 4-4 7 7 6-6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Số điện thoại</div>
                      <div className="font-medium">{phone}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-medium">{email}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-pink-50 text-pink-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8H5a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v8" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Địa chỉ</div>
                      <div className="font-medium">{address}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-violet-50 text-violet-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Liên hệ khẩn cấp</div>
                      <div className="font-medium">{emergencyContact?.name ? `${emergencyContact.name} — ${emergencyContact.phone ?? 'N/A'}` : (emergencyContact?.phone ?? 'N/A')}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-600">Ngày sinh: <span className="font-medium text-gray-800">{dob}</span></div>
                <div className="mt-1 text-sm text-gray-500">Cập nhật lần cuối: <span className="font-medium text-gray-700">{lastUpdated}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: status, stats, services */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Trạng thái tài khoản</div>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`h-3 w-3 rounded-full ${data.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className={`text-sm font-medium ${data.isActive ? 'text-green-700' : 'text-gray-600'}`}>{data.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">{data.isActive ? 'Khóa tài khoản' : 'Mở khóa'}</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Dịch vụ hoàn thành</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-2xl font-bold text-red-600">{cancelledCount.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Lịch hủy</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">Dịch vụ cung cấp</div>
            <ul className="space-y-2 text-sm text-gray-700">
              {(data.services && data.services.length > 0) ? (
                data.services.map((s, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                    <span>{s}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center space-x-3"><span className="h-3 w-3 rounded-full bg-green-400" /> <span>Chăm sóc cá nhân</span></li>
                  <li className="flex items-center space-x-3"><span className="h-3 w-3 rounded-full bg-green-400" /> <span>Đồng hành tâm lý</span></li>
                  <li className="flex items-center space-x-3"><span className="h-3 w-3 rounded-full bg-green-400" /> <span>Hỗ trợ y tế cơ bản</span></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Medical info and preferred services - full width below */}
      <div className="mt-6 grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin y tế</h3>
          <div className="text-sm text-gray-700 space-y-3">
            <div>
              <div className="text-xs text-gray-500">Tiền sử bệnh</div>
              <div className="mt-1 font-medium">{medical.conditions && medical.conditions.length ? medical.conditions.join(', ') : (medical.conditionNotes || 'Không có dữ liệu')}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Dị ứng</div>
              <div className="mt-1 font-medium">{medical.allergies && medical.allergies.length ? medical.allergies.join(', ') : (medical.allergyNotes || 'Không có dữ liệu')}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Thuốc đang dùng</div>
              <div className="mt-1 font-medium">{(medical.medications && medical.medications.length) ? medical.medications.map(m => `${m.name}${m.dose ? ' - ' + m.dose : ''}`).join(', ') : (medical.medicationNotes || 'Không có dữ liệu')}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Dịch vụ ưa thích</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {preferredServices && preferredServices.length > 0 ? (
              preferredServices.map((s, idx) => (
                <li key={idx} className="flex items-center space-x-3">
                  <span className="h-3 w-3 rounded-full bg-blue-400" />
                  <span>{typeof s === 'string' ? s : (s.name || JSON.stringify(s))}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-center space-x-3"><span className="h-3 w-3 rounded-full bg-blue-400" /> <span>Khám tại nhà</span></li>
                <li className="flex items-center space-x-3"><span className="h-3 w-3 rounded-full bg-blue-400" /> <span>Chăm sóc cá nhân</span></li>
                <li className="flex items-center space-x-3"><span className="h-3 w-3 rounded-full bg-blue-400" /> <span>Tư vấn dinh dưỡng</span></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminElderlyDetailPage;






