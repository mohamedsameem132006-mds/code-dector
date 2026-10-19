# CodeSense AI — Detect Errors. Fix Code. Learn Smarter.

CodeSense AI is a serverless, full-stack code analysis web application designed to help developers identify syntax errors, logical bugs, and security vulnerabilities across 17+ programming languages. It provides side-by-side visual diff repairs and dual-language AI teacher explanations in English and Tamil (தமிழ்).

## 🚀 Features

- **Multi-Language Detection & Analysis**: Supports Python, JavaScript, TypeScript, Java, C, C++, PHP, Go, Rust, Kotlin, Swift, Ruby, SQL, HTML, CSS, C#, and JSON.
- **AI Diagnostics (Gemini 3.8 Flash)**: Identifies syntax errors, runtime exceptions, logic flaws, and security vulnerabilities.
- **Dual-Language AI Teacher**: Explains technical concepts and step-by-step corrections in both English and Tamil (தமிழ்).
- **Monaco Code Diff Viewer**: Interactive side-by-side comparison preserving the original code.
- **Dynamic Quality Score**: Auditable, transparent metrics (Correctness, Maintainability, Security, Style).
- **Automated PDF Reports**: High-quality audit reports with native Tamil Unicode font rendering.
- **Firebase Authentication**: Secure user management via Firebase Auth (`e-dector`).
- **Cloud Firestore Database**: Persistent cloud storage for code analyses, user issues, and diagnostic history.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Monaco Editor, Recharts, Lucide Icons
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **AI Engine**: Google Gemini 3.8 Flash
- **Deployment**: Netlify (`code-detector.netlify.app`)

## 📦 Project Setup

### Frontend Build (for Netlify)
```bash
cd frontend
npm install
npm run build
```
The compiled production bundle will be located in `frontend/dist/`. Drag and drop this folder directly to Netlify!
