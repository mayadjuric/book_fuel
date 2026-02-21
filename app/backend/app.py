from dotenv import load_dotenv
load_dotenv()
import flask
from flask_cors import CORS
from config import supabase
import os

from api.profile.user_api import user_blueprint
from api.evaluations.evaluations_api import evaluation_blueprint



app = flask.Flask(__name__)
CORS(
	app,
	supports_credentials=True,
	origins=["http://localhost:5173"],
	methods=["GET", "POST", "OPTIONS"],
	allow_headers=["Content-Type", "Authorization"]
	)
app.register_blueprint(user_blueprint)

app.register_blueprint(evaluation_blueprint)


@app.route("/")
def home():
	return "Welcome to BookFuel!"


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=5100, debug=True)
