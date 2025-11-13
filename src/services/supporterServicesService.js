import axios from "axios";
import API_BASE_URL from "../config/api";

import userService from "./userService";

const URL = `${API_BASE_URL}/api/supporter-services`;

// Lấy danh sách dịch vụ hỗ trợ
const supporterServicesService = {
  getAllServices: async () => {
    try {
        const response = await axios.get(URL, {
            headers: { 
                Authorization: `Bearer ${userService.getAuthToken()}`,
            }
        });
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        console.error("Error fetching supporter services:", error);
        return {
            success: false,
            message: error.response?.data?.message || 'Lấy danh sách dịch vụ hỗ trợ thất bại',
        };
    }
  },

  createService: async (serviceData) => {
    try {
        const response = await axios.post(URL, serviceData, {
            headers: { 
                Authorization: `Bearer ${userService.getAuthToken()}`,
            }
        });
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        console.error("Error creating supporter service:", error);
        return {
            success: false,
            message: error.response?.data?.message || 'Tạo dịch vụ hỗ trợ thất bại',
        };
    }
  },

    updateServiceById: async (serviceId, updateData) => {
    try {
        const response = await axios.put(`${URL}/${serviceId}`, updateData, {
            headers: { 
                Authorization: `Bearer ${userService.getAuthToken()}`,
            }
        });
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        console.error("Error updating supporter service:", error);
        return {
            success: false,
            message: error.response?.data?.message || 'Cập nhật dịch vụ hỗ trợ thất bại',
        };
    }
    },
    deleteServiceById: async (serviceId) => {
    try {
        const response = await axios.delete(`${URL}/${serviceId}`, {
            headers: { 
                Authorization: `Bearer ${userService.getAuthToken()}`,
            }
        });
        return {
            success: true,
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error) {
        console.error("Error deleting supporter service:", error);
        return {
            success: false,
            message: error.response?.data?.message || 'Xoá dịch vụ hỗ trợ thất bại',
        };
    }
    },

};

export default supporterServicesService;
