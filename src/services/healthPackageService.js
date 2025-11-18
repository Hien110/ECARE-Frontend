import axios from "axios";
const PACKAGE_API_URL = "http://localhost:3000/api/health-packages";
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
