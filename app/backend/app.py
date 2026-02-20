import flask
from dotenv import load_dotenv
from api.profile.user_api import user_blueprint

app = flask.Flask(__name__)
app.register_blueprint(user_blueprint)
load_dotenv()

@app.route("/")
def home():
	return "Welcome to BookFuel!"


if __name__ == "__main__":
	app.run(debug=True)
