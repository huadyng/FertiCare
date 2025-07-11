// Debug utilities for examination form issues

export const debugUtils = {
  // Kiểm tra tất cả dữ liệu examination trong localStorage
  checkAllExaminationData: () => {
    const allKeys = Object.keys(localStorage);
    const examinationKeys = allKeys.filter(
      (key) =>
        key.includes("examination_completed") ||
        key.includes("examination_backup") ||
        key.includes("examination_draft")
    );

    console.log("🔍 [debugUtils] All examination keys:", examinationKeys);

    examinationKeys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`🔍 [debugUtils] ${key}:`, data);

        // Kiểm tra dữ liệu rỗng
        const isEmpty =
          !data.diagnosis &&
          !data.recommendations &&
          !data.clinicalSigns?.bloodPressure &&
          !data.clinicalSigns?.temperature &&
          !data.clinicalSigns?.heartRate &&
          !data.clinicalSigns?.weight &&
          !data.clinicalSigns?.height &&
          !data.labResults?.ultrasound &&
          !data.notes &&
          (!data.symptoms || data.symptoms.length === 0);

        if (isEmpty) {
          console.warn(`⚠️ [debugUtils] ${key} contains empty data`);
        }
      } catch (error) {
        console.error(`❌ [debugUtils] Error parsing ${key}:`, error);
      }
    });
  },

  // Xóa tất cả dữ liệu examination rỗng
  cleanAllEmptyExaminationData: () => {
    const allKeys = Object.keys(localStorage);
    const examinationKeys = allKeys.filter(
      (key) =>
        key.includes("examination_completed") ||
        key.includes("examination_backup") ||
        key.includes("examination_draft")
    );

    let cleanedCount = 0;

    examinationKeys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));

        // Kiểm tra dữ liệu rỗng
        const isEmpty =
          !data.diagnosis &&
          !data.recommendations &&
          !data.clinicalSigns?.bloodPressure &&
          !data.clinicalSigns?.temperature &&
          !data.clinicalSigns?.heartRate &&
          !data.clinicalSigns?.weight &&
          !data.clinicalSigns?.height &&
          !data.labResults?.ultrasound &&
          !data.notes &&
          (!data.symptoms || data.symptoms.length === 0);

        if (isEmpty) {
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`🧹 [debugUtils] Cleaned ${key}`);
        }
      } catch (error) {
        console.error(`❌ [debugUtils] Error cleaning ${key}:`, error);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });

    console.log(
      `✅ [debugUtils] Cleaned ${cleanedCount} empty examination data entries`
    );
    return cleanedCount;
  },

  // Kiểm tra token và authentication
  checkAuthentication: () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.warn("⚠️ [debugUtils] No user data in localStorage");
      return false;
    }

    try {
      const userData = JSON.parse(storedUser);
      console.log("🔍 [debugUtils] User data:", userData);

      if (!userData.token) {
        console.warn("⚠️ [debugUtils] No token in user data");
        return false;
      }

      console.log(
        "✅ [debugUtils] Token found:",
        userData.token.substring(0, 20) + "..."
      );
      return true;
    } catch (error) {
      console.error("❌ [debugUtils] Error parsing user data:", error);
      return false;
    }
  },

  // Kiểm tra API endpoints
  checkAPIEndpoints: async () => {
    const endpoints = [
      "/api/clinical-results/patient/1",
      "/api/patients/1",
      "/api/doctor/schedule/my-patients",
    ];

    console.log("🔍 [debugUtils] Checking API endpoints...");

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8080${endpoint}`, {
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("user"))?.token
            }`,
            "Content-Type": "application/json",
          },
        });

        console.log(
          `🔍 [debugUtils] ${endpoint}: ${response.status} ${response.statusText}`
        );

        if (response.status === 403) {
          console.warn(
            `⚠️ [debugUtils] 403 Forbidden for ${endpoint} - Check permissions`
          );
        } else if (response.status === 500) {
          console.error(
            `💥 [debugUtils] 500 Internal Server Error for ${endpoint} - Backend issue`
          );
        }
      } catch (error) {
        console.error(`❌ [debugUtils] Error checking ${endpoint}:`, error);
      }
    }
  },

  // Reset examination form state
  resetExaminationState: (patientId) => {
    const keys = [
      `examination_completed_${patientId}`,
      `examination_backup_${patientId}`,
      `examination_draft_${patientId}`,
    ];

    keys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 [debugUtils] Removed ${key}`);
      }
    });

    console.log(
      `✅ [debugUtils] Reset examination state for patient ${patientId}`
    );
  },

  // Backup examination data
  backupExaminationData: (patientId) => {
    const completedKey = `examination_completed_${patientId}`;
    const backupKey = `examination_backup_${patientId}_${Date.now()}`;

    const data = localStorage.getItem(completedKey);
    if (data) {
      localStorage.setItem(backupKey, data);
      console.log(`💾 [debugUtils] Backed up examination data to ${backupKey}`);
      return backupKey;
    } else {
      console.log(
        `⚠️ [debugUtils] No examination data to backup for patient ${patientId}`
      );
      return null;
    }
  },

  // Clean up multiple empty examination records for a specific patient
  cleanPatientExaminationData: (patientId) => {
    console.log(
      `🧹 [debugUtils] Cleaning examination data for patient: ${patientId}`
    );

    // Get all examination keys for this patient
    const allKeys = Object.keys(localStorage);
    const patientKeys = allKeys.filter(
      (key) => key.includes("examination") && key.includes(patientId)
    );

    console.log(
      `🔍 [debugUtils] Found ${patientKeys.length} examination keys for patient ${patientId}:`,
      patientKeys
    );

    let validData = null;
    let cleanedCount = 0;

    patientKeys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));

        // Check if this data has real content
        const hasRealData =
          data.diagnosis ||
          data.recommendations ||
          data.clinicalSigns?.bloodPressure ||
          data.clinicalSigns?.temperature ||
          data.clinicalSigns?.heartRate ||
          data.clinicalSigns?.weight ||
          data.clinicalSigns?.height ||
          data.labResults?.ultrasound ||
          data.notes ||
          (data.symptoms && data.symptoms.length > 0);

        if (hasRealData) {
          if (!validData) {
            validData = data;
            console.log(`✅ [debugUtils] Found valid data in ${key}:`, data);
          } else {
            // Remove duplicate valid data
            localStorage.removeItem(key);
            cleanedCount++;
            console.log(
              `🧹 [debugUtils] Removed duplicate valid data from ${key}`
            );
          }
        } else {
          // Remove empty data
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`🧹 [debugUtils] Removed empty data from ${key}`);
        }
      } catch (error) {
        console.error(`❌ [debugUtils] Error processing ${key}:`, error);
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });

    // If we found valid data, save it to the standard key
    if (validData) {
      const standardKey = `examination_completed_${patientId}`;
      localStorage.setItem(standardKey, JSON.stringify(validData));
      console.log(
        `💾 [debugUtils] Saved valid data to standard key: ${standardKey}`
      );
    }

    console.log(
      `✅ [debugUtils] Cleaned ${cleanedCount} records for patient ${patientId}`
    );
    return { cleanedCount, hasValidData: !!validData };
  },

  // Restore examination data
  restoreExaminationData: (backupKey) => {
    const data = localStorage.getItem(backupKey);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        const patientId = parsedData.patientId;
        const completedKey = `examination_completed_${patientId}`;

        localStorage.setItem(completedKey, data);
        console.log(
          `🔄 [debugUtils] Restored examination data for patient ${patientId}`
        );
        return true;
      } catch (error) {
        console.error(`❌ [debugUtils] Error restoring data:`, error);
        return false;
      }
    } else {
      console.log(`⚠️ [debugUtils] No backup data found for key ${backupKey}`);
      return false;
    }
  },
};

// Auto-run debug checks in development
if (process.env.NODE_ENV === "development") {
  console.log(
    "🔍 [debugUtils] Development mode detected, running auto-checks..."
  );

  // Check authentication
  debugUtils.checkAuthentication();

  // Check examination data
  debugUtils.checkAllExaminationData();

  // Make debugUtils available globally for console access
  window.debugUtils = debugUtils;
  console.log("🔍 [debugUtils] Available globally as window.debugUtils");
}

export default debugUtils;
