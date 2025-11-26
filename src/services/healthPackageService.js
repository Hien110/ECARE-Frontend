
import axios from "axios";
import API_BASE_URL from "../config/api";

const PACKAGE_API_URL = `${API_BASE_URL}/api/health-packages`;
// Lấy danh sách tất cả gói khám

export const getHealthPackages = async () => {
	const token = localStorage.getItem('token');
	const res = await axios.get(PACKAGE_API_URL, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};

// Tạo mới gói khám
// data cần có: title, durationOptions, fees, service, description, isActive, customDuration, customDurationPrice
export const createHealthPackage = async (data) => {
	const token = localStorage.getItem('token');
	const res = await axios.post(`${PACKAGE_API_URL}/health-packages`, data, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};

// Lấy chi tiết 1 gói khám

export const getHealthPackageDetail = async (id) => {
	const token = localStorage.getItem('token');
	const res = await axios.get(`${PACKAGE_API_URL}/${id}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};

// Cập nhật gói khám
// data cần có: title, durationOptions, fees, service, description, isActive, customDuration, customDurationPrice
export const updateHealthPackage = async (id, data) => {
	const token = localStorage.getItem('token');
	const res = await axios.put(`${PACKAGE_API_URL}/update-package/${id}`, data, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};
// Xóa gói khám
export const deleteHealthPackage = async (id) => {
	const token = localStorage.getItem('token');
	const res = await axios.delete(`${PACKAGE_API_URL}/delete-packages/${id}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};

// Lấy danh sách gói khám đã sử dụng bởi beneficiary (người già)
export const getUsedPackagesByBeneficiary = async (userId) => {
	const token = localStorage.getItem('token');
	const res = await axios.get(`${PACKAGE_API_URL}/beneficiary/${userId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};
// Lấy danh sách gói khám đã đăng ký bởi người đăng ký (registrant)
export const getRegisteredPackagesByRegistrant = async (userId) => {
	const token = localStorage.getItem('token');
	const res = await axios.get(`${PACKAGE_API_URL}/registered/${userId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};
// Lấy danh sách lịch hẹn với supporter theo người già (elderly)
export const getSupporterSchedulesByElderly = async (userId) => {
	const token = localStorage.getItem('token');
	const res = await axios.get(`${PACKAGE_API_URL}/registered-packages/${userId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	return res.data;
};

