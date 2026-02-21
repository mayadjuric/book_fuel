from flask import Blueprint, request, jsonify
from config import supabase
from controllers.user_controller import calculate_burnout_points

user_blueprint = Blueprint("user_blueprint", __name__)


@user_blueprint.route("/api/profile/<user_id>", methods = ["GET"])
def get_profile(user_id):
    response = supabase.table("User").select("*").eq("id", user_id).execute()
    return jsonify({"status": "200", "data": response.data})

# Create user profile
@user_blueprint.route("/api/profile", methods = ["POST"])
def add_new_user():
    req = request.get_json()
    username = req.get("username")
    study_year = req.get("study_year")
    number_of_courses = req.get("number_of_courses")
    work_hours_per_week = req.get("work_hours_per_week")
    commute_time_per_day = req.get("commute_time_per_day")
    student_athlete_flag = req.get("student_athlete_flag")
    response = (
        supabase.table("User")
        .insert(
            {
                "username": username,
                "year_of_study": study_year,
                "number_of_courses": number_of_courses,
                "work_hours_per_week": work_hours_per_week,
                "commute_time_per_day": commute_time_per_day,
                "athlete_flag": student_athlete_flag,
            }
        )
        .execute()
    )
    return jsonify(response.data), 201


@user_blueprint.route("/api/profile/<user_id>/burnout", methods = ["POST"])
def calculate_burnout(user_id):
    burnout_points = calculate_burnout_points(user_id)
    if burnout_points is None:
        return jsonify({"status": "404", "message": "User not found"}), 404
    burnout_points = int(burnout_points)
    supabase.table("User").update({"total_burnout": burnout_points}).eq("id", user_id).execute()
    return jsonify({"status": "200", "burnout_points": burnout_points})