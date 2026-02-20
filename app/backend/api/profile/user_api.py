from flask import Blueprint, request, make_response, jsonify

user_blueprint = Blueprint("user_blueprint", __name__)

@user_blueprint.route("/api/profile/<user_id>", methods = ["GET", "POST"])
def get_profile(user_id):
    if request.method == "GET":
        return jsonify({"user_id": user_id})

    if request.method == "POST":
        return jsonify({"message": "Profile updated successfully"})