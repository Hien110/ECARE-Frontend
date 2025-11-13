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
    gender: "female",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
    identityCard: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [detailedAddress, setDetailedAddress] = useState("");
  
  useEffect(() => {
    $(document).ready(function () {
      // New API: only provinces and wards (phường/xã)
      $.getJSON('https://esgoo.net/api-tinhthanh-new/1/0.htm', function (data_tinh) {
        if (data_tinh.error == 0) {
          $.each(data_tinh.data, function (key_tinh, val_tinh) {
            $("#tinh").append('<option value="' + val_tinh.id + '">' + val_tinh.full_name + '</option>');
          });

          $("#tinh").change(function () {
            var idtinh = $(this).val();
            // set selected province name from selected option
            const option = this.options[this.selectedIndex];
            setSelectedProvince({ id: idtinh, name: option ? option.text : '' });

            // Fetch wards (phường/xã) for selected province
            $.getJSON('https://esgoo.net/api-tinhthanh-new/2/' + idtinh + '.htm', function (data_quan) {
              if (data_quan.error == 0) {
                $("#quan").html('<option value="0">Phường Xã</option>');
                $.each(data_quan.data, function (key_quan, val_quan) {
                  $("#quan").append('<option value="' + val_quan.id + '">' + val_quan.full_name + '</option>');
                });
              }
            });
          });
        }
      });
      // When ward changes, update selectedWard state
      $(document).on('change', '#quan', function () {
        const option = this.options[this.selectedIndex];
        const id = this.value;
        setSelectedWard({ id, name: option ? option.text : '' });
      });
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({
      ...prev,
      gender
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.fullName.trim()) {
      errors.push("Họ và tên là bắt buộc");
    }

    if (!formData.phoneNumber.trim()) {
      errors.push("Số điện thoại là bắt buộc");
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      errors.push("Số điện thoại không hợp lệ");
    }

    if (!formData.email.trim()) {
      errors.push("Email là bắt buộc");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Email không hợp lệ");
    }

    if (!formData.dateOfBirth) {
      errors.push("Ngày sinh là bắt buộc");
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 22) {
        errors.push("Tuổi phải từ 22 trở lên để trở thành bác sĩ");
      }
      if (age > 70) {
        errors.push("Tuổi không hợp lệ");
      }
    }

    if (!formData.password) {
      errors.push("Mật khẩu là bắt buộc");
    } else if (formData.password.length < 6) {
      errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push("Mật khẩu xác nhận không khớp");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
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
        identityCard: formData.identityCard.trim()
      };

      await adminService.createDoctor(payload);
      setSuccess("Tạo tài khoản bác sĩ thành công!");

      // Reset form
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        gender: "female",
        dateOfBirth: "",
        address: "",
        password: "",
        confirmPassword: "",
        identityCard: ""
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/admin/users");
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Đã xảy ra lỗi khi tạo tài khoản bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const selectProvince = (province) => setSelectedProvince(province);
  const selectWard = (ward) => setSelectedWard(ward);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo tài khoản Doctor</h1>
              <p className="text-gray-600 mt-1">Thêm Doctor mới vào hệ thống chăm sóc sức khỏe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Form Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
              <p className="text-gray-600">Nhập thông tin cơ bản của doctor</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Full Name */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Phone Number */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => handleGenderChange("female")}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        formData.gender === "female"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-lg">♀</span>
                      <span>Nữ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange("male")}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        formData.gender === "male"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-lg">♂</span>
                      <span>Nam</span>
                    </button>
                  </div>
                </div>

                {/* Address */}
              {/* Địa chỉ */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                
                {/* Detailed Address Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Số nhà, tên đường, tòa nhà..."
                  />
                </div>

                {/* Location Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Province Selector */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="tinh"
                        name="tinh"
                        title="Chọn Tỉnh Thành"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        onChange={(e) => {
                          const province = { id: e.target.value, name: e.target.options[e.target.selectedIndex].text };
                          selectProvince(province);
                        }}
                      >
                        <option value="0">Tỉnh Thành</option>
                      </select>
                    </div>
                  </div>

                  {/* Ward Selector (api returns wards directly for province) */}
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="quan"
                        name="quan"
                        title="Chọn Phường Xã"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        onChange={(e) => {
                          const ward = { id: e.target.value, name: e.target.options[e.target.selectedIndex].text };
                          selectWard(ward);
                        }}
                      >
                        <option value="0">Phường Xã</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Selected Location Summary */}
                {(selectedProvince || selectedWard) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Địa chỉ đã chọn:</h4>
                    <p className="text-sm text-blue-800">
                      {[detailedAddress, selectedWard?.name, selectedProvince?.name]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="doctor@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Identity Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Căn cước công dân <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="identityCard"
                    value={formData.identityCard || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập số căn cước công dân"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <span>Tiếp theo →</span>
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



