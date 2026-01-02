from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.config.database import engine, Base
from apps.routes.user import router as user_router
from apps.routes.machine import router as machine_router
from apps.routes.auth import router as auth_router

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Game Cloud Gaming API",
    description="API for Game Cloud Gaming platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(machine_router)

@app.get("/")
def root():
    return {"message": "Welcome to Game Cloud Gaming API"}
