# SilAi

SilAi is a web application featuring a React frontend and a Django REST API backend. It provides authentication, leader profiles, and other features leveraging modern web technologies.

---

## Project Structure

```
SilAi/
├── backend/    # Django backend (API, authentication, etc.)
│   ├── api/
│   ├── accounts/
│   ├── backend_site/
│   └── ...
└── frontend/   # React frontend (UI)
    ├── public/
    └── src/
```

---

## Prerequisites

- **Python 3.8+** and [pip](https://pip.pypa.io/en/stable/)
- **Node.js** (v14 or higher) and [Yarn](https://yarnpkg.com/)
- **Django** and **Django REST Framework**
- (Optional) **virtualenv** for Python

---

## Backend Setup (Django)

1. **Create and activate a virtual environment:**
   ```sh
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**

   In the `backend/` directory, create a `.env` file with the following contents (edit as needed):

   ```env
   SECRET_KEY=your_django_secret_key
   DEBUG=True

   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_email_password

   # (Optional) Database configuration for PostgreSQL or other DBs
   # DB_NAME=your_db_name
   # DB_USER=your_db_user
   # DB_PASSWORD=your_db_password
   # DB_HOST=localhost
   # DB_PORT=5432

   # (Optional) Allowed hosts, comma-separated
   # ALLOWED_HOSTS=localhost,127.0.0.1
   ```

   **How to generate a Django secret key:**  
   Run this command and paste the output as your `SECRET_KEY`:
   ```sh
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

4. **Apply database migrations:**
   ```sh
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (admin):**
   ```sh
   python manage.py createsuperuser
   ```

6. **Run the backend server:**
   ```sh
   python manage.py runserver
   ```
   The API will be available at `http://localhost:8000/`.

---

## Frontend Setup (React)

1. **Install frontend dependencies:**
   ```sh
   cd frontend
   yarn install
   ```

2. **Configure environment variables:**

   In the `frontend/` directory, create a `.env` file to specify your backend API URL, Google OAuth client ID, and any other environment-specific variables your app needs.  
   For example:
   ```env
   REACT_APP_API_URL=http://localhost:8000/
   REACT_APP_CLIENT_ID=your-google-oauth-client-id
   ```
   > **Usage:**  
   - In your React code, reference these as `process.env.REACT_APP_API_URL` and `process.env.REACT_APP_CLIENT_ID`.
   - All variables must be prefixed with `REACT_APP_` to be recognized by Create React App.
   - `REACT_APP_CLIENT_ID` is required for Google OAuth functionality—use your Google Cloud Console OAuth Client ID.

3. **Start the development server:**
   ```sh
   yarn start
   ```
   The frontend will be available at [http://localhost:3000](http://localhost:3000).

4. **Other available scripts:**
   - `yarn test` - Launches the test runner
   - `yarn build` - Builds the app for production
   - `yarn eject` - Ejects the Create-React-App config (irreversible)

---

## Connecting Frontend & Backend

- Ensure the backend (Django) is running on `localhost:8000` and the frontend (React) on `localhost:3000`.
- In your frontend `.env`, set `REACT_APP_API_URL` to match your backend address and `REACT_APP_CLIENT_ID` for Google OAuth.
- CORS is configured in Django to allow requests from the frontend.

---

## Additional Notes

- The backend uses JWT authentication (via `dj-rest-auth`).
- Email features use SMTP (Gmail).
- The frontend uses React Router for navigation and Redux for state management.
- For deployment, see [Create React App deployment docs](https://facebook.github.io/create-react-app/docs/deployment).

---

## Troubleshooting

- If `yarn build` fails to minify, see [CRA troubleshooting](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify).
- For CORS issues, check `CORS_ALLOWED_ORIGINS` in `backend/backend_site/settings.py`.
- For environment variable errors, ensure `.env` files are complete and correct in both `backend/` and `frontend/` directories.

---

## License

[MIT](LICENSE) (if applicable)

---

*This project is a work in progress.*
