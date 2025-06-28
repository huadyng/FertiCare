import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../../context/UserContext";
import apiProfile from "../../../api/apiProfile";
import "./UserProfile.css";

const UserProfile = () => {
  const { user, USER_ROLES, setUser } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Log user context and token
      console.log("🔍 [UserProfile] Current user context:", user);
      console.log("🔍 [UserProfile] User role:", user?.role);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log("🔍 [UserProfile] Stored user data:", userData);
        console.log("🔍 [UserProfile] Stored role:", userData.role);
        console.log(
          "🔍 [UserProfile] Token:",
          userData.token ? "EXISTS" : "MISSING"
        );
        if (userData.token) {
          console.log(
            "🔍 [UserProfile] Token preview:",
            userData.token.substring(0, 50) + "..."
          );
        }
      }

      const profileData = await apiProfile.getMyProfile();
      setProfile(profileData);
      setFormData(profileData); // Initialize form with current data
    } catch (err) {
      console.error("❌ [UserProfile] Profile fetch error:", err);
      console.error("❌ [UserProfile] Error response:", err.response?.data);

      // Fallback: Create mock profile from user context if API fails
      if (err.response?.status === 403 && user) {
        console.log(
          "📝 [UserProfile] Creating fallback profile from user context"
        );
        const fallbackProfile = {
          fullName: user.fullName || "",
          email: user.email || "",
          phone: "",
          gender: "",
          dateOfBirth: "",
          address: "",
          avatarUrl: user.avatarUrl || "",
          // Role-specific fields will be empty
          specialty: "",
          qualification: "",
          experienceYears: "",
          maritalStatus: "",
          healthBackground: "",
          assignedDepartment: "",
          extraPermissions: "",
        };
        setProfile(fallbackProfile);
        setFormData(fallbackProfile);
        setError(
          "⚠️ Không thể kết nối API. Đang sử dụng dữ liệu cơ bản từ phiên đăng nhập."
        );
      } else {
        setError(
          err.response?.data?.message || "Không thể tải thông tin profile"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      setFormData(profile);
      setValidationErrors({});
      setUpdateMessage("");
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = "Họ và tên không được bỏ trống";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email không được bỏ trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không đúng định dạng";
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Số điện thoại không được bỏ trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Số điện thoại không đúng định dạng";
    }

    return errors;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      if (!file.type.startsWith("image/")) {
        setUpdateMessage("❌ Vui lòng chọn file hình ảnh!");
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateMessage("❌ File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }

      setAvatarFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      setUpdateMessage("❌ Vui lòng chọn file avatar!");
      return;
    }

    try {
      setUploadingAvatar(true);
      setUpdateMessage("");

      const result = await apiProfile.uploadAvatar(avatarFile);

      // Cập nhật avatar URL trong form data và profile
      setFormData((prev) => ({ ...prev, avatarUrl: result.avatarUrl }));
      setProfile((prev) => ({ ...prev, avatarUrl: result.avatarUrl }));

      // Update user context
      if (user) {
        setUser({
          ...user,
          avatarUrl: result.avatarUrl,
        });
      }

      // Hiển thị message phù hợp
      if (result?.message?.includes("mock")) {
        setUpdateMessage("✅ Upload avatar thành công (chế độ demo)!");
      } else {
        setUpdateMessage("✅ Upload avatar thành công!");
      }

      setAvatarFile(null);
      setAvatarPreview(null);

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      setUpdateMessage(
        "❌ Upload avatar thất bại: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateMessage("");

      const updatedProfile = await apiProfile.updateProfile(
        formData,
        user?.role
      );

      // Cập nhật profile với dữ liệu trả về từ API
      if (updatedProfile) {
        setProfile(updatedProfile);

        // Update user context with new data
        if (user) {
          setUser({
            ...user,
            fullName: updatedProfile.fullName || formData.fullName,
            email: updatedProfile.email || formData.email,
            avatarUrl: updatedProfile.avatarUrl || formData.avatarUrl,
          });
        }
      }

      setIsEditing(false);

      // Hiển thị message phù hợp
      if (updatedProfile?.message?.includes("mock")) {
        setUpdateMessage("✅ Cập nhật thông tin thành công (chế độ demo)!");
      } else {
        setUpdateMessage("✅ Cập nhật thông tin thành công!");
      }

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      setUpdateMessage(
        "❌ Có lỗi xảy ra khi cập nhật: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Không hợp lệ";
    }
  };

  const getGenderDisplay = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  const getRoleDisplay = () => {
    if (!user?.role) return "Chưa xác định";

    switch (user.role.toUpperCase()) {
      case USER_ROLES.ADMIN:
        return "Quản trị viên";
      case USER_ROLES.MANAGER:
        return "Quản lý";
      case USER_ROLES.DOCTOR:
        return "Bác sĩ";
      case USER_ROLES.PATIENT:
        return "Bệnh nhân";
      case USER_ROLES.CUSTOMER:
        return "Khách hàng";
      default:
        return "Chưa xác định";
    }
  };

  const renderRoleSpecificInfo = () => {
    if (!profile) return null;

    switch (user?.role?.toUpperCase()) {
      case USER_ROLES.DOCTOR:
        return (
          <div className="role-specific-section">
            <h3>Thông tin chuyên môn</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Chuyên khoa:</label>
                <span>{profile.specialty || "Chưa cập nhật"}</span>
              </div>
              <div className="info-item">
                <label>Bằng cấp:</label>
                <span>{profile.qualification || "Chưa cập nhật"}</span>
              </div>
              <div className="info-item">
                <label>Số năm kinh nghiệm:</label>
                <span>{profile.experienceYears || "Chưa cập nhật"}</span>
              </div>
            </div>
          </div>
        );

      case USER_ROLES.CUSTOMER:
      case USER_ROLES.PATIENT:
        return (
          <div className="role-specific-section">
            <h3>Thông tin sức khỏe</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tình trạng hôn nhân:</label>
                <span>{profile.maritalStatus || "Chưa cập nhật"}</span>
              </div>
              <div className="info-item">
                <label>Tiền sử sức khỏe:</label>
                <span>{profile.healthBackground || "Chưa cập nhật"}</span>
              </div>
            </div>
          </div>
        );

      case USER_ROLES.MANAGER:
      case USER_ROLES.ADMIN:
        return (
          <div className="role-specific-section">
            <h3>Thông tin công việc</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Phòng ban phụ trách:</label>
                <span>{profile.assignedDepartment || "Chưa cập nhật"}</span>
              </div>
              <div className="info-item">
                <label>Quyền mở rộng:</label>
                <span>{profile.extraPermissions || "Chưa cập nhật"}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button onClick={fetchProfile} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="no-data-state">
          <h2>Không tìm thấy thông tin profile</h2>
          <p>Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src={profile.avatarUrl || "/src/assets/img/default-avatar.png"}
            alt="Avatar"
            onError={(e) => {
              e.target.src = "/src/assets/img/default-avatar.png";
            }}
          />
        </div>
        <div className="profile-basic-info">
          <h1>{profile.fullName || "Chưa cập nhật tên"}</h1>
          <p className="role-badge">{getRoleDisplay()}</p>
          <p className="email">{profile.email}</p>
        </div>
        <div className="profile-actions">
          <button
            className="edit-btn"
            onClick={handleEditToggle}
            disabled={updateLoading}
          >
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="basic-info-section">
          <h3>Thông tin cá nhân</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Họ và tên:</label>
              <span>{profile.fullName || "Chưa cập nhật"}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{profile.email || "Chưa cập nhật"}</span>
            </div>
            <div className="info-item">
              <label>Số điện thoại:</label>
              <span>{profile.phone || "Chưa cập nhật"}</span>
            </div>
            <div className="info-item">
              <label>Giới tính:</label>
              <span>{getGenderDisplay(profile.gender)}</span>
            </div>
            <div className="info-item">
              <label>Ngày sinh:</label>
              <span>{formatDate(profile.dateOfBirth)}</span>
            </div>
            <div className="info-item">
              <label>Địa chỉ:</label>
              <span>{profile.address || "Chưa cập nhật"}</span>
            </div>
          </div>
        </div>

        {renderRoleSpecificInfo()}

        {updateMessage && (
          <div
            className={`message ${
              updateMessage.includes("✅") ? "success" : "error"
            }`}
          >
            {updateMessage}
          </div>
        )}

        {isEditing && (
          <div className="edit-section">
            <h3>Chỉnh sửa thông tin</h3>
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleInputChange}
                    className={validationErrors.fullName ? "error" : ""}
                  />
                  {validationErrors.fullName && (
                    <span className="error-text">
                      {validationErrors.fullName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className={validationErrors.email ? "error" : ""}
                  />
                  {validationErrors.email && (
                    <span className="error-text">{validationErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className={validationErrors.phone ? "error" : ""}
                  />
                  {validationErrors.phone && (
                    <span className="error-text">{validationErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Giới tính</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Ngày sinh</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={
                      formData.dateOfBirth
                        ? formData.dateOfBirth.split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="avatarFile">Upload Avatar</label>
                  <div className="avatar-upload-section">
                    <input
                      type="file"
                      id="avatarFile"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ marginBottom: "10px" }}
                    />
                    {avatarPreview && (
                      <div className="avatar-preview">
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            marginBottom: "10px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleUploadAvatar}
                          disabled={uploadingAvatar}
                          className="upload-avatar-btn"
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#1976d2",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            opacity: uploadingAvatar ? 0.7 : 1,
                          }}
                        >
                          {uploadingAvatar ? "Đang upload..." : "Upload Avatar"}
                        </button>
                      </div>
                    )}
                    <div style={{ marginTop: "10px" }}>
                      <label htmlFor="avatarUrl">Hoặc nhập URL Avatar:</label>
                      <input
                        type="url"
                        id="avatarUrl"
                        name="avatarUrl"
                        value={formData.avatarUrl || ""}
                        onChange={handleInputChange}
                        placeholder="https://example.com/avatar.jpg"
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                  </div>
                  <small style={{ color: "#666", fontSize: "0.85em" }}>
                    Chọn file hình ảnh (max 5MB) hoặc nhập URL
                  </small>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Địa chỉ</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Nhập địa chỉ đầy đủ..."
                />
              </div>

              {/* Role-specific fields */}
              {user?.role?.toUpperCase() === USER_ROLES.DOCTOR && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="specialty">Chuyên khoa</label>
                      <input
                        type="text"
                        id="specialty"
                        name="specialty"
                        value={formData.specialty || ""}
                        onChange={handleInputChange}
                        placeholder="VD: Sản phụ khoa"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="qualification">Bằng cấp</label>
                      <input
                        type="text"
                        id="qualification"
                        name="qualification"
                        value={formData.qualification || ""}
                        onChange={handleInputChange}
                        placeholder="VD: Thạc sĩ, Tiến sĩ"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experienceYears">Số năm kinh nghiệm</label>
                    <input
                      type="number"
                      id="experienceYears"
                      name="experienceYears"
                      value={formData.experienceYears || ""}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                    />
                  </div>
                </>
              )}

              {(user?.role?.toUpperCase() === USER_ROLES.CUSTOMER ||
                user?.role?.toUpperCase() === USER_ROLES.PATIENT) && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="maritalStatus">Tình trạng hôn nhân</label>
                    <select
                      id="maritalStatus"
                      name="maritalStatus"
                      value={formData.maritalStatus || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn tình trạng</option>
                      <option value="single">Độc thân</option>
                      <option value="married">Đã kết hôn</option>
                      <option value="divorced">Đã ly hôn</option>
                      <option value="widowed">Góa</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="healthBackground">Tiền sử sức khỏe</label>
                    <textarea
                      id="healthBackground"
                      name="healthBackground"
                      value={formData.healthBackground || ""}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Mô tả ngắn về tình trạng sức khỏe..."
                    />
                  </div>
                </div>
              )}

              {(user?.role?.toUpperCase() === USER_ROLES.MANAGER ||
                user?.role?.toUpperCase() === USER_ROLES.ADMIN) && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="assignedDepartment">
                      Phòng ban phụ trách
                    </label>
                    <input
                      type="text"
                      id="assignedDepartment"
                      name="assignedDepartment"
                      value={formData.assignedDepartment || ""}
                      onChange={handleInputChange}
                      placeholder="VD: Phòng kế hoạch"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="extraPermissions">Quyền mở rộng</label>
                    <input
                      type="text"
                      id="extraPermissions"
                      name="extraPermissions"
                      value={formData.extraPermissions || ""}
                      onChange={handleInputChange}
                      placeholder="VD: Quản lý hệ thống"
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleEditToggle}
                  disabled={updateLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
