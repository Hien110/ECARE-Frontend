import React, { useEffect, useState } from "react";
import $ from "jquery";
import adminService from "../../services/adminService";
import { useNavigate } from "react-router-dom";

const AdminCreateSupporterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    gender: "Nam",
    password: "",
    email: "",
    dateOfBirth: "",
    address: "",
    identityCard: "",
    experience: {
      totalYears: "",
      description: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Location selector states
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [detailedAddress, setDetailedAddress] = useState("");

  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("experience.")) {
      const field = name.split(".")[1];
      setForm({
        ...form,
        experience: {
          ...form.experience,
          [field]: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Đồng bộ detailedAddress, selectedWard, selectedProvince vào form.address
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      address: [detailedAddress, selectedWard?.name, selectedProvince?.name]
        .filter(Boolean)
        .join(", "),
    }));
  }, [detailedAddress, selectedWard, selectedProvince]);

  // jQuery-based address loading
  useEffect(() => {
    $(document).ready(function () {
      $.getJSON(
        "https://esgoo.net/api-tinhthanh-new/1/0.htm",
        function (data_tinh) {
          if (data_tinh.error === 0) {
            $("#tinh").html('<option value="0">Tỉnh Thành</option>');
            $.each(data_tinh.data, function (_, val_tinh) {
              $("#tinh").append(
                '<option value="' +
                  val_tinh.id +
                  '">' +
                  val_tinh.full_name +
                  "</option>"
              );
            });

            $("#tinh").change(function () {
              var idtinh = $(this).val();
              const option = this.options[this.selectedIndex];
              setSelectedProvince({
                id: idtinh,
                name: option ? option.text : "",
              });

              $.getJSON(
                "https://esgoo.net/api-tinhthanh-new/2/" + idtinh + ".htm",
                function (data_quan) {
                  if (data_quan.error === 0) {
                    $("#quan").html('<option value="0">Phường Xã</option>');
                    $.each(data_quan.data, function (_, val_quan) {
                      $("#quan").append(
                        '<option value="' +
                          val_quan.id +
                          '">' +
                          val_quan.full_name +
                          "</option>"
                      );
                    });
                  }
                }
              );
            });

            $(document).on("change", "#quan", function () {
              const option = this.options[this.selectedIndex];
              const id = this.value;
              setSelectedWard({ id, name: option ? option.text : "" });
            });
          }
        }
      );
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate data
    if (!form.address || form.address.trim() === "") {
      setMessage("Lỗi: Vui lòng chọn địa chỉ đầy đủ");
      setLoading(false);
      return;
    }

    const validation = adminService.validateSupporterData(form);
    if (!validation.isValid) {
      setMessage("Lỗi: " + validation.errors.join(", "));
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.createSupporter(form);
      setMessage(res?.message || "Tạo tài khoản supporter thành công");
      // Reset form
      setForm({
        fullName: "",
        phoneNumber: "",
        gender: "Nam",
        password: "",
        email: "",
        dateOfBirth: "",
        address: "",
        identityCard: "",
        experience: {
          totalYears: "",
          description: "",
        },
      });
      setSelectedProvince(null);
      setSelectedWard(null);
      setDetailedAddress("");
      $("#tinh").val("0");
      $("#quan").html('<option value="0">Phường Xã</option>');
    } catch (err) {
      setMessage(err?.response?.data?.message || "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate("/admin/supporters/import")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow"
          >
            Thêm người hỗ trợ bằng file Excel
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo tài khoản Người Hỗ Trợ
          </h1>
          <p className="text-gray-600">
            Thêm người hỗ trợ mới vào hệ thống chăm sóc sức khỏe
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ và tên đầy đủ"
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0123 456 789"
                  required
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <div className="flex space-x-3">
                  {[
                    { value: "Nữ", label: "Nữ", icon: "♀" },
                    { value: "Nam", label: "Nam", icon: "♂" },
                  ].map((option) => (
                    <label key={option.value} className="flex-1">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={form.gender === option.value}
                        onChange={onChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-full py-3 px-4 border-2 rounded-lg text-center cursor-pointer ${
                          form.gender === option.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        <span className="text-lg mb-1 block">
                          {option.icon}
                        </span>
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="supporter@email.com"
                />
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Số nhà, tên đường, tòa nhà..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tinh"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Tỉnh Thành</option>
                    </select>
                  </div>

                  {/* Ward */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="quan"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Phường Xã</option>
                    </select>
                  </div>
                </div>

                {/* Selected Location Summary */}
                {(selectedProvince || selectedWard || detailedAddress) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Địa chỉ đã chọn:
                    </h4>
                    <p className="text-sm text-blue-800">{form.address}</p>
                  </div>
                )}
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
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
                  value={form.identityCard}
                  onChange={onChange}
                  placeholder="Nhập số căn cước công dân"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Experience - Years */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kinh nghiệm (năm)
                </label>
                <input
                  type="number"
                  name="experience.totalYears"
                  value={form.experience.totalYears}
                  onChange={onChange}
                  placeholder="Nhập số năm kinh nghiệm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              {/* Experience - Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả kinh nghiệm
                </label>
                <textarea
                  name="experience.description"
                  value={form.experience.description}
                  onChange={onChange}
                  placeholder="Mô tả chi tiết về kinh nghiệm làm việc, kỹ năng..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("thành công")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
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

export default AdminCreateSupporterPage;
