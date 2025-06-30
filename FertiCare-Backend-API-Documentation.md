# FertiCare Backend API Documentation

## Tổng quan

Hệ thống FertiCare Backend được xây dựng bằng Spring Boot và cung cấp các API RESTful cho ứng dụng quản lý y tế sinh sản. Hệ thống được chia thành các module chính:

- **Authentication & Authorization** - Xác thực và phân quyền
- **User Management** - Quản lý người dùng
- **Service Management** - Quản lý dịch vụ
- **Notification Management** - Quản lý thông báo
- **Blog Management** - Quản lý blog
- **Profile Management** - Quản lý hồ sơ
- **File Management** - Quản lý file

---

## 1. Authentication & Authorization APIs

### Base URL: `/api/auth`

#### 1.1 Đăng nhập thông thường

- **Endpoint**: `POST /api/auth/login`
- **Description**: Xác thực người dùng bằng email/password
- **Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

- **Response**: `LoginResponse` với JWT token
- **Status Codes**: 200 (Success), 401 (Unauthorized), 403 (Forbidden), 500 (Internal Error)

#### 1.2 Đăng nhập bằng Google

- **Endpoint**: `POST /api/auth/google-login`
- **Description**: Xác thực người dùng bằng Google OAuth
- **Request Body**:

```json
{
  "googleToken": "string"
}
```

- **Response**: `LoginResponse` với JWT token
- **Status Codes**: 200 (Success), 401 (Unauthorized), 500 (Internal Error)

---

## 2. User Management APIs

### 2.1 User Registration

#### Base URL: `/api/users`

##### 2.1.1 Đăng ký người dùng

- **Endpoint**: `POST /api/users`
- **Description**: Đăng ký tài khoản người dùng mới
- **Request Body**: `UserRegisterRequest`
- **Response**: `UserResponse`
- **Status Codes**: 200 (Success), 400 (Bad Request), 500 (Internal Error)

### 2.2 Admin Management

#### Base URL: `/api/admin`

##### 2.2.1 Truy cập Admin (yêu cầu quyền Admin)

- **Endpoint**: `GET /api/admin`
- **Description**: Endpoint dành riêng cho Admin
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Welcome message
- **Permissions**: Admin Only

##### 2.2.2 Tạo user bởi Admin (yêu cầu quyền Admin)

- **Endpoint**: `POST /api/admin`
- **Description**: Admin tạo tài khoản cho người dùng khác
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `UserCreateByAdminRequest`
- **Response**: `UserResponse`
- **Permissions**: Admin Only

### 2.3 Doctor Management

#### Base URL: `/api/doctor`

##### 2.3.1 Xem lịch trình bác sĩ (yêu cầu quyền Doctor)

- **Endpoint**: `GET /api/doctor/schedule`
- **Description**: Lấy lịch trình của bác sĩ
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Schedule information
- **Permissions**: Doctor Only

#### Base URL: `/api/doctors`

##### 2.3.2 Lấy danh sách bác sĩ

- **Endpoint**: `GET /api/doctors`
- **Description**: Lấy danh sách tất cả bác sĩ với lịch trình
- **Response**: `List<DoctorScheduleDTO>`
- **Status Codes**: 200 (Success)

### 2.4 Manager Management

#### Base URL: `/api/manager`

##### 2.4.1 Xem báo cáo (yêu cầu quyền Manager)

- **Endpoint**: `GET /api/manager/report`
- **Description**: Xem báo cáo dành cho Manager
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Report information
- **Permissions**: Manager Only

---

## 3. Service Management APIs

### Base URL: `/api/services`cd ferticare-back

./mvnw clean spring-boot:runcd ferticare-back
./mvnw clean spring-boot:run

#### 3.1 Lấy danh sách dịch vụ

- **Endpoint**: `GET /api/services`
- **Description**: Lấy tất cả dịch vụ có sẵn
- **Response**: `List<ServiceResponse>`
- **Status Codes**: 200 (Success), 500 (Internal Error)

### Base URL: `/api/service-request`

#### 3.2 Gửi yêu cầu dịch vụ

- **Endpoint**: `POST /api/service-request`
- **Description**: Gửi yêu cầu đặt lịch dịch vụ
- **Request Body**: `ServiceRequestDTO`
- **Response**: Service request confirmation
- **Authentication**: Required

#### 3.3 Lấy danh sách bác sĩ có sẵn

