import React from 'react';

const ExcelTemplateGenerator = ({ role }) => {
  const generateSupporterTemplate = () => {
    const headers = ['fullName', 'phoneNumber', 'gender', 'password', 'email', 'dateOfBirth', 'address', 'identityCard'];
    const sampleData = [
      ['Nguyễn Văn A', "'0123456789", 'male', "'123456", 'nguyenvana@email.com', "'1/1/1990", '123 Đường ABC, Quận 1, TP.HCM', '123456789012'],
      ['Trần Thị B', "'0987654321", 'female', "'123456", 'tranthib@email.com', "'5/15/1992", '456 Đường XYZ, Quận 2, TP.HCM', '987654321098'],
      ['Lê Văn C', "'0369123456", 'male', "'123456", '', "'12/20/1988", '789 Đường DEF, Quận 3, TP.HCM', '567890123456']
    ];

    // Create CSV content
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_supporters.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateDoctorTemplate = () => {
    const headers = ['fullName', 'phoneNumber', 'email', 'gender', 'password', 'dateOfBirth', 'address','identityCard'];
    const sampleData = [
      ['Bác sĩ Nguyễn Văn C', "'0123456789", 'bacsinvanc@email.com', 'male', "'123456", "'3/20/1985", '789 Đường DEF, Quận 3, TP.HCM', '123456789012'],
      ['Bác sĩ Trần Thị D', "'0987654321", 'bacsinthid@email.com', 'female', "'123456", "'7/10/1988", '321 Đường GHI, Quận 4, TP.HCM', '234567890123'],
      ['Bác sĩ Lê Văn E', "'0369123456", 'bacsinleve@email.com', 'male', "'123456", "'11/15/1982", '654 Đường JKL, Quận 5, TP.HCM', '345678901234']
    ];

    // Create CSV content
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_doctors.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4">
          {role === "supporter" && (
            <button
              onClick={generateSupporterTemplate}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Template Supporters</span>
            </button>
          )}
          {role === "doctor" && (
            <button
              onClick={generateDoctorTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Template Doctors</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tải template phù hợp với loại tài khoản bạn muốn tạo</li>
          <li>• Mở file CSV bằng Excel hoặc Google Sheets</li>
          <li>• Điền thông tin vào các cột theo định dạng mẫu</li>
          <li>• Lưu file dưới định dạng Excel (.xlsx)</li>
          <li>• Upload file đã điền thông tin vào hệ thống</li>
        </ul>
      </div>

      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="font-medium text-yellow-900 mb-2">Lưu ý quan trọng:</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          {role === "supporter" && (
            <>
              <li>• <strong>Supporter:</strong> Tuổi từ 18-100, email tùy chọn</li>
            </>
          )}
          {role === "doctor" && (
            <>
              <li>• <strong>Doctor:</strong> Tuổi từ 22-70, email bắt buộc</li>
            </>
          )}
          <li>• <strong>Số điện thoại:</strong> Phải là duy nhất, format dạng text (thêm dấu ' trước số)</li>
          <li>• Email phải là duy nhất trong hệ thống (nếu có)</li>
          <li>• <strong>Mật khẩu:</strong> Tối thiểu 6 ký tự, format dạng text (thêm dấu ' trước số)</li>
          <li>• <strong>Ngày sinh:</strong> Định dạng M/D/YYYY với dấu ' (ví dụ: '1/1/1990, '12/25/1985)</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelTemplateGenerator;
