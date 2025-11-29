from fastapi import FastAPI
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

DB_NAME = "cse412" #change to your database name
DB_USER = "postgres"
DB_PASSWORD = "password"
DB_HOST = "localhost"
DB_PORT = 5432
JWT_SECRET = "my secret jwt key"
JWT_ALGORITHM = "HS256"

salt = bcrypt.gensalt()
class userSignup(BaseModel):
    name: str
    phone: str
    addr: str | None = None
    username: str
    password: str
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
@app.post('api/customer/')
async def insert_customer(user: userSignup):
    conn = get_db_connection()
    cur = conn.cursor()
    query = """
    INSERT INTO CUSTOMER ("NAME", "PHONE", "ADDR", "USERNAME", "PASSWORD")
    VALUES (%s, %s, %s, %s, %s);
    """
    params = (user.name, user.phone, user.addr, user.username, bcrypt.hashpw(user.password.encode('utf-8'), salt))
    cur.execute(query, params)
    conn.commit()
    conn.close()
    payload = {
        "username": user.username,
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
        WHERE 1 = 1
    """

    params = []

    if query:
        sql += ' AND "CAR NAME" ILIKE %s OR "MAKE" ILIKE %s OR "MODEL" ILIKE %s OR "YEAR" ILIKE %s '
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
