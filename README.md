# SilAI - Converse with History

SilAI is an innovative web application that brings historical figures to life through AI-powered conversations. Built with a modern React frontend and Django REST API backend, SilAI allows users to engage with the minds that shaped civilizations, learning from their experiences and gaining insights that shaped our world.

**"History lives in stories and stories are meant to be heard."** - SilAI Team

---

## 🌟 Features

- **Interactive Historical Conversations**: Chat with AI representations of historical leaders and figures
- **Modern 3D Interface**: Immersive landing page with smooth animations and 3D effects
- **User Authentication**: Secure registration and login system with JWT tokens
- **Leader Profiles**: Comprehensive database of historical figures with detailed information
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time AI Processing**: Advanced natural language processing for authentic conversations

---

## 🏗️ Project Structure

```
SilAi/
├── backend/           # Django REST API Backend
│   ├── accounts/      # User authentication & management
│   ├── api/           # Core API endpoints
│   ├── backend_site/  # Django project settings
│   ├── media/         # Uploaded files (leader images, documents)
│   ├── manage.py      # Django management script
│   └── requirements.txt
├── frontend/          # React Frontend Application
│   ├── public/        # Static assets
│   ├── src/
│   │   ├── Component/ # Reusable React components
│   │   ├── Pages/     # Main page components
│   │   ├── css/       # Styling and animations
│   │   ├── hocs/      # Higher-order components
│   │   ├── reducer/   # Redux state management
│   │   └── utils/     # Utility functions
│   ├── package.json   # Node.js dependencies
│   └── build/         # Production build files
├── env/               # Python virtual environment
├── PDF/               # Historical documents and resources
└── README.md
```

---

## 🛠️ Technology Stack

### Backend
- **Django 4.2.4** - Web framework
- **Django REST Framework** - API development
- **JWT Authentication** - Secure token-based auth
- **SQLite/PostgreSQL** - Database
- **Python 3.8+** - Programming language

### Frontend  
- **React 18.2.0** - UI framework
- **Framer Motion 12.23.12** - 3D animations and interactions
- **Redux** - State management
- **React Router** - Navigation
- **Modern CSS** - 3D transforms and responsive design

### AI & Processing
- **Transformers** - Natural language processing
- **Sentence Transformers** - Text embeddings
- **LangChain** - AI conversation framework
- **FAISS** - Vector similarity search
- **PyTorch** - Machine learning backend

---

## 📋 Prerequisites

