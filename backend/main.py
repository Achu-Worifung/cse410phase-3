from fastapi import FastAPI, HTTPException, Header
import psycopg2 as pg
import bcrypt
import jwt 
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# run script: fastapi dev main.py
#aconfigure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "phase2" #change to your database name
DB_USER = "postgres"
DB_PASSWORD = "password"
DB_HOST = "localhost"
DB_PORT = 5432
JWT_SECRET = "my secret jwt key"
JWT_ALGORITHM = "HS256"

class userSignup(BaseModel):
    name: str
    phone: str
    addr: str | None = None
    username: str
    password: str

class userUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    addr: str | None = None
    username: str | None = None

class purchaseRequest(BaseModel):
    car_id: int
def get_db_connection():
    conn = pg.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    return conn
@app.get("/")
async def read_root():
    return {"message": "Hello World"}

# @app.get('/api/cars')
# async def get_cars():
#     conn = get_db_connection()
#     cur = conn.cursor()
#     query = """
#     SELECT "CAR_ID", "CAR NAME" AS NAME, "IMAGE", "PRICE($)" AS PRICE, "MILEAGE"
#     FROM CAR
#     WHERE "IS_AVAIL" = TRUE
#     LIMIT 250;
#     """
#     cur.execute(query)
#     rows = cur.fetchall()
#     conn.close()
#     return rows

