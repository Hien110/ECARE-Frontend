const ROUTE_PATH = {

    //Auth routes
    REGISTER: '/register-user',
    LOGIN: '/',

    

    //Admin
  DASHBOARD: '/admin/dashboard',
  ADMIN_CREATE_SUPPORTER: '/admin/supporters/create',
  ADMIN_CREATE_DOCTOR: '/admin/doctors/create',

  ADMIN_VIEW_SUPPORTER_DETAIL: '/admin/supporters/view',
  ADMIN_VIEW_DOCTOR_DETAIL: '/admin/doctors/view',
  ADMIN_VIEW_ELDERLY_DETAIL: '/admin/elderly/view',
  ADMIN_VIEW_FAMILY_DETAIL: '/admin/family/view',


  ADMIN_BULK_IMPORT_DOCTORS: '/admin/doctors/import',
  ADMIN_BULK_IMPORT_SUPPORTERS: '/admin/supporters/import',

  ADMIN_HEALTH_CONSULTATION_SCHEDULES: '/admin/health-consultation-schedules',
  ADMIN_HEALTH_CONSULTATION_SCHEDULE_DETAIL: '/admin/health-consultation-schedules/:id',
  ADMIN_CONSULTATION_PRICE: '/admin/consultation-price',

  ADMIN_VIEW_USER: '/admin/user',
  ADMIN_VIEW_STAFF: '/admin/staff',
  ADMIN_ELDERLY_LOCATION: '/admin/elderly-location',

  ADMIN_SUPPORTER_SCHEDULING_LIST: '/admin/supporter-schedulings',
  ADMIN_SUPPORTER_SCHEDULING_DETAIL: '/admin/supporter-schedulings/:id',


  //Supporter Services
  SUPPORTER_SERVICES: '/supporter-services',
  SUPPORTER_SERVICE_DETAIL: '/supporter-services/:id',
  SUPPORTER_SERVICE_CREATE: '/supporter-services/create',
  SUPPORTER_SERVICE_EDIT: '/supporter-services/edit/:id',
};

export default ROUTE_PATH;
