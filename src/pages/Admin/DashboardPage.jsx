import React, { useEffect, useState } from 'react';
import adminService, { getSupporterSchedulesByStatus, getRegisteredPackages } from '../../services/adminService';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month (1-12)
  const [registeredPackages, setRegisteredPackages] = useState([]);
  const [supporterSchedules, setSupporterSchedules] = useState([]);
  const [stats, setStats] = useState({
    counts: { totalResidents: 0, familyMembers: 0, activeSupporters: 0, doctors: 0, admins: 0 },
    paymentsByStatus: {},
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [supporterCompleted, setSupporterCompleted] = useState(0);
  const [supporterCanceled, setSupporterCanceled] = useState(0);

  // Fetch registered packages và supporter schedules
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all registered packages (with high limit to get all)
        const registeredRes = await getRegisteredPackages({ page: 1, limit: 1000 });
        if (registeredRes && registeredRes.success && registeredRes.data) {
          const items = registeredRes.data.items || [];
          setRegisteredPackages(items);
        }

        // Fetch all completed supporter schedules
        const schedulesRes = await getSupporterSchedulesByStatus('completed');
        if (schedulesRes && schedulesRes.success && Array.isArray(schedulesRes.data)) {
          setSupporterSchedules(schedulesRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await getHealthPackages();
        if (Array.isArray(res)) setPackages(res);
        else if (Array.isArray(res?.data)) setPackages(res.data);
        else setPackages([]);
      } catch (err) {
        console.error('[v0] Error fetching health packages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();

    // Lấy số lượng lịch hẹn supporter đã hoàn thành
    getSupporterSchedulesByStatus('completed')
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          setSupporterCompleted(res.data.length);
        } else {
          setSupporterCompleted(0);
        }
      })
      .catch(() => setSupporterCompleted(0));

    // Lấy số lượng lịch hẹn supporter đã hủy
    getSupporterSchedulesByStatus('canceled')
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          setSupporterCanceled(res.data.length);
        } else {
          setSupporterCanceled(0);
        }
      })
      .catch(() => setSupporterCanceled(0));
  }, []);

  // Filter data by selected month
  const filterByMonth = (items, dateField) => {
    if (!items || !Array.isArray(items)) return [];
    if (!selectedMonth || selectedMonth === 0) return items;
    
    const currentYear = new Date().getFullYear();
    return items.filter(item => {
      if (!item) return false;
      // For supporter schedules, use scheduleDate if available, otherwise createdAt
      const dateValue = item[dateField] || (dateField === 'scheduleDate' ? item.createdAt : null);
      if (!dateValue) return false;
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return false;
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === currentYear;
    });
  };

  // Get filtered data
  const filteredRegisteredPackages = filterByMonth(registeredPackages, 'registeredAt');
  const filteredSupporterSchedules = filterByMonth(supporterSchedules, 'startDate');
  
  // Count registered packages with doctors
  const registeredPackagesWithDoctors = filteredRegisteredPackages.filter(pkg => pkg.doctor).length;
  
  // Count completed supporter schedules
  const completedSupporterSchedules = filteredSupporterSchedules.length;

  // 2-column chart data for selected month
  const chartColumns = [
    {
      id: 'packages',
      label: 'Gói khám đã đặt',
      count: registeredPackagesWithDoctors,
      color: 'bg-blue-500'
    },
    {
      id: 'supporter',
      label: 'Lịch hẹn supporter hoàn thành',
      count: completedSupporterSchedules,
      color: 'bg-green-500'
    }
  ];
  const maxColumnValue = Math.max(...chartColumns.map(col => col.count), 1);
  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        if (mounted && res && res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Đang tải dashboard...</div>;

  const { counts, paymentsByStatus, monthlyRevenue } = stats;

  // Đếm số lượng gói khám đang active
  const activeHealthPackages = packages.filter(pkg => pkg.isActive).length;

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Thống Kê</h1>
        <p className="text-gray-600">Chào Mừng Quay Trở Lại, Quản Trị Viên. Đây Là Trang Thống Kê Khám Bệnh.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hồ sơ doanh thu theo tháng</h3>
              <p className="text-sm text-gray-500">Thống kê số lượng dịch vụ đã đăng ký và lịch hẹn với cộng tác viên </p>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="month-filter" className="text-sm font-medium text-gray-600">Lọc theo tháng</label>
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value={0}>Tất cả</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                  <option key={month} value={month}>Tháng {month}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-64 flex items-end justify-around px-6">
              {chartColumns.map(({ id, label, count, color }) => (
                <div key={id} className="flex flex-col items-center flex-1 max-w-[180px]">
                  <div
                    className={`w-16 rounded-t transition-all duration-300 ${color}`}
                    style={{
                      height: `${(count / maxColumnValue) * 100}%`,
                      minHeight: count > 0 ? '16px' : '4px'
                    }}
                  ></div>
                  <div className="text-sm font-semibold text-gray-800 mt-3 text-center">{label}</div>
                  <div className="text-xl font-bold text-gray-900">{count.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Số liệu {selectedMonth ? `tháng ${selectedMonth}` : 'tất cả tháng'} - {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Total Residents Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">{counts.totalResidents.toLocaleString()}</div>
              <div className="bg-white/20 px-2 py-1 rounded text-sm">{counts.totalResidents ? Math.round((counts.totalResidents / (counts.totalResidents + counts.familyMembers + counts.activeSupporters + counts.doctors + 1)) * 100) + '%' : '0%'}</div>
            </div>
            <div className="text-blue-100 text-sm mb-4">Thống Kê Người Già</div>
            <div className="h-16 bg-white/10 rounded-lg mb-4"></div>
          </div>

          {/* Services List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Dịch Vụ Chăm Sóc Sức Khỏe</div>
                    <div className="text-sm text-gray-500">Chăm sóc người cao tuổi</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{(monthlyRevenue ?? 0).toLocaleString()} VND</div>
                  <div className="text-sm text-gray-500">{(paymentsByStatus?.completed?.count ?? 0)} completed</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Dịch Vụ Hỗ Trợ Sức Khỏe</div>
                    <div className="text-sm text-gray-500">Phục hồi chức năng</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{activeHealthPackages} dịch vụ</div>
                  <div className="text-sm text-gray-500">{activeHealthPackages} active</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Lịch Hẹn Với Cộng Tác Viên</div>
                    <div className="text-sm text-gray-500">Thuê và đặt lịch hẹn với cộng tác viên</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900" style={{ fontSize: '2rem' }}>{supporterCompleted + supporterCanceled}</div>
                  <div className="text-sm text-green-600">{supporterCompleted} đã hoàn thành</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Family Members Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">Số lượng Family</div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{counts.familyMembers?.toLocaleString() ?? 0}</div>
        </div>

        {/* Elderly Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">Số lượng Người Già</div>
          <div className="text-3xl font-bold text-green-600 mb-1">{counts.totalResidents?.toLocaleString() ?? 0}</div>
        </div>

        {/* Staff Card (Doctors + Supporters) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 14.1 17 15.28 17 16.5V19h7v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">Số lượng Nhân Viên</div>
          <div className="text-3xl font-bold text-orange-600 mb-1">{(counts.doctors + counts.activeSupporters)?.toLocaleString() ?? 0}</div>
        </div>
      </div>
    </div>
  )
}
export default DashboardPage;
