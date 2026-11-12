from datetime import datetime, timezone
from typing import Literal
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from ..deps import db, current_user, org_ctx

router = APIRouter()

def _check_url(v: str | None):
    if v is None or v == "":
        return None
    p = urlparse(v)
    if p.scheme not in ("http", "https") or not p.hostname:
        raise ValueError("URL must start with http:// or https://")
    return v

class OrgIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)

class ProjectIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(None, max_length=2000)
    base_url: str | None = None
    _v = field_validator("base_url")(lambda cls, v: _check_url(v))

class ProjectPatch(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=120)
    description: str | None = Field(None, max_length=2000)
    base_url: str | None = None
    _v = field_validator("base_url")(lambda cls, v: _check_url(v))

class EnvIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    url: str
    kind: Literal["dev", "qa", "staging", "prod"] = "qa"
    _v = field_validator("url")(lambda cls, v: _check_url(v))

@router.get("/me")
def me(user=Depends(current_user)):
    m = db.table("memberships").select("role, organizations(id,name,plan)").eq("user_id", user.id).execute().data
    return {"id": user.id, "email": user.email, "memberships": m}

@router.post("/orgs", status_code=201)
def create_org(body: OrgIn, user=Depends(current_user)):
    if db.table("memberships").select("id").eq("user_id", user.id).execute().data:
        raise HTTPException(409, "User already belongs to an organization")
    org = db.table("organizations").insert({"name": body.name, "created_by": user.id}).execute().data[0]
    db.table("memberships").insert({"org_id": org["id"], "user_id": user.id, "role": "owner"}).execute()
    return org

def _own(project_id: str, ctx):
    r = db.table("projects").select("*").eq("id", project_id).eq("org_id", ctx["org_id"]).execute().data
    if not r:
        raise HTTPException(404, "Project not found")
    return r[0]

@router.get("/projects")
def list_projects(ctx=Depends(org_ctx)):
    return db.table("projects").select("*").eq("org_id", ctx["org_id"]).order("created_at", desc=True).execute().data

@router.post("/projects", status_code=201)
def create_project(body: ProjectIn, ctx=Depends(org_ctx)):
    row = {**body.model_dump(), "org_id": ctx["org_id"], "created_by": ctx["user_id"]}
    return db.table("projects").insert(row).execute().data[0]

@router.get("/projects/{pid}")
def get_project(pid: str, ctx=Depends(org_ctx)):
    p = _own(pid, ctx)
    p["environments"] = db.table("project_environments").select("*").eq("project_id", pid).execute().data
    return p

@router.patch("/projects/{pid}")
def update_project(pid: str, body: ProjectPatch, ctx=Depends(org_ctx)):
    _own(pid, ctx)
    patch = body.model_dump(exclude_unset=True)
    if not patch:
        raise HTTPException(400, "Nothing to update")
    patch["updated_at"] = datetime.now(timezone.utc).isoformat()
    return db.table("projects").update(patch).eq("id", pid).execute().data[0]

@router.delete("/projects/{pid}", status_code=204)
def delete_project(pid: str, ctx=Depends(org_ctx)):
    if ctx["role"] not in ("owner", "admin"):
        raise HTTPException(403, "Only owners and admins can delete projects")
    _own(pid, ctx)
    db.table("projects").delete().eq("id", pid).execute()

@router.post("/projects/{pid}/environments", status_code=201)
def add_env(pid: str, body: EnvIn, ctx=Depends(org_ctx)):
    _own(pid, ctx)
    return db.table("project_environments").insert({**body.model_dump(), "project_id": pid}).execute().data[0]

@router.delete("/projects/{pid}/environments/{eid}", status_code=204)
def delete_env(pid: str, eid: str, ctx=Depends(org_ctx)):
    _own(pid, ctx)
    db.table("project_environments").delete().eq("id", eid).eq("project_id", pid).execute()

@router.get("/dashboard")
def dashboard(ctx=Depends(org_ctx)):
    """Real counts only. Test-case/run metrics are added in Phases 2 and 5."""
    projects = db.table("projects").select("id,name,base_url,created_at", count="exact") \
        .eq("org_id", ctx["org_id"]).order("created_at", desc=True).limit(5).execute()
    return {"total_projects": projects.count or 0, "recent_projects": projects.data}