- **Endpoint**: `GET /api/service-request/available-doctors/{serviceId}`
- **Description**: Lấy danh sách bác sĩ có thể thực hiện dịch vụ
- **Path Parameters**:
  - `serviceId` (UUID): ID của dịch vụ
- **Response**: List of available doctors
- **Status Codes**: 200 (Success), 400 (Bad Request)

#### 3.4 Lấy thời gian rảnh của bác sĩ

- **Endpoint**: `GET /api/service-request/doctor-available-times/{doctorId}`
- **Description**: Lấy thời gian rảnh của bác sĩ trong ngày
- **Path Parameters**:
  - `doctorId` (UUID): ID của bác sĩ
- **Query Parameters**:
  - `date` (LocalDate, optional): Ngày cần kiểm tra (mặc định là hôm nay)
- **Response**: Available time slots
- **Status Codes**: 200 (Success), 400 (Bad Request)

---

## 4. Notification Management APIs

### 4.1 Appointment Notifications

#### Base URL: `/api/notifications/appointment`

##### 4.1.1 Test gửi email xác nhận lịch hẹn

- **Endpoint**: `POST /api/notifications/appointment/test-confirmation`
- **Description**: API test gửi email thông báo lịch hẹn
- **Request Body**: `AppointmentEmailDTO`
- **Response**: Success/Error message
- **Status Codes**: 200 (Success), 500 (Internal Error)

##### 4.1.2 Test gửi email nhắc nhở lịch hẹn

- **Endpoint**: `POST /api/notifications/appointment/test-reminder`
- **Description**: API test gửi email nhắc nhở lịch hẹn
- **Request Body**: `AppointmentEmailDTO`
- **Response**: Success/Error message
- **Status Codes**: 200 (Success), 500 (Internal Error)

##### 4.1.3 Test gửi email hủy lịch hẹn

- **Endpoint**: `POST /api/notifications/appointment/test-cancellation`
- **Description**: API test gửi email hủy lịch hẹn
- **Request Body**: `AppointmentEmailDTO`
- **Response**: Success/Error message
- **Status Codes**: 200 (Success), 500 (Internal Error)

##### 4.1.4 Gửi email xác nhận cho appointment cụ thể

- **Endpoint**: `POST /api/notifications/appointment/{appointmentId}/send-confirmation`
- **Description**: Gửi email xác nhận cho appointment cụ thể
- **Path Parameters**:
  - `appointmentId` (String): ID của appointment
- **Response**: Success/Error message
- **Status Codes**: 200 (Success), 500 (Internal Error)

### 4.2 Email Verification

#### Base URL: `/api/notifications`

##### 4.2.1 Xác thực email

- **Endpoint**: `GET /api/notifications/verify-email`
- **Description**: Xác thực email thông qua token
- **Query Parameters**:
  - `token` (String): Token xác thực email
- **Response**: `VerifyResponse`
- **Status Codes**: 200 (Success), 400 (Bad Request), 500 (Internal Error)

---

## 5. Blog Management APIs

### 5.1 Blog Posts

#### Base URL: `/api/blogs`

##### 5.1.1 Tạo blog mới

- **Endpoint**: `POST /api/blogs`
- **Description**: Tạo bài viết blog mới
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `BlogRequest`
- **Response**: `BlogResponse`
- **Authentication**: Required
- **Status Codes**: 200 (Success), 400 (Bad Request)

##### 5.1.2 Lấy blog theo ID

- **Endpoint**: `GET /api/blogs/{id}`
- **Description**: Lấy chi tiết bài viết blog
- **Path Parameters**:
  - `id` (UUID): ID của blog
- **Headers**: `Authorization: Bearer <token>` (optional)
- **Response**: `BlogResponse`
- **Note**: Blog chưa publish chỉ hiển thị cho người có quyền
- **Status Codes**: 200 (Success), 401 (Unauthorized), 403 (Forbidden)

##### 5.1.3 Lấy danh sách blog đã publish

- **Endpoint**: `GET /api/blogs/published`
- **Description**: Lấy tất cả blog đã được phê duyệt và publish
- **Response**: `List<BlogResponse>`
- **Authentication**: Not required
- **Status Codes**: 200 (Success)

##### 5.1.4 Xóa blog

