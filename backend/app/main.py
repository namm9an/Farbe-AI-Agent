import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.lib.db import init_db
from app.routes.analyze import router as analyze_router

app = FastAPI(title="Farbe AI Agent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "host": os.environ.get("HOST", "0.0.0.0")}
