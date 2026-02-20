from flask import Blueprint, request, make_response, jsonify


user_blueprint = Blueprint("user_blueprint", __name__)

@user_blueprint.route("/api/profile/<user_id>", methods = ["GET", "POST"])
def profile(user_id):
    if request.method == "GET": # Return the user profile
        return jsonify()

    if request.method == "POST": # Create a new user profile
        return jsonify({"message": "Profile created successfully"})
    
    
    
