// Utility Functions
// Centralized utility functions for better code reusability

import { STORAGE_KEYS, DATE_FORMATS, VALIDATION_RULES } from "../constants";

// ===================
// Date & Time Utilities
// ===================

/**
 * Format date to display format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (default: DD/MM/YYYY)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  switch (format) {
    case DATE_FORMATS.DISPLAY:
      return `${day}/${month}/${year}`;
    case DATE_FORMATS.API:
      return `${year}-${month}-${day}`;
    case DATE_FORMATS.DATETIME_DISPLAY:
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case DATE_FORMATS.DATETIME_API:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case DATE_FORMATS.TIME_DISPLAY:
      return `${hours}:${minutes}`;
    default:
      return dateObj.toLocaleDateString();
  }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDate(date);
};

// ===================
// String Utilities
// ===================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to slug (URL-friendly)
 * @param {string} str - String to convert
 * @returns {string} Slug string
 */
export const slugify = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength).trim() + "...";
};

// ===================
// Validation Utilities
// ===================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return VALIDATION_RULES.EMAIL.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  return VALIDATION_RULES.PHONE.test(phone.replace(/\s/g, ""));
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and feedback
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: "Mật khẩu không được để trống",
    };
  }

  let score = 0;
  const feedback = [];

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    feedback.push(
      `Mật khẩu phải có ít nhất ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} ký tự`
    );
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push("Mật khẩu phải có ít nhất 1 chữ thường");
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("Mật khẩu phải có ít nhất 1 chữ hoa");
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push("Mật khẩu phải có ít nhất 1 số");
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback: feedback.join(", "),
    strength: score < 2 ? "Yếu" : score < 4 ? "Trung bình" : "Mạnh",
  };
};

// ===================
// Local Storage Utilities
// ===================

/**
 * Get item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Parsed value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error getting storage item:", error);
    return defaultValue;
  }
};

/**
 * Set item to localStorage with JSON stringifying
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting storage item:", error);
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing storage item:", error);
  }
};

/**
 * Clear all app-related items from localStorage
 * Note: This function does NOT clear authentication tokens
 */
export const clearAppStorage = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    // Don't clear authentication tokens
    if (key !== "accessToken" && key !== "refreshToken" && key !== "userData") {
      removeStorageItem(key);
    }
  });
};

// ===================
// Number & Currency Utilities
// ===================

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format currency (VND)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "";
  return `${formatNumber(amount)} VNĐ`;
};

// ===================
// Array Utilities
// ===================

/**
 * Remove duplicates from array
 * @param {Array} arr - Array to deduplicate
 * @param {string} key - Key for object arrays
 * @returns {Array} Deduplicated array
 */
export const uniqueArray = (arr, key = null) => {
  if (!Array.isArray(arr)) return [];

  if (key) {
    const seen = new Set();
    return arr.filter((item) => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  return [...new Set(arr)];
};

/**
 * Sort array of objects by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortByKey = (arr, key, order = "asc") => {
  if (!Array.isArray(arr)) return [];

  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

// ===================
// URL & Query Utilities
// ===================

/**
 * Build query string from object
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parameters object
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
};

// ===================
// File Utilities
// ===================

/**
 * Convert file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return "";
  return filename.split(".").pop().toLowerCase();
};

// ===================
// Debounce & Throttle
// ===================

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ===================
// Error Handling
// ===================

/**
 * Safe JSON parse with error handling
 * @param {string} str - JSON string to parse
 * @param {any} defaultValue - Default value on error
 * @returns {any} Parsed object or default value
 */
export const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("JSON parse error:", error);
    return defaultValue;
  }
};

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default {
  // Date utilities
  formatDate,
  getRelativeTime,

  // String utilities
  capitalize,
  slugify,
  truncate,

  // Validation utilities
  isValidEmail,
  isValidPhone,
  validatePassword,

  // Storage utilities
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAppStorage,

  // Number utilities
  formatNumber,
  formatCurrency,

  // Array utilities
  uniqueArray,
  sortByKey,

  // URL utilities
  buildQueryString,
  parseQueryString,

  // File utilities
  formatFileSize,
  getFileExtension,

  // Performance utilities
  debounce,
  throttle,

  // Other utilities
  safeJsonParse,
  generateId,
};
