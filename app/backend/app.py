from dotenv import load_dotenv
load_dotenv()
import flask
import os
from supabase import create_client, Client
from api.profile.user_api import user_blueprint
from api.evaluations.evaluations_api import evaluation_blueprint



app = flask.Flask(__name__)
app.register_blueprint(user_blueprint)

app.register_blueprint(evaluation_blueprint)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.route("/")
def home():
	return "Welcome to BookFuel!"


if __name__ == "__main__":
	app.run(debug=True)
