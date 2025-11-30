import React, { useEffect, useState } from 'react';
import adminService, { getSupporterSchedulesByStatus } from '../../services/adminService';
import  {getHealthPackages} from '@/services/healthPackageService';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    counts: { totalResidents: 0, familyMembers: 0, activeSupporters: 0, doctors: 0, admins: 0 },
    paymentsByStatus: {},
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [supporterCompleted, setSupporterCompleted] = useState(0);
  const [supporterCanceled, setSupporterCanceled] = useState(0);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await getHealthPackages();
        if (Array.isArray(res)) setPackages(res);
        else if (Array.isArray(res?.data)) setPackages(res.data);
        else setPackages([]);
      } catch (err) {
        setError(err?.message || 'Lỗi khi lấy danh sách gói khám');
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

  const { counts, paymentsByStatus, totalRevenue, monthlyRevenue } = stats;

  // Đếm số lượng gói khám đang active
  const activeHealthPackages = packages.filter(pkg => pkg.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Thống Kê</h1>
        <p className="text-gray-600">Chào Mừng Quay Trở Lại, Quản Trị Viên. Đây Là Trang Thống Kê Khám Bệnh.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hồ sơ doanh thu hàng tháng</h3>
              <p className="text-sm text-gray-500">Theo dõi doanh thu của cơ sở chăm sóc người cao tuổi</p>
            </div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>

          {/* Chart (static placeholder) */}
          <div className="relative h-64 mb-6">
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {/* Chart bars - still static for now */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-16 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 1</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-20 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 2</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-32 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 3</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 4</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-28 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 5</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-24 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 6</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-36 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 7</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-18 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Tháng 8</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Chưa Xử Lý</div>
              <div className="text-xl font-bold text-orange-600">{(paymentsByStatus?.pending?.total ?? 0).toLocaleString()} VND</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Đã Hoàn Thành</div>
              <div className="text-xl font-bold text-green-600">{(paymentsByStatus?.completed?.total ?? 0).toLocaleString()} VND</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Đã Từ Chối</div>
              <div className="text-xl font-bold text-red-600">{(paymentsByStatus?.failed?.total ?? 0).toLocaleString()} VND</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Doanh Thu</div>
              <div className="text-xl font-bold text-blue-600">{(totalRevenue ?? 0).toLocaleString()} VND</div>
            </div>
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
                  <div className="text-sm text-red-600">{supporterCanceled} đã hủy</div>
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
