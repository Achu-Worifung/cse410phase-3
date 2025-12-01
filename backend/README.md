# Car Dealership Backend API

A FastAPI-based backend service for a car dealership management system with user authentication, car listings, and purchase functionality.

## Features

- User authentication with JWT tokens
- Car listings with advanced filtering and search
- User registration and profile management
- Purchase management system
- PostgreSQL database integration
- CORS enabled for frontend integration

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: psycopg2 (PostgreSQL adapter)
- **Password Hashing**: bcrypt

## Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- pip (Python package manager)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd cse410phase-3/backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL Database**:
   - Create a database named `phase2` (or update `DB_NAME` in `main.py`)
   - Update database credentials in `main.py`:
     ```python
     DB_NAME = "phase2"
     DB_USER = "postgres"
     DB_PASSWORD = "password"
     DB_HOST = "localhost"
     DB_PORT = 5432
     ```

4. **Set up database schema**:
   Ensure your PostgreSQL database has the following tables:
   - `CAR` table with columns: `CAR_ID`, `CAR NAME`, `IMAGE`, `PRICE($)`, `MILEAGE`, `IS_AVAIL`
   - `CUSTOMER` table for user management
   - `PURCHASES` table for purchase records

## Running the Application

### Development Mode
```bash
fastapi dev main.py
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### SELECT Operations (Read/Retrieve Data)
- `GET /api/cars` - Get car listings with filtering options
  - Query parameters: `query`, `make`, `model`, `year`, `min_price`, `max_price`, `min_mileage`, `max_mileage`, `sort`, `offset`, `limit`
- `GET /api/car/{car_id}` - Get specific car details
- `GET /api/user/me` - Get current user info (requires JWT)
- `GET /api/customer/{username}/{password}` - User login/authentication

### INSERT Operations (Create New Records)
- `POST /api/customer/` - User registration (create new customer)
- `POST /api/purchase` - Create a new purchase record (requires JWT)

### UPDATE Operations (Modify Existing Records)
- `PUT /api/user/me` - Update user profile information (requires JWT)

### DELETE Operations (Remove Records)
- `DELETE /api/user/me` - Delete user account and associated data (requires JWT)

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

You can set the following environment variables (optional):
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `JWT_SECRET` - JWT secret key

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Adding New Endpoints

1. Define your endpoint function in `main.py`
2. Use appropriate decorators (`@app.get`, `@app.post`, etc.)
3. Add proper error handling and validation
4. Update this README if needed

### Database Connection

The `get_db_connection()` function handles database connections. Make sure to properly close connections after use.

## License

This project is part of CSE410 coursework.