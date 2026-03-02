import os
import datetime
import secrets
from flask import Blueprint, json, jsonify, make_response, redirect, request, g
from itsdangerous import BadSignature, BadTimeSignature, URLSafeTimedSerializer

from supabase import ClientOptions, create_client

# Google API client libraries
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from config import _get_supabase_service_client, _get_supabase_user_id_from_jwt


SCOPES = [
	"https://www.googleapis.com/auth/calendar.events.readonly",
]

calendar_blueprint = Blueprint("calendar_blueprint", __name__)

def _get_frontend_origin() -> str:
	return os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")


def _get_backend_origin() -> str:
	# Must match what your Flask app actually runs on and what you register
	# as an Authorized redirect URI in Google Cloud Console.
	return os.getenv("BACKEND_ORIGIN", "http://localhost:5100")


def _get_google_client_secrets_file() -> str:
	# Use a path relative to this file so it works regardless of cwd.
	default_path = os.path.join(
		os.path.dirname(__file__), "..", "..", "credentials.json"
	)
	return os.getenv("GOOGLE_CLIENT_SECRETS_FILE", default_path)


def _get_state_serializer() -> URLSafeTimedSerializer:
	secret = os.getenv("OAUTH_STATE_SECRET") or os.getenv("FLASK_SECRET_KEY")
	if not secret:
		raise RuntimeError(
			"Missing OAUTH_STATE_SECRET (or FLASK_SECRET_KEY). Needed to sign OAuth state."
		)
	return URLSafeTimedSerializer(secret_key=secret, salt="bookfuel-google-oauth")


@calendar_blueprint.before_request
def setup_supabase_client():
	try:
		if request.method == "OPTIONS":  # Handle preflight CORS requests
			response = make_response(jsonify({"status": "200", "message": "OK"}), 200)
			response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
			response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			response.headers.add(
				"Access-Control-Allow-Headers", "Content-Type, Authorization"
			)
			return response

		# The callback must validate using the signed `state`.
		if request.path == "/api/calendar/callback":
			return None

		supabase_url = os.getenv("SUPABASE_URL")
		supabase_key = os.getenv("SUPABASE_KEY")
		if not supabase_url or not supabase_key:
			raise ValueError("Supabase URL or Key not set in environment variables")
		auth_header = request.headers.get("Authorization")

		token = (
			auth_header.split(" ")[1] if auth_header and " " in auth_header else None
		)
		if not token:
			return (
				jsonify({
						"status": "401",
						"message": "Unauthorized: Missing or invalid Authorization header",
				}),
				401
			)

		user_client = create_client(
			supabase_url,
			supabase_key,
			options=ClientOptions(headers={"Authorization": f"Bearer {token}"}),
		)
		user_client.postgrest.auth(token)
		g.supabase_client = user_client
		g.supabase_token = token
	except Exception as e:
		print(f"Error setting up Supabase client: {e}")
		return (
			jsonify({
					"status": "500",
					"message": "Internal Server Error: Failed to set up database client",
			}),
			500,
		)


@calendar_blueprint.route("/api/calendar/auth")
def calendar_auth():
	user_id = _get_supabase_user_id_from_jwt(g.supabase_token)

	serializer = _get_state_serializer()
	signed_state = serializer.dumps(
		{
			"uid": user_id,
			"nonce": secrets.token_urlsafe(16),
		}
	)

	flow = Flow.from_client_secrets_file(
		_get_google_client_secrets_file(),
		scopes=SCOPES,
		redirect_uri=f"{_get_backend_origin()}/api/calendar/callback",
	)
	auth_url, _= flow.authorization_url(
		prompt="consent",
		access_type="offline",
		state=signed_state,
	)
	return jsonify({"auth_url": auth_url}), 200


@calendar_blueprint.route("/api/calendar/callback", methods = ["GET"])
def calendar_callback():
    code = request.args.get("code")
    state = request.args.get("state")
    if not code or not state:
        return jsonify({"status": "400", "message": "Missing code or state"}), 400

    serializer = _get_state_serializer()
    try:
        payload = serializer.loads(state, max_age=10 * 60)
    except (BadTimeSignature, BadSignature):
        return jsonify({"status": "400", "message": "Invalid or expired state"}), 400

    user_id = payload.get("uid")
    if not user_id:
        return jsonify({"status": "400", "message": "State missing uid"}), 400

    flow = Flow.from_client_secrets_file(
		_get_google_client_secrets_file(),
		scopes=SCOPES,
		redirect_uri=f"{_get_backend_origin()}/api/calendar/callback",
	)
    flow.fetch_token(code=code)
    creds = flow.credentials

    service_client = _get_supabase_service_client()
    service_client.table("google_calendar_connections").upsert(
		{
			"user_id": user_id,
			"provider": "google",
			"scopes": SCOPES,
			# "access_token": creds.token,
			"refresh_token": creds.refresh_token,
			"expires_at": (
				getattr(creds, "expiry", None).isoformat()
				if getattr(creds, "expiry", None)
				else None
			),
		},
		on_conflict="user_id",
	).execute()

    # Redirect user to the frontend OAuth success page so the popup can notify the opener
    return redirect(f"{_get_frontend_origin()}/oauth-success")


@calendar_blueprint.route("/api/calendar/events")
def get_calendar_events():
    user_id = _get_supabase_user_id_from_jwt(g.supabase_token)
    suid = _get_supabase_service_client()
    conn = (
		suid.table("google_calendar_connections")
		.select("refresh_token")
		.eq("user_id", user_id)
		.limit(1)
		.single()
		.execute()
	)

    if not conn:
        return jsonify({"status": "400", "message": "No refresh token found for user"}), 400

    if not conn.data:
        return jsonify({"status": "400", "message": "No refresh token found for user"}), 400

    client_id = os.getenv("GCP_CLIENT_ID")
    client_secret = os.getenv("GCP_CLIENT_SECRET")

    creds = Credentials(
		token=None,
		refresh_token=conn.data.get("refresh_token"),
		client_id=client_id,
		client_secret=client_secret,
		token_uri="https://oauth2.googleapis.com/token",
		scopes=SCOPES,
	)

    creds.refresh(Request())

    service = build("calendar", "v3", credentials=creds)

    now = datetime.datetime.now(tz=datetime.timezone.utc).isoformat()
    print('Getting the upcoming 10 events')
    events_result = (
		service.events()
		.list(
			calendarId="primary",
			timeMin=now,
			maxResults=10,
			singleEvents=True,
			orderBy="startTime",
		)
		.execute()
	)
    events = events_result.get("items", [])

    if not events:
        print("No upcoming events found.")
        return jsonify({"status": "200", "events": []}), 200

    for ev in events:
        print(f"Event: {ev.get('summary')} at {ev.get('start', {}).get('dateTime', ev.get('start', {}).get('date'))}")

    return make_response(jsonify({
		"status": "200",
		"connected": True,
		"events": events,
	}))


@calendar_blueprint.route("/api/calendar/status")
def calendar_status():
    user_id = _get_supabase_user_id_from_jwt(g.supabase_token)
    suid = _get_supabase_service_client()
    conn = (
        suid.table("google_calendar_connections")
        .select("refresh_token")
        .eq("user_id", user_id)
        .limit(1)
        .single()
        .execute()
    )

    if not conn or not conn.data:
        return jsonify({"status": "200", "connected": False}), 200

    return jsonify({"status": "200", "connected": True}), 200
