from fastapi import FastAPI
import psycopg2 as pg
import bcrypt
import jwt 
from datetime import datetime, timedelta

app = FastAPI()

DB_NAME = "cse412" #change to your database name
DB_USER = "postgres"
DB_PASSWORD = "password"
DB_HOST = "localhost"
DB_PORT = 5432
JWT_SECRET = "my secret jwt key"
JWT_ALGORITHM = "HS256"

salt = bcrypt.gensalt()

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

@app.get('/api/cars')
async def get_cars():
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
    SELECT "CAR_ID", "CAR NAME" AS NAME, "IMAGE", "PRICE($)" AS PRICE, "MILEAGE"
    FROM CAR
    WHERE "IS_AVAIL" = TRUE
    LIMIT 250;
    """
    cur.execute(query)
    rows = cur.fetchall()
    conn.close()
    return rows

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
@app.post('api/customer/{name}/{phone}/{addr}/{username}/{password}')
async def insert_customer(name: str, phone: str, addr: str, username: str, password: str):
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
    INSERT INTO CUSTOMER ("NAME", "PHONE", "ADDR", "USERNAME", "PASSWORD")
    VALUES (%s, %s, %s, %s, %s);
    """
    params = (name, phone, addr, username, bcrypt.hashpw(password.encode('utf-8'), salt))
    cur.execute(query, params)
    conn.commit()
    conn.close()
    payload = {
        "username": username,
        "exp": datetime.utcnow() + timedelta(hours=72)
    }
    encode_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"message": "Customer inserted successfully", "token": encode_token}

@app.get('/api/customer/{username}/{password}')
async def get_customer(username: str, password: str):
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
    SELECT * FROM CUSTOMER WHERE "USERNAME" = %s;
    """
    params = (username,)
    cur.execute(query, params)
    row = cur.fetchone()
    conn.close()
    if row and bcrypt.checkpw(password.encode('utf-8'), row[5].encode('utf-8')):
        payload = {
            "username": username,
            "exp": datetime.utcnow() + timedelta(hours=72)
        }
        encode_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return {"message": "Login successful", "token": encode_token}
    else:
        return {"message": "Invalid username or password"}
#filtering route for car listings
@app.get('/api/cars/{limit}/{offset}/{query}/{make}/{model}/{year}/{min_price}/{max_price}/{sort}')
async def filter_cars(limit: int, offset: int, query: str, make: str, model: str, year: int, min_price: int, max_price: int, sort: str):
    conn = get_db_connection()
    cur = conn.cursor()
    query = f"""
    SELECT * FROM CAR WHERE 1 = 1
    """
    params = []
    if make:
        query += """ AND "MAKE" = %s"""
        params.append(make)
    if model:
        query += """ AND "MODEL" = %s"""
        params.append(model)
    if year:
        query += """ AND "YEAR" = %s"""
        params.append(year)
    if min_price:
        query += """ AND "PRICE($)" >= %s"""
        params.append(min_price)
    if max_price:
        query += """ AND "PRICE($)" <= %s"""
        params.append(max_price)
    if sort:
        query += f" ORDER BY {sort}"
        params.append(sort)
    if limit:
        query += " LIMIT %s"
        params.append(limit)
    if offset:
        query += " OFFSET %s"
        params.append(offset)
    
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    print(f'here are the rows: {rows}')
    return rows
