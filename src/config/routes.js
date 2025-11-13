import React from "react";

import ROUTE_PATH from "../constants/routePath";
import AdminLayout from "../layouts/admin-layout";

// Auth routes
const RegisterUserPage = React.lazy(() => import("../pages/Auth/RegisterUserPage"));
const LoginUserPage = React.lazy(() => import("../pages/Auth/LoginUserPage"));

// Admin routes
const RegisteredPackagesPage = React.lazy(() => import("../pages/Admin/RegisteredPackagesPage"));
const AdminDashboardPage = React.lazy(() => import("../pages/Admin/DashboardPage"));
const AdminCreateSupporterPage = React.lazy(() => import("../pages/Admin/AdminCreateSupporterPage"));
const AdminCreateDoctorPage = React.lazy(() => import("../pages/Admin/AdminCreateDoctorPage"));
const AdminBulkImportPage = React.lazy(() => import("../pages/Admin/AdminBulkImportPage"));
const AdminViewSupporterPage = React.lazy(() => import("../pages/Admin/AdminViewSupporterPage"));
const AdminUserListPage = React.lazy(() => import("../pages/Admin/AdminUserListPage"));
const AdminDoctorDetailPage = React.lazy(() => import("../pages/Admin/AdminDoctorDetailPage"));
const AdminElderlyDetailPage = React.lazy(() => import("../pages/Admin/AdminElderlyDetailPage"));
const AdminFamilyDetailPage = React.lazy(() => import("../pages/Admin/AdminFamilyDetailPage"));
const BulkImportDoctorPage = React.lazy(() => import("../pages/Admin/BulkImportDoctorPage"));
const BulkImportSupporterPage = React.lazy(() => import("../pages/Admin/BulkImportSupporterPage"));
const RegisteredPackageDetailPage = React.lazy(() => import("../pages/Admin/RegisteredPackageDetailPage"));

// Supporter Services routes
// (Add supporter services related pages here when available)
const AdminListSupporterServices = React.lazy(() => import("../pages/Admin/AdminListSupporterServices"));
const AdminSupporterServiceDetail = React.lazy(() => import("../pages/Admin/AdminCreateSupporterServices"));


const AppRoutes = [

    // Auth routes
    { path: ROUTE_PATH.REGISTER, page: RegisterUserPage },
    { path: ROUTE_PATH.LOGIN, page: LoginUserPage },

    // Admin routes (use AdminLayout with Header)
    { path: ROUTE_PATH.DASHBOARD, page: AdminDashboardPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_CREATE_SUPPORTER, page: AdminCreateSupporterPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_CREATE_DOCTOR, page: AdminCreateDoctorPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_BULK_IMPORT, page: AdminBulkImportPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_DETAIL, page: AdminViewSupporterPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_USER, page: AdminUserListPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_DOCTOR_DETAIL, page: AdminDoctorDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_ELDERLY_DETAIL, page: AdminElderlyDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_VIEW_FAMILY_DETAIL, page: AdminFamilyDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_REGISTERED_PACKAGES, page: RegisteredPackagesPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_DETAIL_REGISTERED_PACKAGE, page: RegisteredPackageDetailPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_BULK_IMPORT_DOCTORS, page: BulkImportDoctorPage, layout: AdminLayout },
    { path: ROUTE_PATH.ADMIN_BULK_IMPORT_SUPPORTERS, page: BulkImportSupporterPage, layout: AdminLayout },

    // Supporter Services routes
    { path: ROUTE_PATH.SUPPORTER_SERVICES, page: AdminListSupporterServices, layout: AdminLayout },
    { path: ROUTE_PATH.SUPPORTER_SERVICE_DETAIL, page: AdminSupporterServiceDetail, layout: AdminLayout },
]

export default AppRoutes;