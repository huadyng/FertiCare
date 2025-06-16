package com.ferticare.ferticareback.common.dto;

import java.time.LocalDateTime;

public class ErrorResponse {
    private int status;             // HTTP status code (401, 404, 500...)
    private String error;           // Tên lỗi ngắn gọn (ví dụ: "Unauthorized")
    private String message;         // Mô tả lỗi chi tiết (ví dụ: "Invalid email or password")
    private String path;            // URL gây ra lỗi (nếu bạn muốn log)
    private LocalDateTime timestamp; // Thời điểm lỗi xảy ra

    public ErrorResponse(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now(); // Gán thời điểm hiện tại
    }

    // Getters & setters
    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}