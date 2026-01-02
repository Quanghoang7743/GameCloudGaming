# Backend Python API

FastAPI backend for Game Cloud Gaming platform with JWT authentication.

## 🚀 Quick Start

### Start Server
```bash
./start-backend-python.sh
```

### Stop Server
```bash
./stop-backend-python.sh
```

## 📚 API Documentation

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🔐 Authentication

### Login
```bash
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=yourpassword"
```

Response:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

### Use Token
```bash
TOKEN="your_access_token_here"

curl -X GET "http://localhost:8001/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 API Endpoints

### Authentication
- `POST /auth/login` - Login with credentials
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/` - List all users
- `GET /users/{id}` - Get user by ID
- `POST /users/` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Machines
- `GET /machines/` - List all machines
- `GET /machines/{id}` - Get machine by ID
- `POST /machines/` - Create new machine
- `PUT /machines/{id}` - Update machine
- `DELETE /machines/{id}` - Delete machine

## ⚙️ Configuration

Create a `.env` file in the `backend-python` directory:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/gamecloud
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🛠️ Development

### Install Dependencies
```bash
cd backend-python
source venv/bin/activate
pip install -r requirements.txt
```

### Run Server Manually
```bash
cd backend-python
./venv/bin/uvicorn apps.main:app --reload --host 0.0.0.0 --port 8001
```

## 📦 Project Structure

```
backend-python/
├── apps/
│   ├── config/         # Database configuration
│   ├── lib/            # Utilities (JWT, security)
│   ├── models/         # SQLAlchemy models
│   ├── routes/         # API endpoints
│   ├── schemas/        # Pydantic schemas
│   └── main.py         # FastAPI app
├── venv/               # Virtual environment
└── requirements.txt    # Dependencies
```

## 🔒 JWT Authentication

Tokens expire after 30 minutes by default. Use the `/auth/refresh` endpoint to get a new token.

### Swagger UI Authorization

1. Go to http://localhost:8001/docs
2. Click the "Authorize" button
3. Login via `/auth/login` to get a token
4. Enter the token in the format: `Bearer your_token_here`
5. Click "Authorize"
6. You can now test protected endpoints

## 📝 Example: Create User and Login

```bash
# 1. Create a new user
curl -X POST "http://localhost:8001/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123"
  }'

# 2. Login
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123"

# 3. Use the token from step 2
TOKEN="<paste_token_here>"

# 4. Get current user info
curl -X GET "http://localhost:8001/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```