- **Endpoint**: `DELETE /api/blogs/{id}`
- **Description**: Xóa bài viết blog
- **Path Parameters**:
  - `id` (UUID): ID của blog
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
- **Authentication**: Required (chỉ tác giả hoặc admin)
- **Status Codes**: 200 (Success), 403 (Forbidden)

##### 5.1.5 Lưu trữ blog

- **Endpoint**: `PUT /api/blogs/{id}/archive`
- **Description**: Lưu trữ bài viết blog
- **Path Parameters**:
  - `id` (UUID): ID của blog
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
- **Authentication**: Required (chỉ tác giả hoặc admin)
- **Status Codes**: 200 (Success), 403 (Forbidden)

##### 5.1.6 Phê duyệt blog (yêu cầu quyền Manager)

- **Endpoint**: `PUT /api/blogs/{id}/approve`
- **Description**: Phê duyệt và publish blog
- **Path Parameters**:
  - `id` (UUID): ID của blog
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
- **Permissions**: Manager Only
- **Status Codes**: 200 (Success), 400 (Bad Request)

##### 5.1.7 Lấy tất cả blog (dành cho Manager)

- **Endpoint**: `GET /api/blogs/all`
- **Description**: Lấy tất cả blog (bao gồm chưa publish)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `List<BlogResponse>`
- **Permissions**: Manager Only
- **Status Codes**: 200 (Success)

##### 5.1.8 Lấy blog của tôi

- **Endpoint**: `GET /api/blogs/my`
- **Description**: Lấy tất cả blog của người dùng hiện tại
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `List<BlogResponse>`
- **Authentication**: Required
- **Status Codes**: 200 (Success), 401 (Unauthorized)

### 5.2 Blog Images

#### Base URL: `/api/blog-images`

##### 5.2.1 Upload ảnh blog

