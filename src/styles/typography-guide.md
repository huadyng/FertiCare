# 🎨 Typography Guide - FertiCare

## 📖 Tổng Quan

Dự án FertiCare đã được cập nhật với hệ thống typography hiện đại sử dụng **Google Fonts**:

- **Inter** - Font chính cho nội dung, UI elements
- **Poppins** - Font cho headings, titles, brand elements

## 🔧 Font Configuration

### Google Fonts Import

```html
<!-- Đã được thêm vào index.html -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

### CSS Variables

```css
/* Font Families */
--font-family-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
--font-family-heading: "Poppins", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, "Helvetica Neue", Arial, sans-serif;
--font-family-mono: "SFMono-Regular", "Menlo", "Monaco", "Consolas",
  "Liberation Mono", "Courier New", monospace;

/* Font Weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;

/* Font Sizes */
--font-size-xs: 11px;
--font-size-sm: 12px;
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-xl: 18px;
--font-size-2xl: 20px;
--font-size-3xl: 24px;
--font-size-4xl: 28px;
--font-size-5xl: 32px;
--font-size-6xl: 36px;
```

## 🎯 Cách Sử Dụng

### 1. Headings (H1-H6)

```css
/* Tự động sử dụng Poppins font */
h1 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-6xl);
}
h2 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-5xl);
}
h3 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-4xl);
}
h4 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
}
h5 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
}
h6 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
}
```

### 2. Body Text & UI Elements

```css
/* Tự động sử dụng Inter font */
body,
p,
span,
div {
  font-family: var(--font-family-primary);
}
```

### 3. Utility Classes

```css
/* Font Sizes */
.text-xs {
  font-size: var(--font-size-xs);
}
.text-sm {
  font-size: var(--font-size-sm);
}
.text-base {
  font-size: var(--font-size-base);
}
.text-lg {
  font-size: var(--font-size-lg);
}
.text-xl {
  font-size: var(--font-size-xl);
}
.text-2xl {
  font-size: var(--font-size-2xl);
}
.text-3xl {
  font-size: var(--font-size-3xl);
}

/* Font Weights */
.font-light {
  font-weight: var(--font-weight-light);
}
.font-normal {
  font-weight: var(--font-weight-normal);
}
.font-medium {
  font-weight: var(--font-weight-medium);
}
.font-semibold {
  font-weight: var(--font-weight-semibold);
}
.font-bold {
  font-weight: var(--font-weight-bold);
}
.font-extrabold {
  font-weight: var(--font-weight-extrabold);
}

/* Letter Spacing */
.tracking-tight {
  letter-spacing: var(--letter-spacing-tight);
}
.tracking-normal {
  letter-spacing: var(--letter-spacing-normal);
}
.tracking-wide {
  letter-spacing: var(--letter-spacing-wide);
}
```

## ✨ Ví Dụ Sử Dụng

### React Component

```jsx
import React from "react";

const ExampleComponent = () => {
  return (
    <div>
      {/* Heading tự động sử dụng Poppins */}
      <h1 className="font-bold">FertiCare - Fertility Clinic</h1>
      <h2 className="font-semibold text-3xl">Our Services</h2>

      {/* Body text tự động sử dụng Inter */}
      <p className="text-lg font-normal">
        Welcome to our modern fertility clinic
      </p>

      {/* Custom styling với utility classes */}
      <span className="text-sm font-medium tracking-wide">
        Professional Care
      </span>
    </div>
  );
};
```

### CSS Styling

```css
.custom-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
}

.custom-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
}
```

## 📱 Responsive Typography

Font sizes tự động adapt với responsive design:

```css
@media (max-width: 768px) {
  html {
    font-size: 12px; /* Base font size nhỏ hơn cho mobile */
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-xs);
  }
}
```

## 🎨 Components Đã Cập Nhật

✅ **Files đã cập nhật**:

- `index.html` - Google Fonts import
- `src/index.css` - CSS Variables & typography system
- `src/components/layout/Header/Header.css` - Header typography
- `src/components/layout/Footer/Footer.css` - Footer typography
- `src/components/doctor/DoctorTheme.css` - Doctor dashboard typography

## 🚀 Lợi Ích

1. **Hiện đại**: Inter & Poppins là fonts hiện đại, được thiết kế cho UI/UX
2. **Nhất quán**: Tất cả components sử dụng cùng font system
3. **Hiệu năng**: Google Fonts với preconnect và font-display: swap
4. **Accessibility**: Font có contrast ratio tốt, dễ đọc
5. **Responsive**: Auto-scaling với different screen sizes
6. **Maintainable**: CSS Variables dễ bảo trì và thay đổi

## 💡 Best Practices

1. **Sử dụng CSS Variables** thay vì hardcode font values
2. **Poppins cho headings** để tạo hierarchy rõ ràng
3. **Inter cho body text** để dễ đọc và professional
4. **Consistent spacing** với line-height và letter-spacing
5. **Performance optimization** với font preloading

---

**Updated**: 2024-01-20  
**Version**: 2.0.0  
**Fonts**: Inter + Poppins via Google Fonts
