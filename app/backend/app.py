import flask
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from api.profile.user_api import user_blueprint

app = flask.Flask(__name__)
app.register_blueprint(user_blueprint)
load_dotenv()

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.route("/")
def home():
	return "Welcome to BookFuel!"


if __name__ == "__main__":
	app.run(debug=True)
