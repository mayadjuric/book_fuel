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
    user_id = req.get("user_id")
    assignment_id = req.get("assignment_id")
    start_date = req.get("start_date")
    due_date = req.get("due_date")
    name = req.get("name")
    type_ = req.get("type")

    burnout_weight = None
    response = (
        supabase.table("Evaluations")
        .insert(
            {
                "assignment_id": assignment_id,
                "user_id": user_id,
                "start_date": start_date,
                "due_date": due_date,
                "name": name,
                "type_": type_,
                "burnout_weight": 0,
            }
        )
        .execute()
    )

    print(f"The response is : {response}")
    return jsonify({"status": "200", "message": f"added evaluation {assignment_id}"})
