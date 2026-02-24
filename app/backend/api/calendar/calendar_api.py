import os
from flask import jsonify, Blueprint, request, g, json
from supabase import Client, ClientOptions, create_client

calendar_blueprint = Blueprint("calendar_blueprint", __name__)

@calendar_blueprint.route("/api/calendar/callback", methods = ["GET"])
def calendar_callback():
	return jsonify({"status": "200", "message": "Calendar callback received!"})


@calendar_blueprint.route("/api/calendar/events")
def get_calendar_events():
	return jsonify({"status": "200", "events": []})