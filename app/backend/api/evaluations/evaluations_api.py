from datetime import datetime
import os
import json
from supabase import ClientOptions, create_client
from flask import Blueprint, request, make_response, jsonify, g
from config import supabase
from controllers.evaluation_controller import calculate_evaluation_burnout

evaluation_blueprint = Blueprint("evaluation_blueprint", __name__)


@evaluation_blueprint.before_request
def setup_supabase_client():
    try:
        if request.method == "OPTIONS": # Handle preflight CORS requests
            print(f"Received OPTIONS request with headers: {request.headers}")
            response = make_response(jsonify({"status": "200", "message": "OK"}), 200)
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
            return response 
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
                jsonify(
                    {
                        "status": "401",
                        "message": "Unauthorized: Missing or invalid Authorization header",
                    }
                ),
                401,
            )

        user_client = create_client(
            supabase_url,
            supabase_key,
            options=ClientOptions(headers={"Authorization": f"Bearer {token}"}),
        )
        user_client.postgrest.auth(token)
        g.supabase_client = user_client
        print(f"Received request with the following headers: {request.headers}")
    except Exception as e:
        print(f"Error setting up Supabase client: {e}")
        return (
            jsonify(
                {
                    "status": "500",
                    "message": "Internal Server Error: Failed to set up database client",
                }
            ),
            500,
        )

@evaluation_blueprint.route("/api/evaluations/<a_id>", methods = ["POST", "OPTIONS"])
def add_evaluation(a_id: int):
    req = request.get_json()
    
    assignment_id = req.get("assignment_id")
    start_date = req.get("start_date")
    due_date = req.get("due_date")
    name = req.get("name")
    type_ = req.get("type")
    difficulty = req.get("burnout_weight")

    response = (
        g.supabase_client.table("Evaluations")
        .insert(
            {
                # "user_id": user_id,
                "assignment_id": assignment_id,
                "start_date": start_date,
                "due_date": due_date,
                "name": name,
                "type": type_,
                "difficulty": difficulty
            }
        )
        .execute()
    )

    print(f"The response is : {response}")
    return jsonify({"status": "200", "message": f"added evaluation {assignment_id}"})

@evaluation_blueprint.route("/api/evaluations/<a_id>/calculate_burnout", methods = ["POST"])
def calculate_burnout(a_id):
    burnout_weight = calculate_evaluation_burnout(a_id)
    if burnout_weight is None:
        return jsonify({"status": "404", "message": "Evaluation not found"}), 404
    g.supabase_client.table("Evaluations").update({"burnout_weight": burnout_weight}).eq("assignment_id", a_id).execute()
    return jsonify({"status": "200", "burnout_weight": burnout_weight})
