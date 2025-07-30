import axiosClient, { refreshTokenFromContext } from "../services/axiosClient.js";

// API cho kết quả khám lâm sàng - Sử dụng API thật từ backend
export const clinicalResultsAPI = {
  // Lấy clinical result theo ID
  getClinicalResultById: async (resultId) => {
    try {
      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();
      
      const response = await axiosClient.get(`/api/clinical-results/${resultId}`);
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error("Error fetching examination result by ID:", error);
      throw error;
    }
  },

  // Cập nhật clinical result theo ID
  updateExaminationResult: async (id, examinationData) => {
    try {
      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();
      
      // Transform frontend data format to backend format
      const backendData = {
        patientId: examinationData.patientId,
        doctorId: examinationData.doctorId,
        appointmentId: examinationData.appointmentId || null,
        resultType: "CLINICAL_EXAMINATION",
        examinationDate: examinationData.examinationDate
          ? new Date(examinationData.examinationDate)
          : new Date(),
        symptoms: JSON.stringify(examinationData.symptoms || []),
        symptomsDetail: Array.isArray(examinationData.symptoms)
          ? examinationData.symptoms.join(", ")
          : (examinationData.symptomsDetail || ""),
        bloodPressureSystolic: examinationData.bloodPressureSystolic || null,
        bloodPressureDiastolic: examinationData.bloodPressureDiastolic || null,
        temperature: examinationData.temperature || null,
        heartRate: examinationData.heartRate || null,
        weight: examinationData.weight || null,
        height: examinationData.height || null,
        fshLevel: examinationData.fshLevel || null,
        lhLevel: examinationData.lhLevel || null,
        estradiolLevel: examinationData.estradiolLevel || null,
        testosteroneLevel: examinationData.testosteroneLevel || null,
        amhLevel: examinationData.amhLevel || null,
        prolactinLevel: examinationData.prolactinLevel || null,
        glucose: examinationData.glucose || null,
        hemoglobin: examinationData.hemoglobin || null,
        creatinine: examinationData.creatinine || null,
        endometrialThickness: examinationData.endometrialThickness || null,
        ovarySizeLeft: examinationData.ovarySizeLeft || null,
        ovarySizeRight: examinationData.ovarySizeRight || null,
        follicleCountLeft: examinationData.follicleCountLeft || null,
        follicleCountRight: examinationData.follicleCountRight || null,
        plateletCount: examinationData.plateletCount || null,
        whiteBloodCell: examinationData.whiteBloodCell || null,
        ultrasoundFindings: examinationData.ultrasoundFindings || null,
        diagnosis: examinationData.diagnosis || "",
        diagnosisCode: examinationData.diagnosisCode || "",
        severityLevel: examinationData.severityLevel || "",
        infertilityDurationMonths: examinationData.infertilityDurationMonths || null,
        previousTreatments: examinationData.previousTreatments || "",
        recommendations: examinationData.recommendations || "",
        treatmentPriority: examinationData.treatmentPriority || "",
        completionDate: examinationData.completionDate ? new Date(examinationData.completionDate) : null,
        nextAppointmentDate: examinationData.nextAppointmentDate ? new Date(examinationData.nextAppointmentDate) : null,
        notes: examinationData.notes || "",
        attachedFileUrl: examinationData.attachedFileUrl || null,
        bloodType: examinationData.bloodType || null,
        isCompleted: examinationData.isCompleted !== undefined ? examinationData.isCompleted : true,
      };
      const response = await axiosClient.put(`/api/clinical-results/${id}`, backendData);
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error("Error updating examination result:", error);
      throw error;
    }
  },

  // Lấy danh sách clinical result của bệnh nhân
  getClinicalResultsByPatient: async (patientId) => {
    try {
      // 🔄 Try to refresh token before making request
      refreshTokenFromContext();
      
      const response = await axiosClient.get(`/api/clinical-results/patient/${patientId}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(transformBackendToFrontend);
      }
      return [];
    } catch (error) {
      console.error("Error fetching clinical results by patient:", error);
      return [];
    }
  },
};

// Helper function to transform backend data format to frontend format
const transformBackendToFrontend = (backendData) => {
  return {
    id: backendData.resultId,
    patientId: backendData.patientId,
    doctorId: backendData.doctorId,
    examinationDate: backendData.examinationDate || backendData.examination_date,
    resultType: backendData.resultType || backendData.result_type,
    notes: backendData.notes || backendData.note || backendData.ghi_chu,
    symptoms: (() => {
      let val = backendData.symptoms || backendData.symptom;
      if (!val) return [];
      if (Array.isArray(val)) return val;
      // Parse nhiều lần đến khi ra array thực sự
      let parsed = val;
      let count = 0;
      while (typeof parsed === "string" && count < 5) {
        try {
          parsed = JSON.parse(parsed);
          count++;
        } catch {
          break;
        }
      }
      return Array.isArray(parsed) ? parsed : [parsed];
    })(),
    symptomsDetail: backendData.symptomsDetail || backendData.symptoms_detail,
    bloodPressureSystolic: backendData.bloodPressureSystolic,
    bloodPressureDiastolic: backendData.bloodPressureDiastolic,
    temperature: backendData.temperature,
    heartRate: backendData.heartRate,
    weight: backendData.weight,
    height: backendData.height,
    bloodType: backendData.bloodType,
    fshLevel: backendData.fshLevel,
    lhLevel: backendData.lhLevel,
    estradiolLevel: backendData.estradiolLevel,
    testosteroneLevel: backendData.testosteroneLevel,
    amhLevel: backendData.amhLevel,
    prolactinLevel: backendData.prolactinLevel,
    glucose: backendData.glucose,
    hemoglobin: backendData.hemoglobin,
    creatinine: backendData.creatinine,
    endometrialThickness: backendData.endometrialThickness,
    ovarySizeLeft: backendData.ovarySizeLeft,
    ovarySizeRight: backendData.ovarySizeRight,
    follicleCountLeft: backendData.follicleCountLeft,
    follicleCountRight: backendData.follicleCountRight,
    plateletCount: backendData.plateletCount,
    whiteBloodCell: backendData.whiteBloodCell,
    ultrasoundFindings: backendData.ultrasoundFindings,
    diagnosis: backendData.diagnosis,
    diagnosisCode: backendData.diagnosisCode,
    severityLevel: backendData.severityLevel,
    infertilityDurationMonths: backendData.infertilityDurationMonths,
    previousTreatments: backendData.previousTreatments,
    recommendations: backendData.recommendations,
    treatmentPriority: backendData.treatmentPriority,
    completionDate: backendData.completionDate,
    status: backendData.isCompleted ? "completed" : "pending",
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
  };
};

export default clinicalResultsAPI;
