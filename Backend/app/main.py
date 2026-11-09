from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth_router import router as auth_router
from app.posts_router import router as posts_router

app = FastAPI(title="Desi on the Go API", version="1.0")

origins = [
    "https://clone-finless-hut.ngrok-free.dev",
    "http://localhost:8443"
]

# Setup CORS so your React frontend can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the authentication router
app.include_router(auth_router)
app.include_router(posts_router)

@app.get("/")
def root():
    return {"message": "Welcome to Desi on the Go API!"}