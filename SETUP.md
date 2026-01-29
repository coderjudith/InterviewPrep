# 🔧 Detailed Setup Guide - Interview Reviewer App

This guide provides step-by-step instructions for setting up the Interview Reviewer application on different operating systems.

## 🖥️ Windows Setup

### Prerequisites Installation

1. **Install XAMPP**
   - Download from [apachefriends.org](https://www.apachefriends.org/)
   - Run installer with default settings
   - Install to `C:\xampp\` (recommended)

2. **Install Node.js**
   - Download LTS version from [nodejs.org](https://nodejs.org/)
   - Run installer with default settings
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

### Project Setup

1. **Clone or Download Project**

   ```bash
   # Using Git
   git clone https://github.com/coderjudith/InterviewPrep.git
   cd InterviewPrep

   # Or download ZIP and extract to:
   # C:\xampp\htdocs\InterviewPrep\
   ```

- Folder Structure Verification
- Ensure you have this structure:

  ```bash
  C:\xampp\htdocs\InterviewPrep\
  ├── frontend\
  │ ├── index.html
  │ ├── style.css
  │ └── app.js
  ├── backend\
  │ ├── server.js
  │ └── package.json
  └── README.md
  ```

2.  **Starting the Application**

- Start Apache
- Open XAMPP Control Panel
- Click Start next to Apache

3. **Start Backend**

```bash
cd C:\xampp\htdocs\InterviewPrep\backend
npm install
npm start

4. **Access Application**
- Open browser to: http://localhost/frontend/
- Or: http://127.0.0.1/frontend/
```
