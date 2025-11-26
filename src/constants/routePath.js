const ROUTE_PATH = {

    //Auth routes
    REGISTER: '/register-user',
    LOGIN: '/',

    

    //Admin
  DASHBOARD: '/admin/dashboard',
  ADMIN_CREATE_SUPPORTER: '/admin/supporters/create',
  ADMIN_CREATE_DOCTOR: '/admin/doctors/create',
  ADMIN_VIEW_DETAIL: '/admin/supporters/view',

  ADMIN_VIEW_DOCTOR_DETAIL: '/admin/doctors/view',
  ADMIN_VIEW_ELDERLY_DETAIL: '/admin/elderly/view',
  ADMIN_VIEW_FAMILY_DETAIL: '/admin/family/view',
  ADMIN_REGISTERED_PACKAGES: '/admin/registered-packages',
  ADMIN_BULK_IMPORT_DOCTORS: '/admin/doctors/import',
  ADMIN_BULK_IMPORT_SUPPORTERS: '/admin/supporters/import',
  ADMIN_DETAIL_REGISTERED_PACKAGE:'/admin/registered-packages/:id',
  ADMIN_CREATE_HEALTH_PACKAGE: '/admin/health-packages/create',
  ADMIN_LIST_HEALTH_PACKAGES: '/admin/health-packages',
  ADMIN_EDIT_HEALTH_PACKAGE: '/admin/health-packages/edit/:id',
  ADMIN_HEALTH_PACKAGE_DETAIL: '/admin/health-packages/:id',
  ADMIN_VIEW_USER: '/admin/user',
  ADMIN_VIEW_STAFF: 'admin/staff',

  //Supporter Services
  SUPPORTER_SERVICES: '/supporter-services',
  SUPPORTER_SERVICE_DETAIL: '/supporter-services/:id',
  SUPPORTER_SERVICE_CREATE: '/supporter-services/create',
  SUPPORTER_SERVICE_EDIT: '/supporter-services/edit/:id',
};

export default ROUTE_PATH;
