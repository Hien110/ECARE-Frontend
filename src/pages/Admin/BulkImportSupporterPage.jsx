import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";
import ExcelTemplateGenerator from "../../components/ExcelTemplateGenerator";

const BulkImportSupporterPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && file.type !== "application/vnd.ms-excel") {
        setMessage("Chỉ chấp nhận file Excel (.xlsx, .xls)");
        return;
      }
      setSelectedFile(file);
      setMessage("");
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage("Vui lòng chọn file Excel");
      return;
    }
    setLoading(true);
    setMessage("");
    setImportResults(null);
    try {
      const response = await adminService.bulkImportSupporters(selectedFile);
      setImportResults(response.data);
      setMessage(response.message || "Import thành công");
      setSelectedFile(null);
      document.getElementById('file-input-supporter').value = '';
    } catch (error) {
      setMessage(error?.response?.data?.message || "Có lỗi xảy ra khi import file");
    } finally {
      setLoading(false);
    }
  };

  const renderImportResults = () => {
    if (!importResults) return null;
    return (
      <div className="mt-6 space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kết quả Import</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importResults.success?.length || 0}</div>
              <div className="text-sm text-green-700">Thành công</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importResults.errors?.length || 0}</div>
              <div className="text-sm text-red-700">Lỗi</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importResults.total || 0}</div>
              <div className="text-sm text-blue-700">Tổng cộng</div>
            </div>
          </div>
          {importResults.success?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-green-700 mb-2">✅ Danh sách thành công:</h4>
              <div className="bg-green-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {importResults.success.map((item, index) => (
                  <div key={index} className="text-sm text-green-700 py-1">
                    Dòng {item.row}: {item.fullName} - {item.phoneNumber}
                  </div>
                ))}
              </div>
            </div>
          )}
          {importResults.errors?.length > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ Danh sách lỗi:</h4>
              <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {importResults.errors.map((item, index) => (
                  <div key={index} className="text-sm text-red-700 py-1">
                    <div className="font-medium">Dòng {item.row}:</div>
                    <div className="ml-4">
                      {item.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-xs">• {error}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm Người hỗ trợ Bằng Excel</h1>
            <p className="text-gray-600">Tạo nhiều tài khoản Người hỗ trợ cùng lúc từ file Excel</p>
          </div>
          <button
            onClick={() => navigate("/admin/supporters/create")}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <ExcelTemplateGenerator />
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload file Excel</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <label htmlFor="file-input-supporter" className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900">Chọn file Excel</span>
                <span className="text-gray-500"> hoặc kéo thả vào đây</span>
              </label>
              <input
                id="file-input-supporter"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Đã chọn: <span className="font-medium">{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleImport}
              disabled={loading || !selectedFile}
              className={`px-8 py-3 rounded-lg font-medium text-white flex items-center space-x-2 ${
                loading || !selectedFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Bắt đầu Import</span>
                </>
              )}
            </button>
          </div>
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.includes("thành công") || message.includes("Import hoàn thành")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}>
              {message}
            </div>
          )}
          {renderImportResults()}
        </div>
      </div>
    </div>
  );
};

export default BulkImportSupporterPage;
