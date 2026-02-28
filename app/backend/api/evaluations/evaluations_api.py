import os
import json
from datetime import datetime
from postgrest import APIError
from supabase import ClientOptions, create_client
from postgrest.base_request_builder import APIResponse
from flask import Blueprint, request, make_response, jsonify, g

from config import _get_supabase_user_id_from_jwt, supabase
from controllers.evaluation_controller import calculate_evaluation_burnout
from services.evaluation_services import suggest_types_for_names

evaluation_blueprint = Blueprint("evaluation_blueprint", __name__)

UNIQUE_CONSTRAINT_ERROR = "23505"

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
        g.supabase_token = token
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

@evaluation_blueprint.route("/api/evaluations/suggest-types", methods=["POST", "OPTIONS"])
def suggest_types():
    req = request.get_json() or {}
    names = req.get("names", [])
    if not isinstance(names, list):
        names = []
    suggestions = suggest_types_for_names(names)
    return jsonify({"status": "200", "suggestions": suggestions}), 200


@evaluation_blueprint.route("/api/evaluations/", methods = ["POST", "OPTIONS"])
def add_evaluation():
    req = request.get_json()
    
    start_date = req.get("start_date")
    due_date = req.get("due_date")
    name = req.get("name")
    type_ = req.get("type")
    difficulty = req.get("burnout_weight")
    
    try:
        response: APIResponse = (
            g.supabase_client.table("Evaluations")
            .insert(
                {
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
        return jsonify({"status": "200", "message": f"added evaluation {name}"})
    except APIError as apie:
        if apie.code == UNIQUE_CONSTRAINT_ERROR:
            print(f'ERROR: Unique constraint violation for the given evaluation. Details: {apie.details}')
            return jsonify({"status": "409", "message": "Conflict: You may have already added an evaluation for this evaluation"}), 409
        print(f"API error occurred: {apie.code} - {apie.message}")
        return jsonify({"status": "400", "message": f"Bad Request: {str(apie)}"}), 400
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return jsonify({"status": "500", "message": f"Internal Server Error: {str(e)}"}), 500


@evaluation_blueprint.route("/api/evaluations/", methods = ["GET"])
def get_evaluations():
    # req = request.get_json()
    print(f"Received request to get evaluations")
    user_id = _get_supabase_user_id_from_jwt(g.supabase_token)
    try:
        response = (
            g.supabase_client.table("Evaluations")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
    except Exception as e:
        print(f"Error fetching evaluations for user_id {user_id}: {e}")
        return jsonify({"status": "500", "message": f"Internal Server Error: {str(e)}"}), 500
    return jsonify({"status": "200", "data": response.data}), 200


@evaluation_blueprint.route("/api/evaluations/<a_id>/calculate_burnout", methods = ["POST"])
def calculate_burnout(a_id):
    burnout_weight = calculate_evaluation_burnout(a_id)
    if burnout_weight is None:
        return jsonify({"status": "404", "message": "Evaluation not found"}), 404
    g.supabase_client.table("Evaluations").update({"burnout_weight": burnout_weight}).eq("assignment_id", a_id).execute()
    return jsonify({"status": "200", "burnout_weight": burnout_weight})
