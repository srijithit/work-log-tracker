# Work Log Tracker & Developer Performance Dashboard

A modern, responsive, and secure daily task logging and monthly performance tracking application featuring team member workspaces, PIN-protected profiles, automatic month navigation, automated 5:00 PM email notifications, and DOCX/CSV report generation.

---

## 🌟 Key Features

- 👥 **Team Member Separation**: Dedicated workspaces for **Srijith**, **Sri mathi**, **Akila**, and **Jayaraj** with isolated logs and "All Members" overview.
- 🔒 **PIN Authentication & User Settings**:
  - Secure profile selection and PIN login (Default PIN: `1234`).
  - Personal **Profile & Security Settings** dialog to change your login PIN, update email, and customize color themes.
  - **Strict Data Ownership**: Tamper-proof logs—no member (including Admin) can edit or delete another member's logs.
- 📅 **Dynamic Month Navigator**: Automatic detection of the current system month/year with `<` and `>` month navigation and "All Months" overview.
- ⏰ **Automated 5:00 PM Email Reminders (Mon–Sat)**:
  - Background scheduler in `server.py` dispatches daily reminder emails every Monday through Saturday at 5:00 PM.
  - "5 PM Alerts" Notification Center with custom SMTP configuration and instant test email delivery.
- 📄 **DHIGROWTH DOCX & CSV Report Export**:
  - **Export DOCX**: Generates official **DHIGROWTH BUSINESS PRIVATE LIMITED - Monthly Developer Performance Report** Word documents with employee details, daily work log tables, performance metrics, and manager evaluation.
  - **Export CSV**: Instant spreadsheet data export for Excel or Google Sheets.
- ⏱️ **Automatic Time & Duration Engine**: Computes exact duration between start and end times (e.g. `10 AM TO 6:30 PM` = `8.5 hrs`).
- 📁 **Project Management**: Dynamic project management with autocomplete suggestions and dropdown filters.

---

## 📁 Project Structure

- `index.html` — Full-featured dashboard layout with Tailwind CSS and Lucide icons.
- `styles.css` — Custom scrollbars, transition effects, and print media formatting.
- `app.js` — Core client logic, state management, auth sessions, and export triggers.
- `server.py` — Python backend server with Mon–Sat 5:00 PM scheduler and DOCX/reminder API endpoints.
- `report_generator.py` — Generates DHIGROWTH-styled Word documents (`.docx`) using `python-docx`.

---

## 🏃 Running the Application

1. **Start the Backend Server (Scheduler & DOCX Export)**:
   ```bash
   python server.py
   ```
2. **Access in Browser**:
   Open [http://localhost:3000](http://localhost:3000) in any modern web browser.

---

## 👨‍💻 Developer

Developed with ❤️ by **[Srijith](https://srijith.vercel.app)**
Portfolio: [https://srijith.vercel.app](https://srijith.vercel.app)
