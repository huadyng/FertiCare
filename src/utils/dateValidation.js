/**
 * Utility functions for date of birth validation
 */

/**
 * Validates if a date of birth ensures the user is between 18 and 50 years old
 * @param {string|Date} dateOfBirth - The date of birth to validate
 * @returns {object} - Object with isValid boolean and message string
 */
export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return {
      isValid: false,
      message: "Vui lòng chọn ngày sinh!"
    };
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    return {
      isValid: false,
      message: "Ngày sinh không hợp lệ!"
    };
  }

  // Check if birth date is in the future
  if (birthDate > today) {
    return {
      isValid: false,
      message: "Ngày sinh không thể là ngày trong tương lai!"
    };
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Check age range (18-50 years old)
  if (age < 18) {
    return {
      isValid: false,
      message: "Bạn phải đủ 18 tuổi để sử dụng dịch vụ này!"
    };
  }

  if (age > 50) {
    return {
      isValid: false,
      message: "Độ tuổi không được vượt quá 50 tuổi!"
    };
  }

  return {
    isValid: true,
    message: ""
  };
};

/**
 * Gets the minimum and maximum allowed dates for date picker
 * @returns {object} - Object with minDate and maxDate
 */
export const getDateOfBirthConstraints = () => {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 50, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  
  return {
    minDate,
    maxDate
  };
};

/**
 * Custom validator function for Ant Design Form rules
 * @param {object} rule - The validation rule
 * @param {string} value - The field value
 * @param {function} callback - The callback function
 */
export const dateOfBirthValidator = (rule, value, callback) => {
  if (!value) {
    callback();
    return;
  }

  const validation = validateDateOfBirth(value);
  
  if (!validation.isValid) {
    callback(new Error(validation.message));
  } else {
    callback();
  }
}; 