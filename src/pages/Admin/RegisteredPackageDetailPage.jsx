import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminService from "../../services/adminService";

const RegisteredPackageDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [doctorError, setDoctorError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminService.getRegisteredPackageById(id);
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || "Không lấy được thông tin chi tiết");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Có lỗi xảy ra khi lấy chi tiết gói khám");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  // Fetch nearby doctors if no doctor assigned
  useEffect(() => {
    if (data && !data.doctor && data.beneficiary?._id) {
      setLoadingDoctors(true);
      setDoctorError("");
      adminService.getNearbyDoctors(data.beneficiary._id, 50)
        .then(res => {
          if (res.success && res.data) {
            setDoctors(res.data.doctors || []);
            if (res.data.doctors.length === 0) {
              setDoctorError("Không tìm thấy bác sĩ nào trong bán kính 50km. Người già có thể chưa có thông tin vị trí.");
            }
          } else {
            setDoctorError(res.message || "Lỗi khi tải danh sách bác sĩ");
          }
        })
        .catch(err => {
          setDoctorError(err?.response?.data?.message || err.message || "Lỗi khi tải danh sách bác sĩ");
        })
        .finally(() => setLoadingDoctors(false));
    }
  }, [data]);

  const handleAssignDoctor = async (doctorId) => {
    if (!data) return;
    setAssigning(true);
    setDoctorError("");
    try {
      const res = await adminService.assignDoctorToRegistration(data._id, doctorId);
      if (res.success) {
        // Refresh detail after assignment
        const refreshed = await adminService.getRegisteredPackageById(data._id);
        setData(refreshed.data);
        alert("Đã gán bác sĩ thành công!");
      } else {
        setDoctorError(res.message || "Lỗi khi gán bác sĩ");
      }
    } catch (err) {
      setDoctorError(err?.response?.data?.message || err.message || "Lỗi khi gán bác sĩ");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-lg">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  const { packageRef, beneficiary, registrant, doctor, registeredAt } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết đăng ký gói khám</h1>
          <div className="mb-6">
            <div className="font-semibold text-gray-700 mb-2">Gói khám:</div>
            <div className="text-lg font-bold text-purple-700">{packageRef?.title}</div>
            <div className="text-gray-600">Thời hạn: {packageRef?.durationDays} ngày</div>
            <div className="text-gray-600">Giá: {packageRef?.price?.toLocaleString()} VNĐ</div>
            <div className="mt-2 text-gray-600">
              <span className="font-medium">Mô tả:</span>
              {Array.isArray(packageRef?.description) ? (
                <ul className="list-disc ml-6 mt-1">
                  {packageRef.description.map((desc, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{desc.serviceName}:</span> {desc.serviceDescription}
                    </li>
                  ))}
                </ul>
              ) : (
                <span>{packageRef?.description}</span>
              )}
            </div>
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold text-gray-700 mb-2">Người hưởng lợi:</div>
              <div className="text-gray-900">{beneficiary?.fullName}</div>
              <div className="text-gray-600">Vai trò: {beneficiary?.role}</div>
              <div className="text-gray-600">Ngày sinh: {beneficiary?.dateOfBirth}</div>
              <div className="text-gray-600">SĐT: {beneficiary?.phoneNumber}</div>
              <div className="text-gray-600">Email: {beneficiary?.email}</div>
              <div className="text-gray-600">Địa chỉ: {beneficiary?.address}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-2">Người đăng ký:</div>
              <div className="text-gray-900">{registrant?.fullName}</div>
              <div className="text-gray-600">Vai trò: {registrant?.role}</div>
              <div className="text-gray-600">SĐT: {registrant?.phoneNumber}</div>
              <div className="text-gray-600">Email: {registrant?.email}</div>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold text-gray-700 mb-2">Bác sĩ phụ trách:</div>
            {doctor ? (
              <>
                <div className="text-gray-900">{doctor?.fullName}</div>
                <div className="text-gray-600">SĐT: {doctor?.phoneNumber}</div>
                <div className="text-gray-600">Email: {doctor?.email}</div>
              </>
            ) : (
              <>
                <div className="text-gray-500 mb-2">Chưa có bác sĩ được gán</div>
                {loadingDoctors ? (
                  <div className="text-center py-4">Đang tải danh sách bác sĩ gần nhất...</div>
                ) : doctorError ? (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{doctorError}</div>
                ) : doctors.length > 0 ? (
                  <div>
                    <p className="mb-4 text-gray-600">
                      Tìm thấy <strong>{doctors.length}</strong> bác sĩ gần nhất (sắp xếp theo khoảng cách)
                    </p>
                    <div className="space-y-3">
                      {doctors.map((doc) => (
                        <div key={doc._id} className="border rounded p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {doc.avatar && (
                                  <img src={doc.avatar} alt={doc.fullName} className="w-12 h-12 rounded-full object-cover" />
                                )}
                                <div>
                                  <h4 className="font-semibold text-lg">{doc.fullName}</h4>
                                  <p className="text-sm text-gray-600">{doc.specializations}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                                <p><strong>Bệnh viện:</strong> {doc.hospitalName}</p>
                                <p><strong>Kinh nghiệm:</strong> {doc.experience} năm</p>
                                <p><strong>Đánh giá:</strong> ⭐ {doc.ratingStats?.averageRating?.toFixed(1) || '0'} ({doc.ratingStats?.totalRatings || 0} đánh giá)</p>
                                <p><strong>Khoảng cách:</strong> <span className="font-semibold text-blue-600">{doc.distance?.toFixed(2) || 'N/A'} km</span></p>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <p><strong>Phí tư vấn:</strong> Online: {doc.consultationFees?.online?.toLocaleString('vi-VN') || '0'} VND | Offline: {doc.consultationFees?.offline?.toLocaleString('vi-VN') || '0'} VND</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAssignDoctor(doc._id)}
                              disabled={assigning}
                              className={`ml-4 px-4 py-2 rounded ${assigning ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {assigning ? 'Đang gán...' : 'Chọn bác sĩ này'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
          <div className="mb-2 text-gray-600">Ngày đăng ký: {registeredAt ? new Date(registeredAt).toLocaleString() : ""}</div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredPackageDetailPage;