@app.get('/api/car/{car_id}')
async def get_car_details(car_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
    SELECT * FROM CAR WHERE "CAR_ID" = %s;
    """
    params = (int(car_id),)
    cur.execute(query, params)
    row = cur.fetchone()
    conn.close()
    return row
#insert customer 
@app.post('/api/customer/')
async def insert_customer(user: userSignup):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if username already exists
        check_query = """
        SELECT username FROM customer WHERE username = %s;
        """
        cur.execute(check_query, (user.username,))
        existing_user = cur.fetchone()
        
        if existing_user:
            cur.close()
            conn.close()
            return {"message": "Username already exists", "error": True}
        
        # Generate salt and hash password for this specific user
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)
        # Convert bytes to string for PostgreSQL storage
        hashed_password_str = hashed_password.decode('utf-8')
        
        query = """
        INSERT INTO customer (full_name, phone_number, addr, username, pass_hash)
        VALUES (%s, %s, %s, %s, %s);
        """
        params = (user.name, user.phone, user.addr, user.username, hashed_password_str)
        cur.execute(query, params)
        conn.commit()
        cur.close()
        conn.close()
        
        payload = {
            "username": user.username,
            "exp": datetime.utcnow() + timedelta(hours=72)
        }
        encode_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return {"message": "Customer inserted successfully", "token": encode_token}
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return {"message": f"Error creating customer: {str(e)}", "error": True}



@app.get('/api/customer/{username}/{password}')
async def get_customer(username: str, password: str):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
        SELECT * FROM customer WHERE username = %s;
        """
        params = (username,)
        cur.execute(query, params)
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if row:
            # Check if password field exists (assuming password is stored as string)
            stored_password = row[5]  # Assuming PASSWORD is at index 5 (0-indexed)
            # Handle both bytes and string formats
            if isinstance(stored_password, bytes):
                password_to_check = stored_password
            elif isinstance(stored_password, str):
                password_to_check = stored_password.encode('utf-8')
            else:
                password_to_check = str(stored_password).encode('utf-8')
                
            if bcrypt.checkpw(password.encode('utf-8'), password_to_check):
                payload = {
                    "username": username,
                    "exp": datetime.utcnow() + timedelta(hours=72)
                }
                encode_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
                return {"message": "Login successful", "token": encode_token}
        
        return {"message": "Invalid username or password", "error": True}
    except Exception as e:
        if conn:
            conn.close()
        return {"message": f"Error during login: {str(e)}", "error": True}
#filtering route for car listings
@app.get("/api/cars")
async def filter_cars(
    limit: int = 20,
    offset: int = 0,
    query: str | None = None,
    make: str | None = None,
    model: str | None = None,
    year: int | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    min_mileage: int | None = None,
    max_mileage: int | None = None,
    sort: str | None = None
):
    conn = get_db_connection()
    cur = conn.cursor()

    sql = """
        SELECT 
            "CAR_ID", 
            "CAR NAME" AS name, 
            "IMAGE", 
            "PRICE($)" AS price, 
            "MILEAGE"
        FROM CAR
        WHERE "IS_AVAIL" = TRUE
    """

    params = []

    if query:
        sql += ' AND ("CAR NAME" ILIKE %s OR "MAKE" ILIKE %s OR "MODEL" ILIKE %s OR "YEAR"::text ILIKE %s) '
        params.append(f"%{query}%")
        params.append(f"%{query}%")
        params.append(f"%{query}%")
        params.append(f"%{query}%")

    if make:
        sql += ' AND "MAKE" = %s'
        params.append(make)

    if model:
        sql += ' AND "MODEL" = %s'
        params.append(model)

    if year:
        sql += ' AND "YEAR" = %s'
        params.append(year)

    if min_price:
        sql += ' AND "PRICE($)" >= %s'
        params.append(min_price)

    if max_price:
        sql += ' AND "PRICE($)" <= %s'
        params.append(max_price)

    if min_mileage:
        sql += ' AND "MILEAGE" >= %s'
        params.append(min_mileage)

    if max_mileage:
        sql += ' AND "MILEAGE" <= %s'
        params.append(max_mileage)

    # SAFE SORTING (prevent SQL injection)
    allowed_sorts = {
        "price_asc": ' "PRICE($)" ASC ',
        "price_desc": ' "PRICE($)" DESC ',
        "year_asc": ' "YEAR" ASC ',
        "year_desc": ' "YEAR" DESC ',
        "mileage_asc": ' "MILEAGE" ASC ',
        "mileage_desc": ' "MILEAGE" DESC ',
    }

    if sort in allowed_sorts:
        sql += f" ORDER BY {allowed_sorts[sort]}"
    else:
        sql += ' ORDER BY "CAR_ID" ASC '

    # Pagination
    sql += " LIMIT %s OFFSET %s"
    params.append(limit)
    params.append(offset)

    cur.execute(sql, params)
    rows = cur.fetchall()
    conn.close()

    return rows

# Helper function to decode JWT token
def decode_jwt_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Get user information from token
@app.get('/api/user/me')
async def get_user_info(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>" format
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    # Decode token to get username
    payload = decode_jwt_token(token)
    username = payload.get("username")
    
    if not username:
        raise HTTPException(status_code=401, detail="Username not found in token")
    
    # Get user information from database
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get user information along with purchase data
        query = """
        SELECT 
            c.full_name, 
            c.phone_number, 
            c.addr, 
            c.username,
            c.cust_id,
            COALESCE(json_agg(
                json_build_object(
                    'car_id', p.car_id,
                    'car_name', car."CAR NAME",
                    'car_price', car."PRICE($)",
                    'car_image', car."IMAGE"
                ) ORDER BY p.car_id
            ) FILTER (WHERE p.car_id IS NOT NULL), '[]'::json) as purchases
        FROM customer c
        LEFT JOIN purchase p ON c.cust_id = p.cust_id
        LEFT JOIN car ON p.car_id = car."CAR_ID"
        WHERE c.username = %s
        GROUP BY c.cust_id, c.full_name, c.phone_number, c.addr, c.username;
        """
        cur.execute(query, (username,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Return user information with purchases (excluding password)
        user_info = {
            "name": row[0],
            "phone": row[1],
            "addr": row[2],
            "username": row[3],
            "cust_id": row[4],
            "purchases": row[5]
        }
        
        return {"user": user_info, "message": "User information retrieved successfully"}
        
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=f"Error retrieving user information: {str(e)}")

# Update user information
@app.put('/api/user/me')
async def update_user_info(user_data: userUpdate, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>" format
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    # Decode token to get username
    payload = decode_jwt_token(token)
    current_username = payload.get("username")
    
    if not current_username:
        raise HTTPException(status_code=401, detail="Username not found in token")
    
    # Check if any data is provided for update
    update_data = user_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # If username is being updated, check if new username already exists
        if 'username' in update_data and update_data['username'] != current_username:
            check_query = "SELECT username FROM customer WHERE username = %s;"
            cur.execute(check_query, (update_data['username'],))
            existing_user = cur.fetchone()
            if existing_user:
                cur.close()
                conn.close()
                raise HTTPException(status_code=400, detail="Username already exists")
        
        # Build dynamic update query with proper column mapping
        set_clauses = []
        params = []
        
        # Map frontend field names to database column names
        field_mapping = {
            'name': 'full_name',
            'phone': 'phone_number',
            'addr': 'addr',
            'username': 'username'
        }
        
        for field, value in update_data.items():
            if value is not None:
                db_column = field_mapping.get(field, field)
                set_clauses.append(f"{db_column} = %s")
                params.append(value)
        
        if not set_clauses:
            raise HTTPException(status_code=400, detail="No valid data provided for update")
        
        # Add the current username for WHERE clause
        params.append(current_username)
        
        query = f"""
        UPDATE customer 
        SET {', '.join(set_clauses)}
        WHERE username = %s;
        """
        
        cur.execute(query, params)
        
        # Check if any row was updated
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        conn.commit()
        
        # Get updated user information
        select_query = """
        SELECT full_name, phone_number, addr, username FROM customer WHERE username = %s;
        """
        # Use the new username if it was updated, otherwise use current username
        lookup_username = update_data.get('username', current_username)
        cur.execute(select_query, (lookup_username,))
        row = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="Updated user not found")
        
        # Return updated user information
        updated_user = {
            "name": row[0],
            "phone": row[1], 
            "addr": row[2],
            "username": row[3]
        }
        
        # If username was changed, generate a new token
        new_token = None
        if 'username' in update_data:
            payload = {
                "username": updated_user["username"],
                "exp": datetime.utcnow() + timedelta(hours=72)
            }
            new_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        response = {
            "user": updated_user, 
            "message": "User information updated successfully"
        }
        
        if new_token:
            response["new_token"] = new_token
        
        return response
        
    except HTTPException:
        if conn:
            conn.rollback()
            conn.close()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        raise HTTPException(status_code=500, detail=f"Error updating user information: {str(e)}")

# Delete user account
@app.delete('/api/user/me')
async def delete_user_account(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>" format
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    # Decode token to get username
    payload = decode_jwt_token(token)
    username = payload.get("username")
    
    if not username:
        raise HTTPException(status_code=401, detail="Username not found in token")
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if user exists before deletion
        check_query = "SELECT username FROM customer WHERE username = %s;"
        cur.execute(check_query, (username,))
        user_exists = cur.fetchone()
        
        if not user_exists:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete the user account
        delete_query = "DELETE FROM customer WHERE username = %s;"
        cur.execute(delete_query, (username,))
        
        # Check if any row was deleted
        if cur.rowcount == 0:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "message": "Account deleted successfully",
            "username": username,
            "deleted_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        if conn:
            conn.rollback()
            conn.close()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        raise HTTPException(status_code=500, detail=f"Error deleting user account: {str(e)}")

# Create a new purchase
@app.post('/api/purchase')
async def create_purchase(purchase_data: purchaseRequest, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>" format
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    # Decode token to get username
    payload = decode_jwt_token(token)
    username = payload.get("username")
    
    if not username:
        raise HTTPException(status_code=401, detail="Username not found in token")
    
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get customer ID from username
        cust_query = "SELECT cust_id FROM customer WHERE username = %s;"
        cur.execute(cust_query, (username,))
        cust_row = cur.fetchone()
        
        if not cust_row:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Customer not found")
        
        cust_id = cust_row[0]
        
        # Check if car exists and is available
        car_query = """
        SELECT "CAR_ID", "CAR NAME", "PRICE($)", "IS_AVAIL" 
        FROM car WHERE "CAR_ID" = %s;
        """
        cur.execute(car_query, (purchase_data.car_id,))
        car_row = cur.fetchone()
        
        if not car_row:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Car not found")
        
        if not car_row[3]:  # IS_AVAIL column
            cur.close()
            conn.close()
            raise HTTPException(status_code=400, detail="Car is not available for purchase")
        
        # Check if car is already purchased (primary key constraint on car_id)
        existing_purchase_query = "SELECT car_id FROM purchase WHERE car_id = %s;"
        cur.execute(existing_purchase_query, (purchase_data.car_id,))
        existing_purchase = cur.fetchone()
        
        if existing_purchase:
            cur.close()
            conn.close()
            raise HTTPException(status_code=400, detail="Car has already been purchased")
        
        # Insert the purchase
        purchase_query = """
        INSERT INTO purchase (cust_id, car_id)
        VALUES (%s, %s);
        """
        cur.execute(purchase_query, (cust_id, purchase_data.car_id))
        
        # Update car availability
        update_car_query = """
        UPDATE car SET "IS_AVAIL" = FALSE WHERE "CAR_ID" = %s;
        """
        cur.execute(update_car_query, (purchase_data.car_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "message": "Purchase created successfully",
            "purchase": {
                "cust_id": cust_id,
                "car_id": purchase_data.car_id,
                "car_name": car_row[1],
                "car_price": car_row[2]
            },
            "purchased_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        if conn:
            conn.rollback()
            conn.close()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        raise HTTPException(status_code=500, detail=f"Error creating purchase: {str(e)}")
