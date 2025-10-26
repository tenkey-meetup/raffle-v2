from pathlib import Path
from settings import DATA_PATH

Path(DATA_PATH).mkdir(parents=True, exist_ok=True)


from flask import Flask
from blueprints.Participants import api_v1_participants
from blueprints.Prizes import api_v1_prizes
from blueprints.Raffle import api_v1_raffle


flask_app = Flask(__name__)
flask_app.register_blueprint(api_v1_participants)
flask_app.register_blueprint(api_v1_prizes)
flask_app.register_blueprint(api_v1_raffle)


if __name__ == "__main__":
    flask_app.run(host='0.0.0.0', port=6001)