- **Python 3.8+** and [pip](https://pip.pypa.io/en/stable/)
- **Node.js 14+** and [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- **Git** for version control
- (Optional) **virtualenv** for Python environment isolation

---

## ⚡ Quick Start (Minimal Setup)

**Want to run SilAI immediately without all the API keys? Follow this minimal setup:**

### Backend (2 minutes)
```bash
cd backend
python -m venv env
env\Scripts\activate  # Windows
# source env/bin/activate  # macOS/Linux
pip install -r requirements.txt
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Create `.env` file with just the secret key:
```env
SECRET_KEY=your_generated_secret_key_here
DEBUG=True
```

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (1 minute)
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENABLE_GOOGLE_AUTH=false
```

```bash
npm start
```

**🎉 Done!** Visit `http://localhost:3000` to see SilAI running. You can register users with any email (no verification needed in development mode).

---

## 🚀 Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # Create virtual environment
   python -m venv env
   
   # Activate (Windows)
   env\Scripts\activate
   
   # Activate (macOS/Linux)  
   source env/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   **📦 Note**: The requirements.txt includes all necessary dependencies for development and production. Optional packages like development tools (pytest, django-debug-toolbar) can be skipped in production if desired.

4. **Environment Configuration:**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   # Django Configuration
   SECRET_KEY=your_super_secret_django_key_here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   # Email Configuration (for user registration)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_app_password

   # Database (optional - defaults to SQLite)
   # DATABASE_URL=postgresql://user:password@localhost:5432/silai_db

   # AI Configuration
   # OPENAI_API_KEY=your_openai_api_key
   # HUGGINGFACE_API_KEY=your_huggingface_token
   ```

   **Generate Django Secret Key:**
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

---

## 🔑 API Keys Setup Guide

### 1. Gmail App Password (for Email Features)

**Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the setup process to enable 2FA

**Step 2: Generate App Password**
1. Still in "Security" settings, click "App passwords"
2. Select "Mail" from the dropdown
3. Choose "Other (Custom name)" and enter "SilAI Django"
4. Click "Generate"
5. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
6. Use this password in your `.env` file as `EMAIL_HOST_PASSWORD`

```env
EMAIL_HOST_USER=your.email@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
```

### 2. OpenAI API Key (for Advanced AI Features)

**Step 1: Create OpenAI Account**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Click "Sign up" or use "Continue with Google"
3. Verify your email address
4. Complete phone verification

**Step 2: Generate API Key**
1. Go to [API Keys page](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name like "SilAI Development"
4. Copy the key immediately (starts with `sk-`)
5. Store securely - you won't see it again!

**Step 3: Add Billing (Required for Usage)**
1. Go to [Billing Settings](https://platform.openai.com/account/billing)
2. Click "Add payment method"
3. Add a credit card (minimum $5 credit recommended)

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Hugging Face API Token (for Open Source AI Models)

**Step 1: Create Hugging Face Account**
1. Visit [Hugging Face](https://huggingface.co/)
2. Click "Sign Up" in the top right
3. Create account or use Google/GitHub login
4. Verify your email address

**Step 2: Generate Access Token**
1. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Name: `SilAI Development`
4. Type: Select "Read" (sufficient for most use cases)
5. Click "Generate a token"
6. Copy the token (starts with `hf_`)

```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Google OAuth Client ID (for Social Login)

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `SilAI` 
4. Click "Create"

**Step 2: Enable Google+ API**
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

**Step 3: Configure OAuth Consent Screen**
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: `SilAI`
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. Skip "Scopes" and "Test users" sections

**Step 4: Create OAuth Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: `SilAI Frontend`
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   ```
7. Click "Create"
8. Copy the "Client ID" (ends with `.googleusercontent.com`)

```env
# Frontend .env file
REACT_APP_GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

### 5. PostgreSQL Database (Optional - Production)

**Step 1: Install PostgreSQL**
- **Windows**: Download from [PostgreSQL.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

**Step 2: Create Database**
```bash
# Start PostgreSQL service
sudo service postgresql start

# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE silai_db;
CREATE USER silai_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE silai_db TO silai_user;
\q
```

**Step 3: Configure Connection**
```env
DATABASE_URL=postgresql://silai_user:your_secure_password@localhost:5432/silai_db
```

### Alternative: Use Supabase (Free PostgreSQL Cloud)

**Step 1: Create Supabase Account**
1. Go to [Supabase](https://supabase.com/)
2. Click "Start your project"
3. Sign up with GitHub/Google

**Step 2: Create Project**
1. Click "New project"
2. Name: `SilAI`
3. Database Password: Generate strong password
4. Region: Choose closest to you
5. Click "Create new project"

**Step 3: Get Connection String**
1. Go to "Settings" → "Database"
2. Find "Connection string" → "URI"
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## 🛠️ Complete Setup Checklist

### Backend Setup Verification
- [ ] Django secret key generated
- [ ] Gmail app password configured
- [ ] OpenAI API key added (optional)
- [ ] Hugging Face token added (optional)
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Backend server running on port 8000

### Frontend Setup Verification  
- [ ] Node.js dependencies installed
- [ ] Google OAuth client ID configured (optional)
- [ ] API URL pointing to backend
- [ ] Frontend server running on port 3000
- [ ] Can access landing page with 3D animations

### Testing Your Setup
1. **Backend API Test:**
   ```bash
   curl http://localhost:8000/api/leaders/
   ```

2. **Frontend Connection Test:**
   - Open http://localhost:3000
   - Check browser console for errors
   - Try registering a new user

3. **Email Test:**
   - Register with a valid email
   - Check if verification email arrives

---

## 💡 Free Tier Limitations & Alternatives

### OpenAI API (Paid Service)
- **Cost**: ~$0.002 per 1K tokens
- **Free Alternative**: Use Hugging Face transformers (local processing)
- **Development**: Start with local models, upgrade for production

### Hugging Face (Free Tier Available)
- **Free**: 30,000 characters/month for Inference API
- **Unlimited**: Use local model downloads (requires more RAM/storage)

### Google OAuth (Free)
- **Limitation**: 100 users max in testing mode
- **Production**: Requires app verification for 100+ users

### Email Service Alternatives
- **Gmail**: Free with app passwords
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free

5. **Database Setup:**
   ```bash
   # Create database tables
   python manage.py makemigrations
   python manage.py migrate
   
   # Create admin user
   python manage.py createsuperuser
   ```

6. **Load Sample Data (Optional):**
   ```bash
   # Load historical leaders data
   python manage.py loaddata fixtures/leaders.json
   ```

7. **Start Development Server:**
   ```bash
   python manage.py runserver
   ```
   🌐 Backend API: `http://localhost:8000/`
   📊 Admin Panel: `http://localhost:8000/admin/`

---

## 💻 Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   # Using npm
   npm install
   
   # Using yarn (recommended)
   yarn install
   ```

3. **Environment Configuration:**
   
   Create a `.env` file in the `frontend/` directory:
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:8000
   
   # Google OAuth (for social login) - Optional
   REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   
   # App Configuration
   REACT_APP_APP_NAME=SilAI
   REACT_APP_VERSION=1.0.0
   
   # Feature Flags
   REACT_APP_ENABLE_3D_ANIMATIONS=true
   REACT_APP_ENABLE_GOOGLE_AUTH=true
   ```

   **📝 Note**: The `REACT_APP_GOOGLE_CLIENT_ID` is optional. If you skip Google OAuth setup, users can still register/login with email and password. Set `REACT_APP_ENABLE_GOOGLE_AUTH=false` to disable the Google login button.

4. **Start Development Server:**
   ```bash
   # Using npm
   npm start
   
   # Using yarn
   yarn start
   ```
   🌐 Frontend App: `http://localhost:3000/`

5. **Additional Scripts:**
   ```bash
   # Run tests
   yarn test
   
   # Build for production
   yarn build
   
   # Serve production build locally
   npx serve -s build
   ```

---

## 🔗 API Endpoints

### Authentication
- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `POST /auth/token/refresh/` - Refresh JWT token

### Leaders & Conversations
- `GET /api/leaders/` - List all historical leaders
- `GET /api/leaders/{id}/` - Get leader details
- `POST /api/conversations/` - Start new conversation
- `GET /api/conversations/{id}/messages/` - Get conversation history
- `POST /api/conversations/{id}/messages/` - Send message

### User Management
- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update user profile
- `GET /api/conversations/` - User's conversation history

---

## 🌐 Deployment

### Production Build
```bash
# Frontend production build
cd frontend
yarn build

# Backend production setup
cd backend
pip install gunicorn
python manage.py collectstatic
```

### Environment Variables for Production
```env
# Backend (.env)
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your_production_secret_key

# Frontend (.env.production)
REACT_APP_API_URL=https://api.your-domain.com
```

---

## 🔧 Development & Contributing

### Project Architecture
```
Frontend (React) ←→ Backend API (Django) ←→ AI Models ←→ Vector Database
     ↓                      ↓                    ↓              ↓
  User Interface      Authentication      Text Processing   Knowledge Base
  3D Animations       JWT Tokens          Embeddings        Historical Data
  State Management    CORS Headers        Conversations     Search & Retrieval
```

### Key Components
- **LandingPage.jsx**: Main landing page with 3D animations
- **AuthSystem**: JWT-based authentication flow
- **ConversationEngine**: AI-powered chat interface
- **LeaderProfiles**: Historical figure database
- **VectorSearch**: Semantic search for relevant responses

### Development Guidelines
1. Follow React/Django best practices
2. Maintain responsive design principles
3. Write comprehensive tests
4. Document API changes
5. Use meaningful commit messages

---

## 🚨 Troubleshooting

### Common Issues

**Frontend won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Backend migration errors:**
```bash
# Reset migrations (development only)
python manage.py makemigrations --empty api
python manage.py migrate --fake
```

**CORS errors:**
- Check `CORS_ALLOWED_ORIGINS` in Django settings
- Verify `REACT_APP_API_URL` in frontend `.env`

**AI model issues:**
- Ensure sufficient disk space for model downloads
- Check GPU/CPU compatibility for PyTorch

## 🚨 Troubleshooting

### Common Issues

**Frontend won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Backend migration errors:**
```bash
# Reset migrations (development only)
python manage.py makemigrations --empty api
python manage.py migrate --fake
```

**CORS errors:**
- Check `CORS_ALLOWED_ORIGINS` in Django settings
- Verify `REACT_APP_API_URL` in frontend `.env`

**AI model issues:**
- Ensure sufficient disk space for model downloads
- Check GPU/CPU compatibility for PyTorch

### API Key Issues

**Gmail Authentication Errors:**
```
SMTPAuthenticationError: Username and Password not accepted
```
- **Solution**: Ensure 2FA is enabled and you're using App Password, not regular password
- **Check**: App password should be 16 characters with spaces
- **Test**: Try sending email manually from Django shell

**OpenAI API Errors:**
```
openai.error.AuthenticationError: Invalid API key
```
- **Solution**: Regenerate API key from OpenAI dashboard
- **Check**: Key should start with `sk-` and be 51 characters long
- **Billing**: Ensure you have credits in your OpenAI account

**Google OAuth Errors:**
```
Error 400: redirect_uri_mismatch
```
- **Solution**: Add `http://localhost:3000/auth/callback` to authorized redirect URIs
- **Check**: Ensure no trailing slashes in redirect URI
- **Development**: Use exact localhost URLs, not 127.0.0.1

**Hugging Face Token Issues:**
```
HTTPError: 401 Client Error: Unauthorized
```
- **Solution**: Regenerate token with correct permissions
- **Check**: Token should start with `hf_`
- **Permissions**: Ensure token has "Read" access

**Database Connection Errors:**
```
django.db.utils.OperationalError: could not connect to server
```
- **SQLite**: Check file permissions in database directory
- **PostgreSQL**: Verify connection string and database exists
- **Supabase**: Check if project is paused (free tier limitation)

### Environment Variable Debug

**Check if variables are loaded:**
```python
# In Django shell (python manage.py shell)
import os
print("SECRET_KEY:", os.getenv('SECRET_KEY')[:10] + "...")
print("EMAIL_HOST_USER:", os.getenv('EMAIL_HOST_USER'))
print("DATABASE_URL:", os.getenv('DATABASE_URL'))
```

**Check React environment variables:**
```javascript
// In browser console
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Google Auth:', process.env.REACT_APP_ENABLE_GOOGLE_AUTH);
```

### Performance Optimization
- Enable Django database query optimization
- Use React.memo for expensive components
- Implement lazy loading for 3D animations
- Configure CDN for static assets

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support & Contact

- **Project Issues**: [GitHub Issues](https://github.com/prad18/SilAi/issues)
- **Documentation**: [Wiki](https://github.com/prad18/SilAi/wiki)
- **Developer**: [@prad18](https://github.com/prad18)

---

*"SilAI brings the past to life through the fusion of History and AI."*

**Built with ❤️ for history enthusiasts and AI pioneers**
