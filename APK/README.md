# Shashwat Group - Desktop Application & Mobile APK Package

This directory (`APK/`) contains the packaging configuration for building:
1. **Windows 10 / 11 Native Desktop Application (`.exe` installer)** with automatic **Desktop Shortcut creation** and custom **Client Logo Icon**.
2. **Android Mobile APK (`.apk`)** for mobile warehouse and sales agents.

Both applications connect directly to your live **Supabase Cloud Database** and **15 GB Free Google Drive** with zero server maintenance.

---

## 🖥️ 1. Windows 10 & 11 Desktop Application

### Features:
- **Native Windows Window**: Fast, standalone desktop software (works on Windows 10 & 11).
- **Automatic Desktop Shortcut**: The installer automatically places a shortcut on the user's desktop named **"Shashwat Group CRM"**.
- **Custom Client Logo Icon**: Displays the client's official logo on the desktop icon, taskbar, and installer window.
- **Direct Thermal & A4 Printing**: Native Windows printer dialog for instant receipt and invoice printing.
- **Micro-PDF Direct Downloads**: Invoices and delivery challans saved in KB directly to the user's Documents folder.

### Project Structure:
```text
APK/
├── windows/
│   ├── assets/               # Placeholders for client logo (icon.ico, icon.png)
│   ├── main.js               # Windows desktop window process & native lifecycle
│   ├── package.json          # Desktop builder dependencies & NSIS shortcut settings
│   └── build-windows.ps1     # 1-click build script to generate the Windows .exe installer
├── android/                  # Android APK packaging configuration
└── README.md
```

---

## 🎨 Client Logo Placeholder
Once you provide your client's logo tomorrow:
1. Save the high-resolution logo as `APK/windows/assets/logo.png`.
2. Convert it to Windows icon format as `APK/windows/assets/icon.ico`.
3. Run the 1-click build script to generate the installer with the client's logo embedded!
