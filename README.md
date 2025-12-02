# Car Dealership Management System

A full-stack car dealership management system with a modern Next.js frontend and FastAPI backend, featuring user authentication, advanced car browsing, and purchase management capabilities.

## Project Overview

This application provides a complete car dealership solution with:
- **Frontend**: Modern, responsive web interface built with Next.js and NextUI
- **Backend**: RESTful API service built with FastAPI and PostgreSQL
- **Authentication**: JWT-based secure user authentication
- **Real-time Features**: Client-side filtering and instant search results

## Key Features

### Frontend Features
- **Car Listings**: Browse cars with advanced filtering and search
- **Smart Filters**: Dropdowns populated with actual inventory data (make, model, year)
- **Responsive Design**: Mobile-first design with collapsible sidebar
- **User Authentication**: JWT-based login/signup system
- **Car Details**: Individual car detail pages with purchase functionality
- **Real-time Filtering**: Client-side filtering for instant results
- **User Profile Management**: View, edit, and delete user accounts
- **Purchase History**: Track and manage car purchases

### Backend Features
- **User Authentication**: JWT tokens with secure password hashing
- **Car Management**: Advanced filtering, search, and sorting capabilities
- **Purchase System**: Complete purchase workflow with inventory management
- **User Management**: Registration, profile updates, and account deletion
- **Database Integration**: PostgreSQL with proper transaction handling
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: NextUI v2
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Context API
- **Icons**: React Icons

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: psycopg2 (PostgreSQL adapter)
- **Password Hashing**: bcrypt
- **Documentation**: Swagger UI / ReDoc

## Prerequisites

- **Node.js** 18 or higher
- **Python** 3.8 or higher
- **PostgreSQL** database
- **npm/yarn** package manager
- **pip** (Python package manager)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Achu-Worifung/cse410phase-3.git
cd cse410phase-3
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Database
Update database credentials in `backend/main.py`:
```python
DB_NAME = "phase2"
DB_USER = "postgres"
DB_PASSWORD = "password"
DB_HOST = "localhost"
DB_PORT = 5432
```

#### Set Up Database Schema
Ensure your PostgreSQL database has these tables:
- `CAR` table: `CAR_ID`, `CAR NAME`, `IMAGE`, `PRICE($)`, `MILEAGE`, `IS_AVAIL`
- `CUSTOMER` table: User management
- `PURCHASE` table: Purchase records

#### Run Backend Server
```bash
# Development mode
fastapi dev main.py

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```
Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
# or
yarn install
```

#### Run Frontend Server
```bash
# Development mode
npm run dev
# or
yarn dev

# Production build
npm run build && npm run start
```
Frontend will be available at: `http://localhost:3000`

## Project Structure

```
cse410phase-3/
├── backend/                    # FastAPI backend
│   ├── main.py                # Main application file
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Backend documentation
│
├── frontend/                  # Next.js frontend
│   ├── app/                  # Next.js App Router pages
│   │   ├── about/           # About page
│   │   ├── blog/            # Blog page
│   │   ├── car/[id]/        # Dynamic car detail pages
│   │   ├── pricing/         # Pricing page
│   │   ├── profile/         # User profile page
│   │   ├── signin/          # Sign in page
│   │   ├── signup/          # Sign up page
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page (car listings)
│   ├── components/          # Reusable components
│   │   ├── navbar.tsx       # Navigation bar
│   │   ├── counter.tsx      # Counter component
│   │   ├── icons.tsx        # Icon components
│   │   ├── primitives.ts    # UI primitives
│   │   └── theme-switch.tsx # Dark/light mode toggle
│   ├── context/             # React Context providers
│   │   ├── InputContext.tsx # Search input context
│   │   └── TokenContext.tsx # Authentication context
│   ├── config/              # Configuration files
│   ├── public/              # Static assets
│   ├── styles/              # Global styles
│   ├── types/               # TypeScript definitions
│   └── package.json         # Frontend dependencies
│
└── README.md                 # This file
```

## API Endpoints

### Authentication & User Management
- `POST /api/customer/` - User registration
- `GET /api/customer/{username}/{password}` - User login
- `GET /api/user/me` - Get current user info (JWT required)
- `PUT /api/user/me` - Update user profile (JWT required)
- `DELETE /api/user/me` - Delete user account (JWT required)

### Car Listings
- `GET /api/cars` - Get car listings with filtering
  - Query parameters: `query`, `make`, `model`, `year`, `min_price`, `max_price`, `min_mileage`, `max_mileage`, `sort`, `offset`, `limit`
- `GET /api/car/{car_id}` - Get specific car details

### Purchases
- `POST /api/purchase` - Create a new purchase (JWT required)
- `DELETE /api/purchase/{car_id}` - Cancel purchase (JWT required)

### API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Authentication

The system uses JWT tokens for authentication. Include tokens in requests:
```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

### Backend (optional)
```env
DB_NAME=phase2
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key
```

### Frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🛠 Development

### Available Scripts

#### Backend
```bash
fastapi dev main.py          # Development server
uvicorn main:app --reload    # Alternative dev server
```

#### Frontend
```bash
npm run dev                  # Development server
npm run build               # Production build
npm run start               # Production server
npm run lint                # ESLint
npm run lint:fix            # Fix ESLint errors
```

### Adding Features

1. **Backend**: Add new endpoints in `main.py` with proper error handling
2. **Frontend**: Create new components in `components/` or pages in `app/`
3. **Database**: Update schema and connection handling as needed
4. **Authentication**: Use existing JWT middleware for protected routes

## UI/UX Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar for filters
- Touch-friendly interactions
- Responsive grid layouts

### Advanced Filtering
- Smart dropdowns with actual inventory data
- Real-time client-side filtering
- Price and mileage range filters
- Multiple sorting options

### User Experience
- Loading states and error handling
- Confirmation modals for critical actions
- Success/error feedback
- Intuitive navigation

## Troubleshooting

### Common Issues

1. **Backend Connection**
   - Ensure PostgreSQL is running
   - Check database credentials
   - Verify port 8000 is available

2. **Frontend Issues**
   - Ensure backend is running on port 8000
   - Check CORS configuration
   - Clear browser cache for styling issues

3. **Authentication Problems**
   - Check JWT token expiration
   - Verify authorization headers
   - Ensure proper token storage

### Database Setup
Make sure your PostgreSQL database has the required tables with proper column names and data types as expected by the API.


## License

This project is part of CSE412 coursework.

## Deployment Notes


### Security Best Practices
- Use strong JWT secrets
- Implement proper CORS policies
- Validate all user inputs
- Use HTTPS in production
- Regular security audits
