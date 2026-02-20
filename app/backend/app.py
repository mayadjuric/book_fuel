import flask
from dotenv import load_dotenv

app = flask.Flask(__name__)
load_dotenv()

@app.route("/")
def home():
	return "Welcome to BookFuel!"

if __name__ == "__main__":
	app.run(debug=True)
