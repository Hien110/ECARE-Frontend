// services/userService.js
import axios from 'axios';
import API_BASE_URL from "../config/api";
  
const API_URL = `${API_BASE_URL}/api/users`;

// Tạo 1 axios instance dùng chung
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// ---- Token helpers ----
const TOKEN_KEY = 'token';
const USER_KEY = 'ecare_user';

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem(TOKEN_KEY);
  }
};

const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

// Khởi tạo token từ localStorage (nếu có)
const persistedToken = getAuthToken();
if (persistedToken) setAuthToken(persistedToken);

// ---- Axios interceptors ----
// Xoá token khi 401 để tránh loop lỗi
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      setAuthToken(null);
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Utils ----
// Chuẩn hoá số điện thoại VN về dạng "0xxxxxxxxx"
function normalizePhoneVNClient(input) {
  const digits = (input || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('84')) return '0' + digits.slice(2);
  if (digits.startsWith('0')) return digits;
  // fallback: nếu người dùng nhập thiếu '0' nhưng đủ 9 số, bạn có thể quyết định thêm '0' vào trước
  return digits.length === 9 ? '0' + digits : digits;
}

// ---- Service ----
const userService = {
  // Đăng ký
  registerUser: async (userData) => {
    try {
      // nếu userData có phoneNumber, chuẩn hoá trước khi gửi
      const payload = {
        ...userData,
        ...(userData?.phoneNumber
          ? { phoneNumber: normalizePhoneVNClient(userData.phoneNumber) }
          : {}),
      };
      const res = await api.post('/registerUser', payload);
      return {
        success: true,
        data: res.data?.data,
        message: res.data?.message || 'Đăng ký thành công',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Đăng ký người dùng thất bại',
      };
    }
  },

  // Đăng nhập
  loginUser: async ({ phoneNumber, password }) => {
    try {
      const normalized = normalizePhoneVNClient(phoneNumber);
      const res = await api.post('/loginUser', { phoneNumber: normalized, password });

      const token = res.data?.token;
      const user = res.data?.user;

      if (token) {
        // Lưu token & gắn header
        setAuthToken(token);
      }

      // Lưu user (tuỳ ý)
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }

      return {
        success: true,
        token: token ?? null,
        user: user ?? null,
        message: res.data?.message || 'Đăng nhập thành công',
      };
    } catch (error) {
      return {
        success: false,
        token: null,
        user: null,
        message: error?.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  },

  // Lấy thông tin user hiện tại
  getUserInfo: async () => {
    try {
      const res = await api.get('/getUserInfo');
      // đồng bộ lại user (nếu server trả về bản mới)
      if (res.data?.data) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.data));
      }
      return { success: true, data: res.data?.data };
    } catch (error) {
      if (error?.response?.status === 401) setAuthToken(null);
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Lấy thông tin người dùng thất bại',
      };
    }
  },

  // Lấy dữ liệu đăng ký tạm (điện thoại upload, máy tính auto-fill)
  getTempRegister: async ({ phoneNumber }) => {
    try {
      const normalized = normalizePhoneVNClient(phoneNumber);
      const res = await api.get('/temp-register', { params: { phoneNumber: normalized } });
      return { success: true, data: res.data?.data };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Không tìm thấy dữ liệu tạm',
      };
    }
  },

  // Đăng xuất
  logout: () => {
    setAuthToken(null);
    localStorage.removeItem(USER_KEY);
    return { success: true };
  },

  // Helpers tiện dụng
  getStoredUser: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setAuthToken,        // public nếu muốn set token thủ công
  getAuthToken,        // đọc token hiện tại
  api,                 // export instance nếu cần dùng chỗ khác
};

export default userService;
