import json
import os
import tempfile
from pathlib import Path

from fastapi import Body, FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware

ROOT = Path(__file__).resolve().parent.parent
CONTENT_PATH = ROOT / "data" / "content.json"

SESSION_SECRET = os.environ.get("SESSION_SECRET", "dev-change-me-in-production")
RESUME_ADMIN_PASSWORD = os.environ.get("RESUME_ADMIN_PASSWORD")

app = FastAPI()
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="lax",
    https_only=False,
    max_age=14 * 24 * 3600,
)


class LoginBody(BaseModel):
    password: str


def read_content() -> dict:
    if not CONTENT_PATH.is_file():
        raise HTTPException(status_code=404, detail="content.json missing")
    return json.loads(CONTENT_PATH.read_text(encoding="utf-8"))


def atomic_write(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=2)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), suffix=".tmp")
    tmp_path = Path(tmp)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        os.replace(tmp_path, path)
    except OSError:
        if tmp_path.exists():
            tmp_path.unlink()
        raise


@app.get("/api/auth/status")
async def auth_status(request: Request):
    return {"authenticated": bool(request.session.get("admin"))}


@app.post("/api/login")
async def login(request: Request, body: LoginBody):
    if not RESUME_ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="RESUME_ADMIN_PASSWORD not set on server")
    if body.password.strip() != RESUME_ADMIN_PASSWORD.strip():
        raise HTTPException(status_code=401, detail="Unauthorized")
    request.session["admin"] = True
    return {"ok": True}


@app.post("/api/logout")
async def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@app.get("/api/content")
async def get_content():
    return read_content()


@app.put("/api/content")
async def put_content(request: Request, data: dict = Body(...)):
    if not request.session.get("admin"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    atomic_write(CONTENT_PATH, data)
    return {"ok": True}


@app.middleware("http")
async def serve_custom_404(request: Request, call_next):
    response = await call_next(request)
    if response.status_code != 404:
        return response
    path404 = ROOT / "404.html"
    if not path404.is_file():
        return response
    accept = request.headers.get("accept", "")
    if "text/html" not in accept and "*/*" not in accept:
        return response
    return FileResponse(path404, status_code=404, media_type="text/html")


app.mount("/", StaticFiles(directory=str(ROOT), html=True), name="static")
