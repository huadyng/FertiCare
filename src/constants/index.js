// Application Constants
// Centralized constants for better maintainability

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  DOCTOR: "doctor",
  PATIENT: "patient",
};

// Route Paths
export const ROUTES = {
  // Public routes
  HOME: "/",
  DOCTOR: "/doctor",
  BLOG: "/blog",
  CONTACT: "/contact",

  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",


  // Dashboard routes
  DASHBOARD: "/dashboard",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_DEPARTMENTS: "/admin/departments",
  ADMIN_DOCTORS: "/admin/doctors",
  ADMIN_SCHEDULE: "/admin/schedule",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_PROFILE: "/admin/profile",

  // Manager routes
  MANAGER: "/manager",
  MANAGER_DASHBOARD: "/manager/dashboard",
  MANAGER_DOCTORS: "/manager/doctors",
  MANAGER_SCHEDULE: "/manager/schedule",
  MANAGER_SHIFT_MANAGEMENT: "/manager/shift-management",
  MANAGER_TREATMENT_APPROVAL: "/manager/treatment-approval",
  MANAGER_REPORTS: "/manager/reports",
  MANAGER_PROFILE: "/manager/profile",

  // Doctor routes
  DOCTOR_PANEL: "/doctor-panel",
  DOCTOR_DASHBOARD: "/doctor-panel/dashboard",
  DOCTOR_PATIENTS: "/doctor-panel/patients",
  DOCTOR_TREATMENT_PLANS: "/doctor-panel/treatment-plans",
  DOCTOR_CLINICAL_EXAMINATION: "/doctor-panel/clinical-examination",
  DOCTOR_TREATMENT_MONITORING: "/doctor-panel/treatment-monitoring",
  DOCTOR_SCHEDULE: "/doctor-panel/schedule",
  DOCTOR_REPORTS: "/doctor-panel/reports",
  DOCTOR_PROFILE: "/doctor-panel/profile",

  // Patient routes
  PATIENT: "/patient",
  PATIENT_DASHBOARD: "/patient/dashboard",
  PATIENT_TREATMENT_PROCESS: "/patient/treatment-process",
  PATIENT_SCHEDULE: "/patient/schedule",
  PATIENT_MEDICAL_RECORDS: "/patient/medical-records",
  PATIENT_HISTORY: "/patient/history",
  PATIENT_NOTIFICATIONS: "/patient/notifications",
  PATIENT_PROFILE: "/patient/profile",
  PATIENT_SETTINGS: "/patient/settings",

  // Legacy routes
  BOOKING: "/booking",
  CHART: "/chart",
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // User endpoints
  USERS: "/users",
  USER_PROFILE: "/users/profile",

  // Doctor endpoints
  DOCTORS: "/doctors",
  DOCTOR_SCHEDULE: "/doctors/schedule",

  // Patient endpoints
  PATIENTS: "/patients",
  PATIENT_RECORDS: "/patients/records",

  // Appointment endpoints
  APPOINTMENTS: "/appointments",

  // Treatment endpoints
  TREATMENTS: "/treatments",
  TREATMENT_PLANS: "/treatment-plans",

  // Department endpoints
  DEPARTMENTS: "/departments",

  // Reports endpoints
  REPORTS: "/reports",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
  USER_PREFERENCES: "userPreferences",
  THEME: "theme",
  LANGUAGE: "language",
};

// Application Status
export const APP_STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  IDLE: "idle",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

// Treatment Status
export const TREATMENT_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,11}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  API: "YYYY-MM-DD",
  DATETIME_DISPLAY: "DD/MM/YYYY HH:mm",
  DATETIME_API: "YYYY-MM-DD HH:mm:ss",
  TIME_DISPLAY: "HH:mm",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".pdf"],
};

// Theme Colors (matching Ant Design)
export const THEME_COLORS = {
  PRIMARY: "#1890ff",
  SUCCESS: "#52c41a",
  WARNING: "#faad14",
  ERROR: "#ff4d4f",
  INFO: "#1890ff",
};

// Breakpoints (matching CSS)
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
};

// Animation Duration
export const ANIMATION_DURATION = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
};

// Z-Index Levels
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
};

export default {
  USER_ROLES,
  ROUTES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  APP_STATUS,
  HTTP_STATUS,
  APPOINTMENT_STATUS,
  TREATMENT_STATUS,
  NOTIFICATION_TYPES,
  VALIDATION_RULES,
  DATE_FORMATS,
  PAGINATION,
  FILE_UPLOAD,
  THEME_COLORS,
  BREAKPOINTS,
  ANIMATION_DURATION,
  Z_INDEX,
};
