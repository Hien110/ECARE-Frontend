import axios from "axios";
import API_BASE_URL from "../config/api";

import userService from "./userService";

const URL = `${API_BASE_URL}/api/supporter-schedulings`;

const supporterSchedulingService = {
  // Lấy danh sách lịch hỗ trợ
  getAllSchedulingsForAdmin: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const response = await axios.get(`${URL}/admin/all`, {
        headers: {
          Authorization: `Bearer ${userService.getAuthToken()}`,
        },
        params: {
          page,
          limit,
        },
      });

      return {
        success: true,
        data: response.data.data, // danh sách lịch hỗ trợ
        pagination: response.data.pagination, // { page, limit, total }
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error fetching supporter schedulings:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Lấy danh sách lịch hỗ trợ thất bại",
      };
    }
  },

  // Lấy chi tiết lịch hỗ trợ theo ID
  getSchedulingDetailById: async (schedulingId) => {
    try {
      const response = await axios.get(`${URL}/${schedulingId}`, {
        headers: {
          Authorization: `Bearer ${userService.getAuthToken()}`,
        },
      });

      return {
        success: true,
        data: response.data.data, // chi tiết lịch hỗ trợ
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error fetching supporter scheduling detail:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Lấy chi tiết lịch hỗ trợ thất bại",
      };
    }
  },
};

export default supporterSchedulingService;
