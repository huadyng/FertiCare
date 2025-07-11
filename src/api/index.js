// Unified API exports from /api directory
export { default as apiAuth } from "./apiAuth";
export { default as apiBlog } from "./apiBlog";
export { default as apiComment } from "./apiComment";
export { default as apiDoctor } from "./apiDoctor";
export { getDoctors } from "./apiDoctors";
export { default as apiForgotPassword } from "./apiForgotPassword";
export { default as apiLogin } from "./apiLogin";
export { default as apiProfile } from "./apiProfile";
export { default as apiRegist } from "./apiRegist";
export { default as apiVerification } from "./apiVerification";
export { default as clinicalResultsAPI } from "./apiClinicalResults";
export { default as treatmentPlanAPI } from "./treatmentPlanAPI";

// Re-export axiosClient for convenience
export { default as axiosClient } from "./axiosClient";
