from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.v1 import router

app = FastAPI(title="TestPilot AI API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins.split(","),
                   allow_methods=["*"], allow_headers=["Authorization", "Content-Type"])
app.include_router(router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}
