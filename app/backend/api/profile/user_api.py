from flask import Blueprint, request, make_response, jsonify
import os

from supabase import create_client, Client

user_blueprint = Blueprint("user_blueprint", __name__)\

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)


@user_blueprint.route("/api/profile/<user_id>", methods = ["GET", "POST"])
def profile(user_id):
    if request.method == "GET": # Return the user profile
        response = supabase.table("User").select("*").eq("id", user_id).execute()
        return jsonify({"status": "200", "data": response.data})

    if request.method == "POST": # Create a new user profile
        req = request.get_json()
        username = req.get("username")
        study_year = req.get("study_year")
        total_burnout = req.get("total_burnout")
        response = (
            supabase.table("User")
            .insert(
                {
                    "username": username,
                    "yearOfStudy": study_year,
                    "total_burnout": total_burnout,
                }
            )
            .execute()
        )

        return jsonify({"status": "200", "message": f"added user {username}"})
