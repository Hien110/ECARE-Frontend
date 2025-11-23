// Admin: Lấy chi tiết 1 đăng ký gói khám
export const getRegisteredPackageById = async (id) => {
  const { data } = await axios.get(`${ADMIN_API_BASE}/registered-packages/${id}`, {
    headers: { ...getAuthHeader() },
  });
  return data;
};
import axios from "axios";

import API_BASE_URL from "../config/api";


const ADMIN_API_BASE = `${API_BASE_URL}/api/admin`;

const getAuthHeader = () => {
  const token = sessionStorage.getItem("ecare_token") || 
                localStorage.getItem("ecare_token") ||
                sessionStorage.getItem("token") || 
                localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Admin: Tạo tài khoản supporter mới
export const createSupporter = async (payload) => {
  // expected payload: { fullName, phoneNumber, gender, password, email? }
  const { data } = await axios.post(`${ADMIN_API_BASE}/supporters`, payload, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Tạo tài khoản doctor mới
export const createDoctor = async (payload) => {
  // expected payload: { fullName, phoneNumber, gender, password, email, dateOfBirth, address? }
  const { data } = await axios.post(`${ADMIN_API_BASE}/doctors`, payload, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Lấy thông tin chi tiết supporter theo userId
export const getSupporterProfile = async (userId) => {
  const { data } = await axios.get(`${ADMIN_API_BASE}/supporters/${userId}`, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Cập nhật trạng thái hoạt động của supporter (khóa/mở khóa)
export const setSupporterActive = async (userId, isActive) => {
  const { data } = await axios.patch(
    `${ADMIN_API_BASE}/supporters/${userId}/status`,
    { isActive },
    { headers: { ...getAuthHeader() } }
  );
  return data;
};

// Admin: Lấy danh sách tất cả supporters
export const getAllSupporters = async () => {
  const { data } = await axios.get(`${ADMIN_API_BASE}/supporters`, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Lấy toàn bộ người dùng trong hệ thống
export const getAllUsers = async () => {
  const { data } = await axios.get(`${ADMIN_API_BASE}/users`, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Get dashboard stats
export const getDashboard = async () => {
  const { data } = await axios.get(`${ADMIN_API_BASE}/dashboard`, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Lấy 1 user theo id (đã giải mã các trường cần thiết)
export const getUserById = async (userId) => {
  const { data } = await axios.get(`${ADMIN_API_BASE}/users/${userId}`, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Bulk import supporters from Excel
export const bulkImportSupporters = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
    
  const { data } = await axios.post(`${ADMIN_API_BASE}/supporters/bulk-import`, formData, {
    headers: { 
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data'
    },
  });
  return data;
};

// Admin: Bulk import doctors from Excel
export const bulkImportDoctors = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
    
  const { data } = await axios.post(`${ADMIN_API_BASE}/doctors/bulk-import`, formData, {
    headers: { 
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data'
    },
  });
  return data;
};
// Admin: Lấy danh sách các gói khám đã đăng ký
export const getRegisteredPackages = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${ADMIN_API_BASE}/registered-packages?${query}` : `${ADMIN_API_BASE}/registered-packages`;
  const { data } = await axios.get(url, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Lấy danh sách bác sĩ gần nhất dựa trên địa chỉ người già
export const getNearbyDoctors = async (elderlyId, maxDistance = 50) => {
  const query = new URLSearchParams({ elderlyId, maxDistance }).toString();
  const { data } = await axios.get(`${ADMIN_API_BASE}/nearby-doctors?${query}`, {
    headers: { ...getAuthHeader() },
  });
  return data;
};

// Admin: Gán bác sĩ cho đăng ký gói khám
export const assignDoctorToRegistration = async (registrationId, doctorId) => {
  const { data } = await axios.post(
    `${ADMIN_API_BASE}/registered-packages/${registrationId}/assign-doctor`,
    { doctorId },
    { headers: { ...getAuthHeader() } }
  );
  return data;
};

// Utility: Kiểm tra quyền admin đơn giản
export const checkAdminAccess = () => {
  const token = sessionStorage.getItem("ecare_token") || localStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'admin';
  } catch {
    return false;
  }
};

// Utility: Format dữ liệu supporter cho hiển thị
export const formatSupporterData = (supporterData) => {
  if (!supporterData) return null;
  
  // Nếu dữ liệu có structure với user field (từ populate)
  const userData = supporterData.user || supporterData;
  
  return {
    id: supporterData._id || supporterData.id,
    fullName: userData.fullName || 'N/A',
    phoneNumber: userData.phoneNumber || 'N/A',
    email: userData.email || 'N/A',
    address: userData.address || 'N/A',
    role: userData.role || 'supporter',
    isActive: userData.isActive !== undefined ? userData.isActive : true,
    gender: userData.gender || 'N/A',
    avatar: userData.avatar || null,
    createdAt: userData.createdAt || null,
    dateOfBirth: userData.dateOfBirth || null,
    // Supporter profile data
    experience: supporterData.experience || null,
    schedule: supporterData.schedule || [],
    serviceArea: supporterData.serviceArea || 0,
    sessionFee: supporterData.sessionFee || { morning: 0, afternoon: 0, evening: 0 },
    ratingStats: supporterData.ratingStats || { averageRating: 0, totalRatings: 0 }
  };
};

// Utility: Validate dữ liệu trước khi tạo supporter
export const validateSupporterData = (data) => {
  const errors = [];
  
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Họ tên phải có ít nhất 2 ký tự');
  }
  
  if (!data.phoneNumber || !/^[0-9]{10,11}$/.test(data.phoneNumber.replace(/\D/g, ''))) {
    errors.push('Số điện thoại không hợp lệ');
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  // Identity card is required now (backend enforces it)
  if (!data.identityCard || String(data.identityCard).trim() === '') {
    errors.push('Căn cước công dân (CCCD) là bắt buộc');
  }
  
  if (!data.dateOfBirth) {
    errors.push('Ngày sinh là bắt buộc');
  } else {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      errors.push('Tuổi phải từ 18 trở lên');
    }
    if (age > 100) {
      errors.push('Tuổi không hợp lệ');
    }
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email không hợp lệ');
  }
  
  if (!['male', 'female', 'other'].includes(data.gender)) {
    errors.push('Giới tính không hợp lệ');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const adminService = {
  createSupporter,
  createDoctor,
  getSupporterProfile,
  setSupporterActive,
  getAllSupporters,
  getAllUsers,
  getUserById,
  bulkImportSupporters,
  bulkImportDoctors,
  checkAdminAccess,
  formatSupporterData,
  validateSupporterData,
  getDashboard,
  getRegisteredPackages,
  getNearbyDoctors,
  assignDoctorToRegistration,
  getRegisteredPackageById,
};

export default adminService;
