from fastapi import FastAPI, APIRouter
from src.routers import users, attendance
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="OC & SM API")
# CORS Configuration
origins = [
    "http://localhost:8000",  # Allow frontend running on port 5500
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allowed frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize API Router with a prefix
api_router = APIRouter(prefix="/api")

# Include the routers
api_router.include_router(users.router)
api_router.include_router(attendance.router)

# Add /welcome route to api_router
@api_router.get("/welcome")
def welcome():
    return {"message": "Welcome to Bakery API"}

# Include the API router in the FastAPI app
app.include_router(api_router)
