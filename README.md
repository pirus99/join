[![Build and deploy](https://github.com/pirus99/join/actions/workflows/main.yml/badge.svg)](https://github.com/pirus99/join/actions/workflows/main.yml)

# Join - Task Management Application

A modern task management application built with Angular frontend and Django REST Framework backend.

## 🏗️ Architecture

- **Frontend**: Angular 19.2.x (TypeScript, Angular Material, Angular CDK)
- **Backend**: Django 5.2.x with Django REST Framework 3.16.x
- **API**: RESTful API for authentication, tasks, and contacts management

## 🚀 Deployment Options

### Production Deployment with Docker 🐳

For production deployment with Docker and Traefik reverse proxy with **HTTPS support** (self-signed or Let's Encrypt):

**📖 Documentation:**
- [Quick Reference Guide](./DOCKER_QUICK_REFERENCE.md) - Commands and common operations
- [Full Deployment Guide](./DOCKER_DEPLOYMENT.md) - Complete setup and configuration

**🚀 Quick start with HTTPS:**
```bash
cp .env.example .env
# Edit .env with your configuration

# Generate self-signed certificate for HTTPS
./generate-self-signed-cert.sh

# Deploy with HTTPS enabled
docker compose up -d --build

# Or use the helper script
./deploy.sh
```

Access your application at **https://localhost** (accepts self-signed certificate warning)

### Development Setup 💻

For local development without Docker, follow the instructions below.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.x or higher) and **npm** (v9.x or higher)
- **Python** (v3.10 or higher)
- **pip** (Python package manager)
- **Git**

### Check Your Installations

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
python3 --version  # Should be v3.10 or higher
pip3 --version
```

## 🚀 Setting Up the Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/pirus99/join.git
cd join
```

### 2. Backend Setup (Django REST Framework)

#### Navigate to Backend Directory

```bash
cd backend
```

#### Create a Virtual Environment

```bash
# On Linux/macOS
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

The backend uses the following key packages:
- Django 5.2.8
- djangorestframework 3.16.1
- django-cors-headers 4.9.0

#### Run Database Migrations

```bash
python manage.py migrate
```

#### Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account for accessing the Django admin panel.

#### Start the Django Development Server

```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/`

**Important API Endpoints:**
- Authentication: `http://localhost:8000/api/v1/auth/`
- Tasks: `http://localhost:8000/api/v1/task/`
- Contacts: `http://localhost:8000/api/v1/contact/`

### 3. Frontend Setup (Angular)

Open a new terminal window/tab (keep the backend server running).

#### Navigate to Frontend Directory

```bash
cd frontend
```

#### Install Node Dependencies

```bash
npm install
```

This will install all required Angular packages including:
- Angular Core & Common modules
- Angular Material & CDK
- RxJS
- And other dependencies

#### Start the Angular Development Server

```bash
npm start
# or
ng serve
```

The frontend application will be available at `http://localhost:4200/`

The app will automatically reload when you make changes to the source files.

## 🔧 Development Workflow

### Running Both Servers Simultaneously

For full-stack development, you need both servers running:

1. **Terminal 1** - Backend:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python manage.py runserver
   ```

2. **Terminal 2** - Frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:4200/`

### Building the Frontend

#### Development Build

```bash
cd frontend
npm run build -- --configuration development
```

#### Production Build

```bash
cd frontend
npm run build
```

Build artifacts will be stored in the `frontend/dist/` directory.

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📁 Project Structure

```
join/
├── backend/                    # Django REST Framework backend
│   ├── core/                  # Django project settings
│   ├── contacts_app/          # Contacts management app
│   ├── tasks_app/             # Tasks management app
│   ├── user_auth_app/         # User authentication app
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/     # Feature modules (pages)
│   │   │   ├── shared/       # Shared components & services
│   │   │   └── ...
│   │   └── ...
│   ├── package.json           # Node dependencies
│   └── angular.json           # Angular configuration
│
└── README.md                   # This file
```

## 🛠️ Angular CLI Commands

### Code Scaffolding

Generate a new component:
```bash
ng generate component component-name
```

For a complete list of available schematics:
```bash
ng generate --help
```

### Running End-to-End Tests

```bash
ng e2e
```

Note: Angular CLI does not include an e2e testing framework by default. You can choose one that suits your needs.

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Overview](https://angular.dev/tools/cli)
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

## 🐛 Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

**Backend (port 8000):**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9  # On Linux/macOS
# On Windows, use Task Manager or:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (port 4200):**
```bash
# The Angular dev server will automatically try port 4201 if 4200 is busy
# Or you can specify a different port:
ng serve --port 4201
```

### Python Virtual Environment Issues

If you have issues with the virtual environment:
```bash
# Deactivate current environment
deactivate

# Remove the old virtual environment
rm -rf venv

# Create a new one
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node Modules Issues

If you encounter frontend dependency issues:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

This project is for educational purposes.
