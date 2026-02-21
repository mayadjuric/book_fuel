from datetime import datetime
import os
from flask import Blueprint, request, make_response, jsonify
from supabase import create_client, Client

evaluation_blueprint = Blueprint("evaluation_blueprint", __name__)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@evaluation_blueprint.route("/api/evaluations/<a_id>", methods = ["POST"])
def add_evaluation(a_id):

    req = request.get_json()
    u_id = req.get("u_id")
    a_id = req.get("a_id")
    start_date = req.get("start_date")
    due_date = req.get("due_date")
    name = req.get("name")
    type = req.get("type")

    print( os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY"))

    burnout_weight = None
    response = (supabase.table("Evaluations").insert({
        "assignment_id": 3, "user_id": 23, "start_date": datetime.now().isoformat(), "due_date": datetime.now().isoformat(), "name": "COMP 200 Assignment 3", "type": "assignment", "burnout_weight": 0
        }).execute())


    print(f"The response is : {response}")
    return jsonify({"status": "200", "message": f"added evaluation {a_id}"})

