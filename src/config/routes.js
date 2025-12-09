import React from "react";

import ROUTE_PATH from "../constants/routePath";
import AdminLayout from "../layouts/admin-layout";

// Auth routes
const RegisterUserPage = React.lazy(() => import("../pages/Auth/RegisterUserPage"));
const LoginUserPage = React.lazy(() => import("../pages/Auth/LoginUserPage"));

// Admin routes
const HealthConsultationSchedulesPage = React.lazy(() => import("../pages/Admin/HealthConsultationSchedulesPage"));
const HealthConsultationScheduleDetailPage = React.lazy(() => import("../pages/Admin/HealthConsultationScheduleDetailPage"));
const AdminDashboardPage = React.lazy(() => import("../pages/Admin/DashboardPage"));
const AdminCreateSupporterPage = React.lazy(() => import("../pages/Admin/AdminCreateSupporterPage"));
const AdminCreateDoctorPage = React.lazy(() => import("../pages/Admin/AdminCreateDoctorPage"));
const AdminSupporterDetailPage = React.lazy(() => import("../pages/Admin/AdminSupporterDetailPage"));
const AdminDoctorDetailPage = React.lazy(() => import("../pages/Admin/AdminDoctorDetailPage"));
const AdminElderlyDetailPage = React.lazy(() => import("../pages/Admin/AdminElderlyDetailPage"));
const AdminFamilyDetailPage = React.lazy(() => import("../pages/Admin/AdminFamilyDetailPage"));
const BulkImportDoctorPage = React.lazy(() => import("../pages/Admin/BulkImportDoctorPage"));
const BulkImportSupporterPage = React.lazy(() => import("../pages/Admin/BulkImportSupporterPage"));
const AdminFamilyElderListPage = React.lazy(()=> import("../pages/Admin/AdminFamilyElderListPage"))
const AdminStaffListPage = React.lazy(()=> import("../pages/Admin/AdminStaffListPage"))
const AdminElderlyLocationPage = React.lazy(()=> import("../pages/Admin/AdminElderlyLocationPage"))

// Supporter Services routes
// (Add supporter services related pages here when available)
const AdminListSupporterServices = React.lazy(() => import("../pages/Admin/AdminListSupporterServices"));
const AdminSupporterServiceDetail = React.lazy(() => import("../pages/Admin/AdminCreateSupporterServices"));

const AdminSupporterSchedulingListPage = React.lazy(() => import("../pages/Admin/SupporterSchedulingList"));
const AdminSupporterSchedulingDetailPage = React.lazy(() => import("../pages/Admin/SupporterSchedulingDetailPage"));
const AppRoutes = [

    // Auth routes
    { path: ROUTE_PATH.REGISTER, page: RegisterUserPage },
    { path: ROUTE_PATH.LOGIN, page: LoginUserPage },

    // Admin routes (use AdminLayout with Header)
    { path: ROUTE_PATH.DASHBOARD, page: AdminDashboardPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_CREATE_SUPPORTER, page: AdminCreateSupporterPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_CREATE_DOCTOR, page: AdminCreateDoctorPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_SUPPORTER_DETAIL, page: AdminSupporterDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_DOCTOR_DETAIL, page: AdminDoctorDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_ELDERLY_DETAIL, page: AdminElderlyDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_FAMILY_DETAIL, page: AdminFamilyDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES, page: HealthConsultationSchedulesPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULE_DETAIL, page: HealthConsultationScheduleDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_BULK_IMPORT_DOCTORS, page: BulkImportDoctorPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_BULK_IMPORT_SUPPORTERS, page: BulkImportSupporterPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_USER, page: AdminFamilyElderListPage, layout: AdminLayout},
    { path: ROUTE_PATH.ADMIN_VIEW_STAFF, page: AdminStaffListPage, layout: AdminLayout},
    { path: ROUTE_PATH.ADMIN_ELDERLY_LOCATION, page: AdminElderlyLocationPage, layout: AdminLayout },

    // Supporter Services routes
    { path: ROUTE_PATH.SUPPORTER_SERVICES, page: AdminListSupporterServices, layout: AdminLayout },
    { path: ROUTE_PATH.SUPPORTER_SERVICE_DETAIL, page: AdminSupporterServiceDetail, layout: AdminLayout },

    { path: ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_LIST, page: AdminSupporterSchedulingListPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL, page: AdminSupporterSchedulingDetailPage, layout: AdminLayout },
];

export default AppRoutes;