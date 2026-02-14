from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routers import opportunities, scoring, sandbox, governance

app = FastAPI(title="MacroHelix AI Impl Prototype", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(opportunities.router, prefix="/api/v1/opportunities", tags=["opportunities"])
app.include_router(scoring.router, prefix="/api/v1/scoring", tags=["scoring"])
app.include_router(sandbox.router, prefix="/api/v1/sandbox", tags=["sandbox"])
app.include_router(governance.router, prefix="/api/v1/governance", tags=["governance"])

@app.get("/healthz")
def health():
    return {"status": "ok"}
