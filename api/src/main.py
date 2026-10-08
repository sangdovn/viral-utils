from fastapi import FastAPI

from src.systems.router import router as systems_router

app = FastAPI()


app.include_router(systems_router)
