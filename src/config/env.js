// Environment Configuration
// Centralized configuration for all environment variables

const ENV_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 60000,
    DB_URL: import.meta.env.VITE_DB_URL || "http://localhost:3001",
  },

  // Authentication
  AUTH: {
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    JWT_SECRET: import.meta.env.VITE_JWT_SECRET || "dev-secret",
  },

  // Application
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || "Fertility Care",
    VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
    ENVIRONMENT: import.meta.env.MODE || "development",
    IS_PRODUCTION: import.meta.env.PROD,
    IS_DEVELOPMENT: import.meta.env.DEV,
  },

  // Feature Flags
  FEATURES: {
    ENABLE_MOCK_LOGIN: import.meta.env.VITE_ENABLE_MOCK_LOGIN === "true",
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    ENABLE_LOGGER: import.meta.env.VITE_ENABLE_LOGGER !== "false", // Default true
  },

  // External Services
  SERVICES: {
    MAPS_API_KEY: import.meta.env.VITE_MAPS_API_KEY || "",
    NOTIFICATION_SERVICE_URL:
      import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://localhost:3002",
  },

  // Performance Settings
  PERFORMANCE: {
    ENABLE_COMPRESSION: import.meta.env.VITE_ENABLE_COMPRESSION !== "false",
    ENABLE_LAZY_LOADING: import.meta.env.VITE_ENABLE_LAZY_LOADING !== "false",
    CHUNK_SIZE_WARNING_LIMIT:
      parseInt(import.meta.env.VITE_CHUNK_SIZE_WARNING_LIMIT) || 1000,
  },
};

// Validation function to check required environment variables
export const validateEnvConfig = () => {
  const requiredVars = ["API.BASE_URL", "APP.NAME"];

  const missingVars = [];

  requiredVars.forEach((varPath) => {
    const pathParts = varPath.split(".");
    let value = ENV_CONFIG;

    for (const part of pathParts) {
      value = value?.[part];
    }

    if (!value) {
      missingVars.push(varPath);
    }
  });

  if (missingVars.length > 0) {
    console.warn("Missing required environment variables:", missingVars);
  }

  return missingVars.length === 0;
};

// Helper functions
export const isDevelopment = () => ENV_CONFIG.APP.IS_DEVELOPMENT;
export const isProduction = () => ENV_CONFIG.APP.IS_PRODUCTION;
export const getApiUrl = (endpoint = "") =>
  `${ENV_CONFIG.API.BASE_URL}${endpoint}`;
export const getDbUrl = (endpoint = "") =>
  `${ENV_CONFIG.API.DB_URL}${endpoint}`;

// Log configuration in development
if (isDevelopment() && ENV_CONFIG.FEATURES.ENABLE_LOGGER) {
  console.group("🔧 Environment Configuration");
  console.log("Environment:", ENV_CONFIG.APP.ENVIRONMENT);
  console.log("App Name:", ENV_CONFIG.APP.NAME);
  console.log("App Version:", ENV_CONFIG.APP.VERSION);
  console.log("API Base URL:", ENV_CONFIG.API.BASE_URL);
  console.log("Database URL:", ENV_CONFIG.API.DB_URL);
  console.log("Features:", ENV_CONFIG.FEATURES);
  console.groupEnd();
}

export default ENV_CONFIG;
