"""
Multi-Agent AI Execution and Resource Management System
Course: Operating Systems and Systems Programming (25CS2104E)
FastAPI Backend Application Entrypoint
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from simulation_engine import simulation_engine
from routes.auth_routes import router as auth_router
from routes.agent_routes import router as agent_router
from routes.process_routes import router as process_router
from routes.ipc_routes import router as ipc_router
from routes.resource_routes import router as resource_router
from routes.security_routes import router as security_router
from routes.sync_routes import router as sync_router
from routes.log_routes import router as log_router
from routes.backup_routes import router as backup_router
from routes.task_routes import router as task_router
from routes.system_routes import router as system_router

# Background task for realistic simulation tick
async def simulation_ticker():
    while True:
        try:
            simulation_engine.tick_simulation()
        except Exception as e:
            print(f"[Simulation Ticker Error] {e}")
        await asyncio.sleep(2.5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch simulation ticker
    ticker_task = asyncio.create_task(simulation_ticker())
    print("[FastAPI Kernel Bridge] Simulation loop started.")
    yield
    # Shutdown
    ticker_task.cancel()
    print("[FastAPI Kernel Bridge] Simulation loop stopped.")

app = FastAPI(
    title="Multi-Agent AI Execution and Resource Management System",
    description="OSSP (25CS2104E) Linux Multi-Agent Execution & Monitoring Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(auth_router)
app.include_router(agent_router)
app.include_router(process_router)
app.include_router(ipc_router)
app.include_router(resource_router)
app.include_router(security_router)
app.include_router(sync_router)
app.include_router(log_router)
app.include_router(backup_router)
app.include_router(task_router)
app.include_router(system_router)

@app.get("/")
def root():
    return {
        "system": "Multi-Agent AI Execution and Resource Management System",
        "course": "25CS2104E",
        "docs": "/docs",
        "status": "ONLINE"
    }

@app.get("/api/health")
def api_health():
    from os_bridge import os_bridge
    return {
        "status": "HEALTHY",
        "service": "OSSP Multi-Agent System Backend",
        "mode": os_bridge.get_mode(),
        "timestamp": os_bridge.get_status()["uptime"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