- **Endpoint**: `POST /api/blog-images/upload`
- **Description**: Upload ảnh cho blog
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file` (MultipartFile): File ảnh cần upload
- **Response**:

```json
{
  "fileName": "string",
  "fileUrl": "string"
}
```

- **Status Codes**: 200 (Success), 400 (Bad Request)

##### 5.2.2 Lấy ảnh blog

- **Endpoint**: `GET /api/blog-images/{imageFolder}/{imageName}`
- **Description**: Lấy file ảnh blog
- **Path Parameters**:
  - `imageFolder` (String): Thư mục chứa ảnh
  - `imageName` (String): Tên file ảnh
- **Response**: Image file (binary)
- **Content-Type**: Depends on image format
- **Status Codes**: 200 (Success), 404 (Not Found), 400 (Bad Request)

### 5.3 Comments

#### Base URL: `/api/comments`

##### 5.3.1 Tạo bình luận mới

- **Endpoint**: `POST /api/comments`
- **Description**: Tạo bình luận cho blog
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `CommentRequest`
- **Response**: `Comment`
- **Authentication**: Required
- **Status Codes**: 200 (Success)

##### 5.3.2 Lấy bình luận của blog

- **Endpoint**: `GET /api/comments/blog/{blogId}`
- **Description**: Lấy tất cả bình luận của một blog
- **Path Parameters**:
  - `blogId` (UUID): ID của blog
- **Response**: `List<Comment>`
- **Status Codes**: 200 (Success)

##### 5.3.3 Ẩn bình luận

- **Endpoint**: `DELETE /api/comments/{commentId}`
- **Description**: Ẩn bình luận (chỉ tác giả hoặc admin)
- **Path Parameters**:
  - `commentId` (UUID): ID của bình luận
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message
- **Authentication**: Required (chỉ tác giả hoặc admin)
- **Status Codes**: 200 (Success)

---

## 6. Profile Management APIs

### Base URL: `/api/profiles`

#### 6.1 Common Profile APIs

##### 6.1.1 Lấy hồ sơ của tôi

- **Endpoint**: `GET /api/profiles/me`
- **Description**: Lấy hồ sơ của người dùng hiện tại
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Profile object (tùy theo role)
- **Authentication**: Required
- **Status Codes**: 200 (Success)

##### 6.1.2 Cập nhật avatar

- **Endpoint**: `POST /api/profiles/me/avatar`
- **Description**: Cập nhật ảnh đại diện
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `avatar` (MultipartFile): File ảnh avatar
- **Response**: `GenericResponse` với avatarUrl
- **Authentication**: Required
- **Status Codes**: 200 (Success), 400 (Bad Request)

#### 6.2 Doctor Profile APIs

##### 6.2.1 Lấy hồ sơ bác sĩ

- **Endpoint**: `GET /api/profiles/doctor/me`
- **Description**: Lấy hồ sơ chi tiết của bác sĩ
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `DoctorProfileResponse`
- **Authentication**: Required (Doctor role)
- **Status Codes**: 200 (Success)

##### 6.2.2 Cập nhật hồ sơ bác sĩ

- **Endpoint**: `PUT /api/profiles/doctor/me`
- **Description**: Cập nhật thông tin hồ sơ bác sĩ
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `UpdateDoctorProfileRequest`
- **Response**: `GenericResponse` với `DoctorProfileResponse`
- **Authentication**: Required (Doctor role)
- **Status Codes**: 200 (Success)

#### 6.3 Customer Profile APIs

##### 6.3.1 Lấy hồ sơ khách hàng

- **Endpoint**: `GET /api/profiles/customer/me`
- **Description**: Lấy hồ sơ chi tiết của khách hàng
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `CustomerProfileResponse`
- **Authentication**: Required (Customer role)
- **Status Codes**: 200 (Success)

##### 6.3.2 Cập nhật hồ sơ khách hàng

- **Endpoint**: `PUT /api/profiles/customer/me`
- **Description**: Cập nhật thông tin hồ sơ khách hàng
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `UpdateCustomerProfileRequest`
- **Response**: `GenericResponse` với `CustomerProfileResponse`
- **Authentication**: Required (Customer role)
- **Status Codes**: 200 (Success)

#### 6.4 Manager/Admin Profile APIs

##### 6.4.1 Lấy hồ sơ Manager/Admin

- **Endpoint**: `GET /api/profiles/admin/me`
- **Description**: Lấy hồ sơ chi tiết của Manager/Admin
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `ManagerAdminProfileResponse`
- **Authentication**: Required (Manager/Admin role)
- **Status Codes**: 200 (Success)

##### 6.4.2 Cập nhật hồ sơ Manager/Admin

- **Endpoint**: `PUT /api/profiles/admin/me`
- **Description**: Cập nhật thông tin hồ sơ Manager/Admin
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `UpdateManagerAdminProfileRequest`
- **Response**: `GenericResponse` với `ManagerAdminProfileResponse`
- **Authentication**: Required (Manager/Admin role)
- **Status Codes**: 200 (Success)

---

## 7. File Management APIs

### Base URL: `/api/files`

#### 7.1 Truy xuất file

- **Endpoint**: `GET /api/files/{directory}/{filename}`
- **Description**: Lấy file từ hệ thống lưu trữ
- **Path Parameters**:
  - `directory` (String): Thư mục chứa file
  - `filename` (String): Tên file
- **Response**: File content (binary)
- **Content-Type**: Depends on file type (image/png, image/jpeg, etc.)
- **Status Codes**: 200 (Success), 404 (Not Found)

---

## Các Role/Permissions trong hệ thống

### Role Definitions:

- **ADMIN**: Quyền cao nhất, có thể quản lý tất cả
- **MANAGER**: Quản lý nội dung, phê duyệt blog
- **DOCTOR**: Bác sĩ, quản lý lịch trình và bệnh nhân
- **CUSTOMER**: Khách hàng, sử dụng dịch vụ

### Authentication:

- Hầu hết API yêu cầu JWT token trong header: `Authorization: Bearer <token>`
- Một số API public không yêu cầu authentication
- Một số API có permission riêng biệt theo role

### CORS Configuration:

- Frontend được phép truy cập từ: `http://localhost:3000`

### File Upload Configuration:

- Thư mục upload mặc định: `uploads/`
- Hỗ trợ các format ảnh: PNG, JPG, JPEG, GIF, WEBP, BMP

---

## Error Response Format

Hệ thống sử dụng format lỗi chuẩn:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Chi tiết lỗi",
  "path": "/api/endpoint"
}
```

## Notes

1. Tất cả UUID parameters phải đúng format UUID
2. JWT token có thời hạn, cần refresh khi hết hạn
3. Upload file có giới hạn kích thước (cần kiểm tra cấu hình)
4. Một số API đang trong giai đoạn phát triển (có comment TODO)
5. System hỗ trợ CORS cho phát triển frontend
6. Các API test email chỉ nên dùng trong môi trường development
