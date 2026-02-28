import os
from dotenv import load_dotenv
import requests
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)


def _get_supabase_user_id_from_jwt(token: str) -> str:
    """Resolve Supabase user id from a Supabase access token."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_KEY")
    if not supabase_url or not supabase_anon_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_KEY not set")

    resp = requests.get(
        f"{supabase_url}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": supabase_anon_key,
        },
        timeout=10,
    )
    try:
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching Supabase user: {e}")
        raise RuntimeError("Failed to fetch Supabase user details")
    data = resp.json()
    user_id = data.get("id")
    if not user_id:
        raise RuntimeError("Supabase /auth/v1/user response missing id")
    return user_id


def _get_supabase_service_client():
    """Service-role client for server-side token storage."""
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        raise RuntimeError(
            "Missing SUPABASE_SERVICE_ROLE_KEY. Needed to store Google tokens from the OAuth callback."
        )
    return create_client(supabase_url, service_key)
