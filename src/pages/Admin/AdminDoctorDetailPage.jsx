import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import adminService from "../../services/adminService";

const AdminDoctorDetailPage = () => {
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
        console.error("❌ AdminDoctorDetailPage - Error:", e);
        setError(e?.response?.data?.message || "Tải thông tin doctor thất bại");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return <div className="p-4">Không có dữ liệu</div>;

  const name = data.fullName || 'Bác sĩ';
  const phone = data.phoneNumber || 'N/A';
  const email = data.email || 'N/A';
  const workplace = data.workplace || data.address || 'N/A';
  const specialty = data.specialty || data.title || 'Chuyên khoa tổng quát';
  const experience = data.experience || 0;
  const rating = data.rating || 0;
  const patients = data.patients || data.patientCount || 0;
  const qualifications = data.education || data.qualifications || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Chi tiết bác sĩ</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start space-x-6">
            <img src={data.avatar || '/placeholder-doctor.png'} alt="avatar" className="w-20 h-20 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{name}</h2>
                  <div className="text-sm text-gray-500 mt-1">{specialty} ・ {experience} năm</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">{rating} <span className="text-sm text-gray-500">({data.ratingCount || 0} đánh giá)</span></div>
                  <div className="text-sm text-gray-500">{patients} bệnh nhân</div>
                </div>
              </div>

              <p className="mt-4 text-gray-700">{data.description || 'Không có mô tả chuyên môn.'}</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-green-50 text-green-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h1l1 2 4-4 7 7 6-6" /></svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Số điện thoại</div>
                    <div className="font-medium">{phone}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium">{email}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-pink-50 text-pink-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.866-3.582 7-8 7v-4a4 4 0 018 0v-3z" /></svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Nơi công tác</div>
                    <div className="font-medium">{workplace}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{data.stats?.completed || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Lịch hoàn thành</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{data.stats?.cancelled || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Lịch hủy</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm font-semibold text-gray-900 mb-3">Học vấn & Chứng chỉ</div>
            <ul className="space-y-2 text-sm text-gray-700">
              {qualifications.length > 0 ? qualifications.map((q, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="h-3 w-3 rounded-full bg-blue-400 mt-1" />
                  <span>{q}</span>
                </li>
              )) : (
                <li className="flex items-start space-x-3"><span className="h-3 w-3 rounded-full bg-blue-400 mt-1" /> <span>Chưa có thông tin</span></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorDetailPage;






