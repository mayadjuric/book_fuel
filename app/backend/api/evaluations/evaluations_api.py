from datetime import datetime
import os
from flask import Blueprint, request, make_response, jsonify
from config import supabase
from controllers.evaluation_controller import calculate_evaluation_burnout

evaluation_blueprint = Blueprint("evaluation_blueprint", __name__)




@evaluation_blueprint.route("/api/evaluations/<a_id>", methods = ["POST"])
def add_evaluation(a_id):
    req = request.get_json()
    user_id = req.get("user_id")
    assignment_id = req.get("assignment_id")
    start_date = req.get("start_date")
    due_date = req.get("due_date")
    name = req.get("name")
    type_ = req.get("type")
    difficulty = req.get("difficulty")

    response = (
        supabase.table("Evaluations")
        .insert(
            {
                "assignment_id": assignment_id,
                "user_id": user_id,
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
    supabase.table("Evaluations").update({"burnout_weight": burnout_weight}).eq("assignment_id", a_id).execute()
    return jsonify({"status": "200", "burnout_weight": burnout_weight})