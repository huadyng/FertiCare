# 📧 Mail Server Troubleshooting Guide

## 🚨 Lỗi hiện tại

```
MailSendException: Mail server connection failed
Could not convert socket to TLS
PKIX path building failed: unable to find valid certification path to requested target
```

## 🔧 Giải pháp đã áp dụng

### 1. ✅ Cải thiện Frontend UX

- Xử lý lỗi mail gracefully trong `Register.jsx`
- Thông báo rõ ràng cho user khi gặp lỗi mail
- Cho phép user đăng nhập ngay cả khi mail server lỗi

### 2. ✅ Cải thiện Backend Mail Config

Đã thêm các cấu hình sau vào `application.properties`:

```properties
# ✅ Fix SSL/TLS issues
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
spring.mail.properties.mail.smtp.ssl.checkserveridentity=false
spring.mail.properties.mail.smtp.ssl.enable=false
spring.mail.properties.mail.smtp.starttls.required=false

# 🔧 Debug mail (tắt trong production)
spring.mail.properties.mail.debug=true
spring.mail.properties.mail.smtp.debug=true

# 🛡️ Fallback cho development
spring.mail.test-connection=false
```

## 🔍 Các bước troubleshoot khác

### Option 1: Kiểm tra Gmail App Password

1. Truy cập [Google Account Security](https://myaccount.google.com/security)
2. Bật 2-Factor Authentication
3. Tạo App Password mới cho FertiCare
4. Cập nhật `spring.mail.password` trong config

### Option 2: Sử dụng Mail Service khác

```properties
# Mailtrap (cho development)
spring.mail.host=smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=your-mailtrap-username
spring.mail.password=your-mailtrap-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Option 3: Tạo Mock Mail Service (Development)

Tạo profile `application-dev.properties`:

```properties
# Mock mail cho development
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.username=
spring.mail.password=
spring.mail.properties.mail.smtp.auth=false
spring.mail.properties.mail.smtp.starttls.enable=false

# Hoặc disable mail hoàn toàn
spring.mail.enabled=false
```

## 🚀 Testing Mail Configuration

### 1. Test bằng MailHog (Recommended)

```bash
# Cài đặt MailHog
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Cập nhật config
spring.mail.host=localhost
spring.mail.port=1025
```

### 2. Test bằng Gmail SMTP

```bash
# Test kết nối bằng telnet
telnet smtp.gmail.com 587
```

## 🔒 Security Notes

### Production Config

```properties
# Production - bỏ debug
spring.mail.properties.mail.debug=false
spring.mail.properties.mail.smtp.debug=false

# Production - tăng cường security
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.checkserveridentity=true
```

### Environment Variables

Nên sử dụng environment variables cho production:

```properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

## 📝 Next Steps

1. **Immediate**: Backend đã được fix với config mới
2. **Short-term**: Test với MailHog cho development
3. **Long-term**:
   - Chuyển sang professional mail service
   - Implement email templates
   - Add email queue system

## 🐛 Common Issues & Solutions

### Issue: "Authentication failed"

**Solution**: Kiểm tra App Password và 2FA

### Issue: "Connection timeout"

**Solution**: Kiểm tra firewall và port 587

### Issue: "SSL handshake failed"

**Solution**: Sử dụng config SSL đã cập nhật ở trên

### Issue: "PKIX path building failed"

**Solution**: Thêm `ssl.trust` config như đã làm

## 💡 Development Tips

1. **Sử dụng MailHog** cho development local
2. **Log email content** thay vì gửi thật trong dev
3. **Mock email service** cho unit tests
4. **Environment-specific config** cho từng môi trường

---

_Last updated: $(date)_
_Status: ✅ Fixed with current config changes_
