import logging

from fastapi import APIRouter, FastAPI, Request, status
from fastapi.responses import JSONResponse

from src.exceptions import AppException
from src.systems.router import router as system_router

logger = logging.getLogger(__name__)

app = FastAPI(title="Viral Utils")


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, error: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code, content={"detail": error.content}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, error: Exception) -> JSONResponse:
    logger.error(
        "Unhandled exception for %s %s",
        request.method,
        request.url.path,
        exc_info=(type(error), error, error.__traceback__),
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error."},
    )


api_router = APIRouter(prefix="/api")
app.include_router(api_router)
api_router.include_router(system_router)
