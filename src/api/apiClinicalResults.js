import axiosClient from "./axiosClient";

// API cho kết quả khám lâm sàng - Sử dụng API thật từ backend
export const clinicalResultsAPI = {
  // Lấy kết quả khám của bệnh nhân
  getExaminationResults: async (patientId) => {
    try {
      console.log(
        "🔍 [apiClinicalResults] Fetching examination results for patient:",
        patientId
      );
      const response = await axiosClient.get(
        `/api/clinical-results/patient/${patientId}`
      );
      console.log("🔍 [apiClinicalResults] Raw response data:", response.data);
      console.log(
        "🔍 [apiClinicalResults] Response data type:",
        typeof response.data
      );
      console.log(
        "🔍 [apiClinicalResults] Response data length:",
        response.data?.length
      );

      // Transform backend data to frontend format
      if (response.data && Array.isArray(response.data)) {
        // Filter out empty records before transforming
        const nonEmptyRecords = response.data.filter((record) => {
          const hasRealData =
            record.diagnosis ||
            record.recommendations ||
            record.bloodPressureSystolic ||
            record.bloodPressureDiastolic ||
            record.temperature ||
            record.heartRate ||
            record.weight ||
            record.height ||
            record.fshLevel ||
            record.lhLevel ||
            record.estradiolLevel ||
            record.testosteroneLevel ||
            record.amhLevel ||
            record.prolactinLevel ||
            record.ultrasoundFindings ||
            record.notes ||
            (record.symptoms &&
              record.symptoms !== "[]" &&
              record.symptoms !== '[""]');

          if (!hasRealData) {
            console.log(
              `🧹 [apiClinicalResults] Filtering out empty record:`,
              record.id
            );
          }

          return hasRealData;
        });

        console.log(
          `🔍 [apiClinicalResults] Found ${response.data.length} records, ${nonEmptyRecords.length} non-empty`
        );

        const transformedData = nonEmptyRecords.map(transformBackendToFrontend);
        console.log(
          "🔍 [apiClinicalResults] Transformed data:",
          transformedData
        );
        return transformedData;
      } else {
        console.warn(
          "⚠️ [apiClinicalResults] Response data is not an array:",
          response.data
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching examination results:", error);
      throw error;
    }
  },

  // Tạo mới kết quả khám (Bác sĩ sử dụng)
  createExaminationResult: async (examinationData) => {
    try {
      // Transform frontend data format to backend format
      const backendData = {
        patientId: examinationData.patientId,
        doctorId: examinationData.doctorId,
        appointmentId: examinationData.appointmentId || null,
        resultType: "CLINICAL_EXAMINATION",
        examinationDate: examinationData.examinationDate
          ? new Date(examinationData.examinationDate)
          : new Date(),

        // Symptoms
        symptoms: JSON.stringify(examinationData.symptoms || []),
        symptomsDetail: examinationData.symptoms?.join(", ") || "",

        // Clinical signs
        bloodPressureSystolic:
          examinationData.clinicalSigns?.bloodPressure?.split("/")[0] || null,
        bloodPressureDiastolic:
          examinationData.clinicalSigns?.bloodPressure?.split("/")[1] || null,
        temperature: examinationData.clinicalSigns?.temperature || null,
        heartRate: examinationData.clinicalSigns?.heartRate || null,
        weight: examinationData.clinicalSigns?.weight || null,
        height: examinationData.clinicalSigns?.height || null,

        // Lab results
        fshLevel: examinationData.labResults?.bloodTest?.FSH || null,
        lhLevel: examinationData.labResults?.bloodTest?.LH || null,
        estradiolLevel: examinationData.labResults?.bloodTest?.E2 || null,
        testosteroneLevel:
          examinationData.labResults?.bloodTest?.testosterone || null,
        amhLevel: examinationData.labResults?.bloodTest?.AMH || null,
        prolactinLevel:
          examinationData.labResults?.bloodTest?.prolactin || null,

        // Ultrasound
        ultrasoundFindings: examinationData.labResults?.ultrasound || null,

        // Diagnosis
        diagnosis: examinationData.diagnosis || "",
        recommendations: examinationData.recommendations || "",

        // Additional fields
        notes: examinationData.notes || "",
        attachedFileUrl: examinationData.attachments?.join(", ") || null,
        nextAppointmentDate: examinationData.nextAppointmentDate
          ? new Date(examinationData.nextAppointmentDate)
          : null,
        isCompleted: true,
        completionDate: new Date(),
      };

      // Gọi API để tạo mới clinical result
      const response = await axiosClient.post(
        `/api/clinical-results`,
        backendData
      );

      // Transform backend response back to frontend format
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error("Error creating examination result:", error);
      throw error;
    }
  },

  // Cập nhật kết quả khám (Bác sĩ sử dụng)
  updateExaminationResult: async (id, examinationData) => {
    try {
      // Transform frontend data format to backend format
      const backendData = {
        patientId: examinationData.patientId,
        doctorId: examinationData.doctorId,
        appointmentId: examinationData.appointmentId || null,
        resultType: "CLINICAL_EXAMINATION",
        examinationDate: examinationData.examinationDate
          ? new Date(examinationData.examinationDate)
          : new Date(),

        // Symptoms
        symptoms: JSON.stringify(examinationData.symptoms || []),
        symptomsDetail: examinationData.symptoms?.join(", ") || "",

        // Clinical signs
        bloodPressureSystolic:
          examinationData.clinicalSigns?.bloodPressure?.split("/")[0] || null,
        bloodPressureDiastolic:
          examinationData.clinicalSigns?.bloodPressure?.split("/")[1] || null,
        temperature: examinationData.clinicalSigns?.temperature || null,
        heartRate: examinationData.clinicalSigns?.heartRate || null,
        weight: examinationData.clinicalSigns?.weight || null,
        height: examinationData.clinicalSigns?.height || null,

        // Lab results
        fshLevel: examinationData.labResults?.bloodTest?.FSH || null,
        lhLevel: examinationData.labResults?.bloodTest?.LH || null,
        estradiolLevel: examinationData.labResults?.bloodTest?.E2 || null,
        testosteroneLevel:
          examinationData.labResults?.bloodTest?.testosterone || null,
        amhLevel: examinationData.labResults?.bloodTest?.AMH || null,
        prolactinLevel:
          examinationData.labResults?.bloodTest?.prolactin || null,

        // Ultrasound
        ultrasoundFindings: examinationData.labResults?.ultrasound || null,

        // Diagnosis
        diagnosis: examinationData.diagnosis || "",
        recommendations: examinationData.recommendations || "",

        // Additional fields
        notes: examinationData.notes || "",
        attachedFileUrl: examinationData.attachments?.join(", ") || null,
        nextAppointmentDate: examinationData.nextAppointmentDate
          ? new Date(examinationData.nextAppointmentDate)
          : null,
        isCompleted: true,
        completionDate: new Date(),
      };

      const response = await axiosClient.put(
        `/api/clinical-results/${id}`,
        backendData
      );

      // Transform backend response back to frontend format
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error("Error updating examination result:", error);
      throw error;
    }
  },

  // Lấy kết quả khám theo ID (Bệnh nhân và Bác sĩ sử dụng)
  getExaminationResultById: async (resultId) => {
    try {
      const response = await axiosClient.get(
        `/api/clinical-results/${resultId}`
      );
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error("Error fetching examination result by ID:", error);
      throw error;
    }
  },
};

// Helper function to transform backend data format to frontend format
const transformBackendToFrontend = (backendData) => {
  return {
    id: backendData.resultId,
    patientId: backendData.patientId,
    doctorId: backendData.doctorId,
    examinationDate: backendData.examinationDate,
    symptoms: backendData.symptoms ? JSON.parse(backendData.symptoms) : [],
    clinicalSigns: {
      bloodPressure:
        backendData.bloodPressureSystolic && backendData.bloodPressureDiastolic
          ? `${backendData.bloodPressureSystolic}/${backendData.bloodPressureDiastolic}`
          : null,
      temperature: backendData.temperature,
      heartRate: backendData.heartRate,
      weight: backendData.weight,
      height: backendData.height,
    },
    labResults: {
      bloodTest: {
        FSH: backendData.fshLevel,
        LH: backendData.lhLevel,
        E2: backendData.estradiolLevel,
        testosterone: backendData.testosteroneLevel,
        AMH: backendData.amhLevel,
        prolactin: backendData.prolactinLevel,
      },
      ultrasound: backendData.ultrasoundFindings,
    },
    diagnosis: backendData.diagnosis,
    recommendations: backendData.recommendations,
    attachments: backendData.attachedFileUrl
      ? backendData.attachedFileUrl.split(", ")
      : [],
    notes: backendData.notes,
    status: backendData.isCompleted ? "completed" : "pending",
    nextAppointmentDate: backendData.nextAppointmentDate,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
  };
};

export default clinicalResultsAPI;
