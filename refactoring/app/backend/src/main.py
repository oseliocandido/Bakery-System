from src.routers import users, attendance

from fastapi import FastAPI, APIRouter


# Routers
api_router = APIRouter(prefix="/api")
api_router.include_router(users.router)
api_router.include_router(attendance.router)

# EntryPoint
app = FastAPI()
app.include_router(api_router)

@app.get("/")
def welcome():
    return {"message": "Welcome to Bakery API!"}
