# SilAi

SilAi is an AI-powered chat application that allows users to have conversations with historical leaders. It features a React frontend, Django REST API backend, Google OAuth authentication, and uses Ollama with LangChain for AI-powered responses.

---

## 🌟 Features

- **Google OAuth Authentication** - Secure login with Google
- **AI Chat with Historical Leaders** - Chat with AI personas of historical figures
- **Real-time Streaming Responses** - See AI responses as they're generated
- **Multiple Chat Sessions** - Create and manage multiple conversations
- **Cross-device Session Sync** - Access your chats from any device
- **RAG (Retrieval-Augmented Generation)** - AI responses based on knowledge documents

---

## 📁 Project Structure

```
SilAi/
├── backend/           # Django backend (API, authentication, etc.)
│   ├── api/           # Leaders, Chat, Session management
│   ├── accounts/      # User authentication & profiles
│   ├── backend_site/  # Django settings & configuration
│   ├── media/         # Uploaded files (PDFs, images)
│   └── env/           # Virtual environment (not tracked)
├── frontend/          # React frontend (UI)
│   ├── public/
│   └── src/
│       ├── Pages/     # React page components
│       ├── Component/ # Reusable components
│       ├── reducer/   # Redux state management
│       └── css/       # Stylesheets
└── PDF/               # Source PDF documents for leaders
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 14+** - [Download Node.js](https://nodejs.org/)
- **Yarn** - `npm install -g yarn`
- **Ollama** - [Download Ollama](https://ollama.ai/) (for AI chat functionality)
- **Git** - [Download Git](https://git-scm.com/)

---

## 🚀 Quick Start

### 1. Clone the Repository
```sh
git clone https://github.com/prad18/SilAi.git
cd SilAi
```

---

## 🔧 Backend Setup (Django)

### Step 1: Create Virtual Environment
```sh
cd backend
python -m venv env
# On Windows:
env\Scripts\activate
# On macOS/Linux:
source env/bin/activate
```

### Step 2: Install Dependencies
```sh
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Settings
SECRET_KEY=your_django_secret_key_here
DEBUG=True

# Email Configuration (for password reset, verification)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# Database (Optional - defaults to SQLite)
# DB_NAME=your_db_name
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
# DB_HOST=localhost
# DB_PORT=5432
```

**Generate Django Secret Key:**
```sh
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 4: Run Migrations
```sh
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Create Superuser (Admin)
```sh
python manage.py createsuperuser
```
Follow the prompts to create your admin account.

### Step 6: Start Backend Server
```sh
python manage.py runserver
```
Backend will be available at `http://localhost:8000/`

---

## ⚛️ Frontend Setup (React)

### Step 1: Install Dependencies
```sh
cd frontend
yarn install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Step 3: Start Frontend Server
```sh
yarn start
```
Frontend will be available at `http://localhost:3000/`

---

## 🔐 Google OAuth Setup (Required for Login)

This is a **critical step** for the application to work. Follow these instructions carefully:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"New Project"**
3. Enter project name (e.g., "SilAi") and click **Create**
4. Select your new project from the dropdown

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in the required fields:
   - **App name**: SilAi
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue** through the remaining steps
5. Add test users if needed (your Google email)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: SilAi Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:8000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000
     http://localhost:8000/accounts/google/login/callback/
     ```
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Add Credentials to Frontend

Add your Client ID to `frontend/.env`:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

### Step 5: Configure Django Admin (⚠️ Important!)

1. Start both servers (backend and frontend)
2. Go to Django Admin: `http://localhost:8000/admin/`
3. Login with your superuser credentials

#### Add Site Configuration:
1. Go to **Sites** → Click on the existing site (or add new)
2. Set:
   - **Domain name**: `localhost:8000`
   - **Display name**: `SilAi`
3. Click **Save**

#### Add Social Application:
1. Go to **Social applications** → **Add social application**
2. Fill in:
   - **Provider**: Google
   - **Name**: Google OAuth
   - **Client ID**: (paste your Google Client ID)
   - **Secret key**: (paste your Google Client Secret)
   - **Sites**: Move `localhost:8000` to **Chosen sites**
3. Click **Save**

### Step 6: Test Google Login

1. Go to `http://localhost:3000`
2. Click **"Sign in with Google"**
3. Select your Google account
4. You should be redirected to the home page

---

## 🤖 Ollama Setup (For AI Chat)

The AI chat feature requires Ollama running locally with the `qwen2.5` model.

### Step 1: Install Ollama

Download and install from [ollama.ai](https://ollama.ai/)

### Step 2: Pull the Model
```sh
ollama pull qwen2.5
```

### Step 3: Start Ollama Server
```sh
ollama serve
```
Ollama will run on `http://localhost:11434`

### Step 4: Verify Installation
```sh
ollama list
```
You should see `qwen2.5` in the list.

---

## 👤 Adding Historical Leaders (Admin)

To add leaders that users can chat with:

1. Go to Django Admin: `http://localhost:8000/admin/`
2. Navigate to **Api** → **Leaders** → **Add Leader**
3. Fill in:
   - **Name**: Leader's name (e.g., "Albert Einstein")
   - **Description**: Brief description
   - **Image**: Upload a profile image
   - **PDF file**: Upload a PDF containing information about the leader
4. Click **Save**
5. The system will automatically process the PDF and create a knowledge base

---

## 📁 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | Django secret key | ✅ Yes |
| `DEBUG` | Debug mode (True/False) | ✅ Yes |
| `EMAIL_HOST_USER` | Gmail address for sending emails | ⚠️ For email features |
| `EMAIL_HOST_PASSWORD` | Gmail app password | ⚠️ For email features |

### Frontend (`frontend/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | ✅ Yes |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ Yes |

---

## 🔄 Running Both Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```sh
cd backend
env\Scripts\activate  # Windows
python manage.py runserver
```

**Terminal 2 - Frontend:**
```sh
cd frontend
yarn start
```

**Terminal 3 - Ollama (for AI chat):**
```sh
ollama serve
```

---

## 🐛 Troubleshooting

### Google Login Not Working
- ✅ Verify Client ID is correctly set in `frontend/.env`
- ✅ Check Social Application is configured in Django Admin
- ✅ Ensure Site is set to `localhost:8000` in Django Admin
- ✅ Verify authorized origins include `http://localhost:3000`

### CORS Errors
- Check `CORS_ALLOWED_ORIGINS` in `backend/backend_site/settings.py`
- Ensure backend is running on port 8000

### AI Chat Not Responding
- ✅ Verify Ollama is running: `ollama serve`
- ✅ Check model is installed: `ollama list`
- ✅ Ensure `qwen2.5` model is downloaded

### Email Verification Not Working
- Use Gmail App Password (not regular password)
- Enable 2FA on your Google account first
- Generate app password at: https://myaccount.google.com/apppasswords

### Database Errors
```sh
python manage.py makemigrations
python manage.py migrate
```

---

## 📚 Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- django-allauth (OAuth)
- dj-rest-auth (JWT Authentication)
- LangChain (AI orchestration)
- FAISS (Vector database)
- Ollama (Local LLM)

### Frontend
- React 18
- Redux (State management)
- React Router (Navigation)
- Axios (HTTP client)
- Framer Motion (Animations)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE)

---

## 👨‍💻 Author

**Pradish** - [GitHub](https://github.com/prad18)

---

*This project is under active development. Contributions are welcome!*
