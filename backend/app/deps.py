from fastapi import Depends, Header, HTTPException
from supabase import create_client
from .config import settings

db = create_client(settings.supabase_url, settings.supabase_service_role_key)

def current_user(authorization: str | None = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing bearer token")
    try:
        user = db.auth.get_user(authorization[7:]).user
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    if not user:
        raise HTTPException(401, "Invalid or expired token")
    return user

def org_ctx(user=Depends(current_user)):
    rows = db.table("memberships").select("org_id,role").eq("user_id", user.id).limit(1).execute().data
    if not rows:
        raise HTTPException(403, "no_organization")
    return {"user_id": user.id, "org_id": rows[0]["org_id"], "role": rows[0]["role"]}
