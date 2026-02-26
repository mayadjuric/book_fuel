import os
from flask import Blueprint, request, jsonify, g, json
from supabase import Client, ClientOptions, create_client
from config import supabase
from controllers.user_controller import calculate_burnout_points

user_blueprint = Blueprint("user_blueprint", __name__)

year_of_study_mapping = {
    "Freshman": 1,
    "Sophomore": 2,
    "Junior": 3,
    "Senior": 4,
    "Graduate": 5,
}

@user_blueprint.before_request
def setup_supabase_client():
    try:
        if request.method == "OPTIONS": # Handle preflight CORS requests
            print(f"Received OPTIONS request with headers: {request.headers}")
            response = make_response(jsonify({"status": "200", "message": "OK"}), 200)
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
            return response

        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase URL or Key not set in environment variables")
        auth_header = request.headers.get("Authorization")
        token = auth_header.split(" ")[1] if auth_header and " " in auth_header else None
        if not token:
            return jsonify({"status": "401", "message": "Unauthorized: Missing or invalid Authorization header"}), 401
        
        user_client = create_client(
            supabase_url,
            supabase_key,
            options=ClientOptions(headers={"Authorization": f"Bearer {token}"})
        )
        user_client.postgrest.auth(token)
        g.supabase_client = user_client
        print(f"Received request with the following headers: {request.headers}")
    except Exception as e:
        print(f"Error setting up Supabase client: {e}")
        return jsonify({"status": "500", "message": "Internal Server Error: Failed to set up database client"}), 500

@user_blueprint.route("/api/profile/<user_id>", methods = ["GET"])
def get_profile(user_id):
    response = g.supabase_client.table("User").select("*").eq("id", user_id).execute()
    return jsonify({"status": "200", "data": response.data})


@user_blueprint.route("/api/profile/<user_id>", methods = ["PUT"])
def update_profile(user_id):
    req = request.get_json()

    response = g.supabase_client.table("User").update(req).eq("id", user_id).execute()
    return jsonify(response.data), 200


# Create user profile
@user_blueprint.route("/api/profile", methods = ["POST"])
def add_new_user():
    req = request.get_json()
    username = req.get("username")
    study_year = req.get("year_of_study")
    number_of_courses = req.get("number_of_courses")
    work_hours_per_week = req.get("work_hours_per_week")
    commute_time_per_day = req.get("commute_time_per_day")
    student_athlete_flag = req.get("athlete_flag")

    response = (
        g.supabase_client.table("User")
        .insert(
            {
                "username": username,
                "year_of_study": year_of_study_mapping[study_year],
                "number_of_courses": number_of_courses,
                "work_hours_per_week": work_hours_per_week,
                "commute_time_per_day": commute_time_per_day,
                "athlete_flag": student_athlete_flag,
            }
        )
        .execute()
    )
    return jsonify(response.data), 201


@user_blueprint.route("/api/profile/<user_id>/burnout", methods = ["POST", "PUT"])
def calculate_burnout(user_id):
    burnout_points = calculate_burnout_points(user_id)
    if burnout_points is None:
        return jsonify({"status": "404", "message": "User not found"}), 404
    burnout_points = int(burnout_points)
    response = g.supabase_client.table("User").update({"total_burnout": burnout_points}).eq("id", user_id).execute()

    return jsonify({"status": "200", "burnout_points": burnout_points})