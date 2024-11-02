import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException
from starlette.responses import Response
from starlette.types import Scope

from src.database import initialize_db
from src.routers import items

debug = os.getenv("DEBUG", "false").lower() == "true"

api = FastAPI(debug=debug)

api.include_router(items.router)

@asynccontextmanager
async def lifespan(_: FastAPI):
  initialize_db()
  yield

app = FastAPI(
  lifespan=lifespan,
  docs_url=None,
  redoc_url=None,
  debug=debug
)

class SpaStaticFiles(StaticFiles):
  """
  Modified static files middleware designed to serve a React SPA
  """
  async def get_response(self, path: str, scope: Scope) -> Response:
    try:
      response = await super().get_response(path, scope)
    except HTTPException as e:
      if e.status_code == 404:
        response = await super().get_response(".", scope)
      else:
        raise e
    return response

app.mount("/api", api)

if not debug:
  app.mount("/", SpaStaticFiles(directory="static/", html=True))
