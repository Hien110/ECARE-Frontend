import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHealthPackageDetail } from "../../services/healthPackageService";

export default function AdminHealthPackageDetailPage() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHealthPackageDetail(id)
      .then((res) => setPkg(res.data))
      .catch((err) =>
        setError(
          err?.response?.data?.message || "Lỗi khi lấy chi tiết gói khám"
        )
      );
  }, [id]);

  if (error)
    return (
      <div className="text-red-500 font-semibold text-center mt-6">{error}</div>
    );
  if (!pkg) return <div className="text-center mt-6">Đang tải...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Chi tiết gói khám
      </h2>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {/* Tên gói */}
        <div className="mb-4">
          <label className="font-semibold text-gray-700">Tên gói:</label>
          <p className="text-lg text-gray-900">{pkg.title}</p>
        </div>

        {/* Thời hạn */}
        <div className="mb-4">
          <label className="font-semibold text-gray-700">Thời hạn:</label>
          <p className="text-gray-800">
            {pkg.durationOptions?.join(", ")}{" "}
            {pkg.customDuration && `, ${pkg.customDuration} ngày`}
          </p>
        </div>

        {/* Giá */}
        <div className="mb-4">
          <label className="font-semibold text-gray-700">Giá:</label>
          <p className="text-green-600 font-bold text-lg">
            {pkg.price?.toLocaleString()} VND
          </p>
        </div>

        {/* Mô tả */}
        <div className="mb-4">
          <label className="font-semibold text-gray-700">Mô tả:</label>
          <p className="text-gray-800 leading-relaxed">{pkg.description}</p>
        </div>

        {/* Kích hoạt */}
        <div className="mb-4">
          <label className="font-semibold text-gray-700">Trạng thái:</label>
          <span
            className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
              pkg.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {pkg.isActive ? "Đang kích hoạt" : "Không hoạt động"}
          </span>
        </div>

        {/* Dịch vụ */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">
            Dịch vụ bao gồm:
          </label>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                    Tên dịch vụ
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                    Mô tả ngắn gọn
                  </th>
                </tr>
              </thead>

              <tbody>
                {pkg.service?.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 border-b font-medium text-gray-900">
                      {s.serviceName}
                    </td>
                    <td className="px-4 py-2 border-b text-gray-700">
                      {s.serviceDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <Link
            to="/admin/health-packages"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}
