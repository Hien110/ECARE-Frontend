import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";
import $ from "jquery";
import BulkImportDoctors from "../Admin/BulkImportDoctorPage";

const AdminCreateDoctorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "Nữ",
    dateOfBirth: "",
    address: "",
    password: "",
    identityCard: "",
    // Doctor Profile fields
    specialization: "",
    experience: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Address states
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [detailedAddress, setDetailedAddress] = useState("");

  // Sync address fields into formData.address
 useEffect(() => {
    setFormData(prev => ({
      ...prev,
      address: [detailedAddress, selectedWard?.name, selectedProvince?.name].filter(Boolean).join(', ')
    }));
  }, [detailedAddress, selectedWard, selectedProvince]);

  // Load provinces & wards via jQuery
   useEffect(() => {
    $(document).ready(function () {
      $.getJSON('https://esgoo.net/api-tinhthanh-new/1/0.htm', function (data_tinh) {
        if (data_tinh.error === 0) {
          $("#tinh").html('<option value="0">Tỉnh Thành</option>');
          $.each(data_tinh.data, function (_, val_tinh) {
            $("#tinh").append('<option value="' + val_tinh.id + '">' + val_tinh.full_name + '</option>');
          });

          $("#tinh").change(function () {
            const idtinh = $(this).val();
            const option = this.options[this.selectedIndex];
            setSelectedProvince({ id: idtinh, name: option ? option.text : '' });

            $.getJSON('https://esgoo.net/api-tinhthanh-new/2/' + idtinh + '.htm', function (data_quan) {
              if (data_quan.error === 0) {
                $("#quan").html('<option value="0">Phường Xã</option>');
                $.each(data_quan.data, function (_, val_quan) {
                  $("#quan").append('<option value="' + val_quan.id + '">' + val_quan.full_name + '</option>');
                });
              }
            });
          });

          $(document).on('change', '#quan', function () {
            const option = this.options[this.selectedIndex];
            const id = this.value;
            setSelectedWard({ id, name: option ? option.text : '' });
          });
        }
      });
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.fullName.trim()) errors.push("Họ và tên là bắt buộc");
    if (!formData.phoneNumber.trim()) errors.push("Số điện thoại là bắt buộc");
    else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\D/g, "")))
      errors.push("Số điện thoại không hợp lệ");
    if (!formData.email.trim()) errors.push("Email là bắt buộc");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.push("Email không hợp lệ");
    if (!formData.dateOfBirth) errors.push("Ngày sinh là bắt buộc");
    else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 22) errors.push("Tuổi phải từ 22 trở lên để trở thành bác sĩ");
      if (age > 70) errors.push("Tuổi không hợp lệ");
    }
    if (!formData.password) errors.push("Mật khẩu là bắt buộc");
    else if (formData.password.length < 6)
      errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    if (!formData.address.trim()) errors.push("Địa chỉ đầy đủ là bắt buộc");
    
    // Validate doctor profile fields
    if (!formData.specialization.trim()) errors.push("Chuyên khoa là bắt buộc");
    if (!formData.experience || formData.experience < 0) errors.push("Kinh nghiệm là bắt buộc và phải >= 0");
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage(errors.join(", "));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address.trim(),
        password: formData.password,
        identityCard: formData.identityCard.trim(),
        // Doctor Profile fields
        specialization: formData.specialization.trim(),
        experience: parseInt(formData.experience) || 0,
        description: formData.description.trim(),
      };

      const res = await adminService.createDoctor(payload);
      setMessage(res?.message || "Tạo tài khoản bác sĩ và hồ sơ chuyên môn thành công!");

      // Reset form
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        gender: "Nữ",
        dateOfBirth: "",
        address: "",
        password: "",

        identityCard: "",
        specialization: "",
        experience: "",
        description: "",
      });
      setSelectedProvince(null);
      setSelectedWard(null);
      setDetailedAddress("");
      $("#tinh").val("0");
      $("#quan").html('<option value="0">Phường Xã</option>');

      // Redirect after 2 seconds
      setTimeout(() => navigate("/admin/staff"), 2000);
    } catch (err) {
      setMessage(
        err?.response?.data?.message || "Đã xảy ra lỗi khi tạo tài khoản bác sĩ"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate("/admin/doctors/import")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow"
          >
            Thêm bác sĩ bằng file Excel
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo tài khoản Doctor
          </h1>
          <p className="text-gray-600">
            Thêm doctor mới vào hệ thống chăm sóc sức khỏe
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("thành công")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="0123 456 789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    {["Nữ", "Nam"].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => handleGenderChange(gender)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                          formData.gender === gender
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <span className="text-lg">
                          {gender === "Nữ" ? "♀" : "♂"}
                        </span>
                        <span>{gender === "Nữ" ? "Nữ" : "Nam"}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed address + Province + Ward */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      value={detailedAddress}
                      onChange={(e) => setDetailedAddress(e.target.value)}
                      placeholder="Số nhà, tên đường..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố
                      </label>
                      <select
                        id="tinh"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      ></select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phường/Xã
                      </label>
                      <select
                        id="quan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      ></select>
                    </div>
                  </div>
                  {(selectedProvince || selectedWard || detailedAddress) && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Địa chỉ đã chọn:
                      </h4>
                      <p className="text-sm text-blue-800">
                        {formData.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="doctor@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Căn cước công dân
                  </label>
                  <input
                    type="text"
                    name="identityCard"
                    value={formData.identityCard || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập số căn cước công dân"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Doctor Profile Information Section */}
            <div className="border-t-2 border-gray-200 pt-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin hồ sơ chuyên môn bác sĩ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chuyên khoa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Tim mạch, Nhi khoa, Tâm lý học..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kinh nghiệm (năm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: 5"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả chuyên môn
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Có 5 năm kinh nghiệm chuyên khoa Tim mạch..."
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <span>Tạo tài khoản</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateDoctorPage;
