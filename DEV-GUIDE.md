# 🚀 FertiCare Development Guide

## Quick Start Commands

### 🎯 **Start Both Frontend & Backend (Recommended)**

```bash
npm start
```

hoặc double-click:

```
start-all.bat
```

### 🎨 **Frontend Only**

```bash
npm run dev
```

### ⚙️ **Backend Only**

```bash
npm run backend
```

### 💡 **Advanced Options (PowerShell)**

```powershell
# Start both
.\start-dev.ps1

# Frontend only
.\start-dev.ps1 -FrontendOnly

# Backend only
.\start-dev.ps1 -BackendOnly

# Show help
.\start-dev.ps1 -Help
```

## 📋 **Application URLs**

| Service            | URL                                   | Description             |
| ------------------ | ------------------------------------- | ----------------------- |
| 🎨 **Frontend**    | http://localhost:3000                 | React + Vite Dev Server |
| ⚙️ **Backend**     | http://localhost:8080                 | Spring Boot API         |
| 📚 **Swagger UI**  | http://localhost:8080/swagger-ui.html | API Documentation       |
| 💾 **H2 Database** | http://localhost:8080/h2-console      | Database Console        |

## 🛠️ **Development Scripts**

| Command            | Description                               |
| ------------------ | ----------------------------------------- |
| `npm start`        | 🚀 Start both FE & BE with colored output |
| `npm run dev`      | 🎨 Start Frontend only (Vite)             |
| `npm run backend`  | ⚙️ Start Backend only (Spring Boot)       |
| `npm run build`    | 📦 Build for production                   |
| `npm run lint`     | 🔍 Check code quality                     |
| `npm run lint:fix` | 🔧 Fix linting issues                     |

## 🚨 **Troubleshooting**

- **Port 5173 already in use**: Kill Vite process or change port in `vite.config.js`
- **Port 8080 already in use**: Kill Spring Boot process or change port in `application.properties`
- **PowerShell execution policy**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
