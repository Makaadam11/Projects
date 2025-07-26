from flask import Flask
from flask_socketio import SocketIO
from chat.config.config import Config

socketio = SocketIO()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    socketio.init_app(app)
    return app